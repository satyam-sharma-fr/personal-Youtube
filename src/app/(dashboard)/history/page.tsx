"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getWatchHistory, getContinueWatching } from "@/app/actions/videos";
import { formatDuration } from "@/lib/youtube";
import { formatDistanceToNow } from "date-fns";
import { formatWatchTime } from "@/components/watch-timer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  History, 
  Play, 
  Clock, 
  Check, 
  PlayCircle,
  ChevronRight,
  Video,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

type HistoryVideo = {
  video_id: string;
  watched_at: string | null;
  last_watched_at: string | null;
  first_watched_at: string | null;
  progress_seconds: number | null;
  total_watched_seconds: number | null;
  completed: boolean | null;
  watch_count: number | null;
  video: {
    video_id: string;
    title: string;
    thumbnail_url: string | null;
    thumbnail_high_url: string | null;
    duration: string | null;
    channel_id: string;
    youtube_channels: {
      channel_id: string;
      title: string;
      thumbnail_url: string | null;
    } | null;
  } | null;
};

type ContinueWatchingVideo = {
  video_id: string;
  progress_seconds: number | null;
  total_watched_seconds: number | null;
  last_watched_at: string | null;
  video: {
    video_id: string;
    title: string;
    thumbnail_url: string | null;
    thumbnail_high_url: string | null;
    duration: string | null;
    channel_id: string;
    youtube_channels: {
      channel_id: string;
      title: string;
      thumbnail_url: string | null;
    } | null;
  } | null;
};

// Parse ISO 8601 duration to seconds
function parseDuration(duration: string | null): number {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");
  return hours * 3600 + minutes * 60 + seconds;
}

function ContinueWatchingCard({ item }: { item: ContinueWatchingVideo }) {
  if (!item.video) return null;
  
  const progress = item.progress_seconds || 0;
  const duration = parseDuration(item.video.duration);
  const progressPercent = duration > 0 ? Math.min((progress / duration) * 100, 100) : 0;
  
  return (
    <Link href={`/watch/${item.video_id}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="group relative flex-shrink-0 w-72 rounded-xl overflow-hidden border border-border/50 bg-card hover:border-primary/50 transition-colors"
      >
        {/* Thumbnail */}
        <div className="relative aspect-video">
          <Image
            src={item.video.thumbnail_high_url || item.video.thumbnail_url || "/placeholder.jpg"}
            alt={item.video.title}
            fill
            className="object-cover"
            sizes="288px"
          />
          {/* Progress bar overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <div 
              className="h-full bg-primary"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <PlayCircle className="w-12 h-12 text-white" />
          </div>
          {/* Duration badge */}
          {item.video.duration && (
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-xs text-white font-medium">
              {formatDuration(item.video.duration)}
            </div>
          )}
        </div>
        {/* Info */}
        <div className="p-3">
          <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {item.video.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{item.video.youtube_channels?.title}</span>
            <span className="flex items-center gap-1">
              <Play className="w-3 h-3" />
              {formatWatchTime(progress)} watched
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function HistoryCard({ item, index }: { item: HistoryVideo; index: number }) {
  if (!item.video) return null;
  
  const lastWatched = item.last_watched_at || item.watched_at;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link href={`/watch/${item.video_id}`}>
        <div className="group flex gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
          {/* Thumbnail */}
          <div className="relative w-40 sm:w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={item.video.thumbnail_high_url || item.video.thumbnail_url || "/placeholder.jpg"}
              alt={item.video.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="192px"
            />
            {/* Duration badge */}
            {item.video.duration && (
              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-xs text-white font-medium">
                {formatDuration(item.video.duration)}
              </div>
            )}
            {/* Completed badge */}
            {item.completed && (
              <div className="absolute top-1 left-1">
                <Badge variant="secondary" className="bg-emerald-500/90 text-white text-xs px-1.5 py-0">
                  <Check className="w-3 h-3 mr-0.5" />
                  Completed
                </Badge>
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0 py-1">
            <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
              {item.video.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {item.video.youtube_channels?.title}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
              {lastWatched && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(lastWatched), { addSuffix: true })}
                </span>
              )}
              {item.total_watched_seconds && item.total_watched_seconds > 0 && (
                <span className="flex items-center gap-1">
                  <Play className="w-3 h-3" />
                  {formatWatchTime(item.total_watched_seconds)} watched
                </span>
              )}
              {item.watch_count && item.watch_count > 1 && (
                <span className="text-primary">
                  Watched {item.watch_count}x
                </span>
              )}
            </div>
          </div>
          
          {/* Play arrow on hover */}
          <div className="hidden sm:flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function HistorySkeleton() {
  return (
    <div className="flex gap-4 p-3">
      <Skeleton className="w-40 sm:w-48 aspect-video rounded-lg flex-shrink-0" />
      <div className="flex-1 py-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryVideo[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, startLoadMore] = useTransition();
  const [hasLoadedAll, setHasLoadedAll] = useState(false);

  // Initial load
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      
      const [historyResult, continueResult] = await Promise.all([
        getWatchHistory(20),
        getContinueWatching(10),
      ]);
      
      if (historyResult.history) {
        setHistory(historyResult.history as HistoryVideo[]);
      }
      if (continueResult.videos) {
        setContinueWatching(continueResult.videos as ContinueWatchingVideo[]);
      }
      
      setIsLoading(false);
    }
    
    loadData();
  }, []);

  const loadMore = () => {
    startLoadMore(async () => {
      const result = await getWatchHistory(50);
      if (result.history) {
        setHistory(result.history as HistoryVideo[]);
        setHasLoadedAll(true);
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <History className="w-6 h-6" />
          Watch History
        </h1>
        <p className="text-muted-foreground mt-1">
          Videos you've watched recently
        </p>
      </div>

      {/* Continue Watching Section */}
      {!isLoading && continueWatching.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-primary" />
              Continue Watching
            </h2>
          </div>
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
              <AnimatePresence mode="popLayout">
                {continueWatching.map((item, index) => (
                  <motion.div
                    key={item.video_id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ContinueWatchingCard item={item} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>
      )}

      {/* Recently Watched Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Video className="w-5 h-5" />
            Recently Watched
          </h2>
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <HistorySkeleton key={i} />
            ))}
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {history.map((item, index) => (
                <HistoryCard key={item.video_id} item={item} index={index} />
              ))}
            </AnimatePresence>
            
            {/* Load more */}
            {!hasLoadedAll && history.length >= 20 && (
              <div className="pt-4 text-center">
                <Button 
                  variant="outline" 
                  onClick={loadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <History className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No watch history yet</h3>
            <p className="text-muted-foreground mb-6">
              Start watching videos to build your history
            </p>
            <Link href="/dashboard">
              <Button>
                <Play className="w-4 h-4 mr-2" />
                Browse Videos
              </Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

