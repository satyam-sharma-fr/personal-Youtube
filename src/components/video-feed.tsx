"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { VideoCard } from "./video-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getVideosFromChannels, type Video } from "@/lib/youtube";
import { RefreshCw, Loader2, Film, Plus } from "lucide-react";
import { toast } from "sonner";

const VIDEOS_PER_LOAD = 12;

export function VideoFeed() {
  const channels = useQuery(api.channels.getUserChannels);
  const watchedVideoIds = useQuery(api.watched.getWatchedVideoIds);
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayCount, setDisplayCount] = useState(VIDEOS_PER_LOAD);
  const [hasMore, setHasMore] = useState(true);

  const fetchVideos = useCallback(async (channelIds: string[], refresh = false) => {
    if (channelIds.length === 0) {
      setVideos([]);
      setIsLoading(false);
      return;
    }

    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const fetchedVideos = await getVideosFromChannels(channelIds, 10);
      setVideos(fetchedVideos);
      setHasMore(fetchedVideos.length > displayCount);
      
      if (refresh) {
        toast.success("Feed refreshed!");
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("Failed to load videos");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [displayCount]);

  useEffect(() => {
    if (channels !== undefined) {
      const channelIds = channels.map((c) => c.channelId);
      fetchVideos(channelIds);
    }
  }, [channels, fetchVideos]);

  const handleRefresh = () => {
    if (channels) {
      const channelIds = channels.map((c) => c.channelId);
      fetchVideos(channelIds, true);
    }
  };

  const loadMore = () => {
    const newCount = displayCount + VIDEOS_PER_LOAD;
    setDisplayCount(newCount);
    setHasMore(videos.length > newCount);
  };

  // Loading state
  if (isLoading || channels === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <VideoSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state - no channels
  if (channels.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Film className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">No channels yet</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Add your favorite YouTube channels to start building your distraction-free feed.
        </p>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Your First Channel
        </Button>
      </motion.div>
    );
  }

  // Empty state - no videos
  if (videos.length === 0 && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <Film className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">No videos found</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Your channels don&apos;t have any recent videos, or there was an issue loading them.
        </p>
        <Button variant="outline" onClick={handleRefresh} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </motion.div>
    );
  }

  const displayedVideos = videos.slice(0, displayCount);
  const watchedSet = new Set(watchedVideoIds || []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your Feed</h1>
          <p className="text-muted-foreground">
            {videos.length} videos from {channels.length} channels
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          {isRefreshing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {displayedVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <VideoCard 
                video={video} 
                isWatched={watchedSet.has(video.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Load More */}
      {hasMore && displayedVideos.length < videos.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center pt-8"
        >
          <Button variant="outline" size="lg" onClick={loadMore} className="gap-2">
            Load More Videos
          </Button>
        </motion.div>
      )}
    </div>
  );
}

function VideoSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-video rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

