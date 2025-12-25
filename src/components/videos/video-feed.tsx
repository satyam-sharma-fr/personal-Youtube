"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { VideoCard } from "./video-card";
import { VideoSkeletonGrid } from "./video-skeleton";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, RefreshCw } from "lucide-react";
import { getFeed } from "@/app/actions/videos";
import { refreshAllChannels } from "@/app/actions/channels";
import { toast } from "sonner";

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
}

export function VideoFeed({ initialVideos, initialHasMore, initialNextCursor }: VideoFeedProps) {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !nextCursor) return;

    setIsLoading(true);
    try {
      const result = await getFeed({ cursor: nextCursor, limit: 20 });
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
  }, [isLoading, hasMore, nextCursor]);

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
      const refreshResult = await refreshAllChannels();
      if (refreshResult.error) {
        toast.error(refreshResult.error);
      } else {
        toast.success(`Refreshed ${refreshResult.count} videos`);
        
        // Reload feed
        const feedResult = await getFeed({ limit: 20 });
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
          Refresh Feed
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

