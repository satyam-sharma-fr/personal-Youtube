"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { VideoCard } from "./video-card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, RefreshCw } from "lucide-react";
import { getFeed } from "@/app/actions/videos";
import { refreshAllChannels, refreshChannelVideos } from "@/app/actions/channels";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type Video = {
  id: string;
  video_id: string;
  channel_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  thumbnail_high_url: string | null;
  published_at: string;
  duration: string | null;
  view_count: string | null;
  like_count: string | null;
  watched: boolean;
  progress_seconds: number;
  completed: boolean;
  inWatchLater?: boolean;
  youtube_channels: {
    title: string;
    thumbnail_url: string | null;
    custom_url: string | null;
  } | null;
};

interface VideoFeedProps {
  initialVideos: Video[];
  initialHasMore: boolean;
  initialNextCursor: string | null;
  channelId?: string;
  categoryId?: string;
}

export function VideoFeed({ 
  initialVideos, 
  initialHasMore, 
  initialNextCursor,
  channelId,
  categoryId,
}: VideoFeedProps) {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Reset state when channelId or categoryId changes (i.e., when navigating between filters)
  useEffect(() => {
    setVideos(initialVideos);
    setHasMore(initialHasMore);
    setNextCursor(initialNextCursor);
  }, [initialVideos, initialHasMore, initialNextCursor, channelId, categoryId]);

  // Set up realtime subscriptions for live updates
  useEffect(() => {
    const supabase = createClient();

    // Subscribe to new videos being added
    const videosChannel = supabase
      .channel("videos-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "youtube_videos",
        },
        async () => {
          // Refresh feed to get the new video with proper channel info
          const result = await getFeed({ limit: 20, channelId, categoryId });
          if (result.videos) {
            setVideos(result.videos as Video[]);
            setHasMore(result.hasMore);
            setNextCursor(result.nextCursor);
            toast.success("New video added to your feed!");
          }
        }
      )
      .subscribe();

    // Subscribe to video state changes (watched/unwatched)
    const stateChannel = supabase
      .channel("video-state-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_video_state",
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newState = payload.new as { video_id: string; watched: boolean; progress_seconds: number; completed: boolean };
            setVideos((prev) =>
              prev.map((video) =>
                video.video_id === newState.video_id
                  ? {
                      ...video,
                      watched: newState.watched,
                      progress_seconds: newState.progress_seconds,
                      completed: newState.completed,
                    }
                  : video
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(videosChannel);
      supabase.removeChannel(stateChannel);
    };
  }, [channelId, categoryId]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !nextCursor) return;

    setIsLoading(true);
    try {
      const result = await getFeed({ cursor: nextCursor, limit: 20, channelId, categoryId });
      if (result.error) {
        toast.error(result.error);
      } else if (result.videos) {
        setVideos((prev) => [...prev, ...result.videos as Video[]]);
        setHasMore(result.hasMore);
        setNextCursor(result.nextCursor);
      }
    } catch {
      toast.error("Failed to load more videos");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, nextCursor, channelId, categoryId]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    const current = loadMoreRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [loadMore, hasMore, isLoading]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // If filtering by channel, refresh just that channel; otherwise refresh all
      const refreshResult = channelId 
        ? await refreshChannelVideos(channelId)
        : await refreshAllChannels();
      
      if (refreshResult.error) {
        toast.error(refreshResult.error);
      } else {
        toast.success(`Refreshed ${refreshResult.count} videos`);
        
        // Reload feed
        const feedResult = await getFeed({ limit: 20, channelId, categoryId });
        if (feedResult.videos) {
          setVideos(feedResult.videos as Video[]);
          setHasMore(feedResult.hasMore);
          setNextCursor(feedResult.nextCursor);
        }
      }
    } catch {
      toast.error("Failed to refresh feed");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div>
      {/* Refresh button */}
      <div className="flex justify-end mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh {channelId ? "Channel" : categoryId ? "Category" : "Feed"}
        </Button>
      </div>

      {/* Video grid */}
      <AnimatePresence mode="popLayout">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          layout
        >
          {videos.map((video, index) => (
            <VideoCard key={video.id} video={video} index={index} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty state when no videos */}
      {videos.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">
            No videos found. Try refreshing to fetch the latest content.
          </p>
          <Button variant="outline" className="mt-4" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      )}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-8">
        {isLoading && (
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {!hasMore && videos.length > 0 && (
          <p className="text-center text-muted-foreground text-sm">
            You&apos;ve reached the end of your feed
          </p>
        )}

        {hasMore && !isLoading && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={loadMore}>
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
