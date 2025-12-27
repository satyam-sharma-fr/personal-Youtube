"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getWatchLater, removeFromWatchLater } from "@/app/actions/videos";
import { formatDuration } from "@/lib/youtube";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Clock, 
  Play, 
  Trash2,
  ChevronRight,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type WatchLaterVideo = {
  video_id: string;
  added_at: string;
  video: {
    video_id: string;
    title: string;
    thumbnail_url: string | null;
    thumbnail_high_url: string | null;
    duration: string | null;
    channel_id: string;
    published_at: string;
    view_count: string | null;
    youtube_channels: {
      channel_id: string;
      title: string;
      thumbnail_url: string | null;
    } | null;
  } | null;
};

function WatchLaterCard({ 
  item, 
  index,
  onRemove,
}: { 
  item: WatchLaterVideo; 
  index: number;
  onRemove: (videoId: string) => void;
}) {
  const [isRemoving, setIsRemoving] = useState(false);
  
  if (!item.video) return null;
  
  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsRemoving(true);
    const result = await removeFromWatchLater(item.video_id);
    
    if (result.error) {
      toast.error(result.error);
      setIsRemoving(false);
    } else {
      toast.success("Removed from Watch Later");
      onRemove(item.video_id);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
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
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Added {formatDistanceToNow(new Date(item.added_at), { addSuffix: true })}
              </span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive",
                isRemoving && "opacity-100"
              )}
              onClick={handleRemove}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
            <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function WatchLaterSkeleton() {
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

export default function WatchLaterPage() {
  const [videos, setVideos] = useState<WatchLaterVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, startLoadMore] = useTransition();
  const [hasLoadedAll, setHasLoadedAll] = useState(false);

  // Initial load
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      
      const result = await getWatchLater(20);
      
      if (result.videos) {
        setVideos(result.videos as WatchLaterVideo[]);
      }
      
      setIsLoading(false);
    }
    
    loadData();
  }, []);

  const loadMore = () => {
    startLoadMore(async () => {
      const result = await getWatchLater(100);
      if (result.videos) {
        setVideos(result.videos as WatchLaterVideo[]);
        setHasLoadedAll(true);
      }
    });
  };

  const handleRemove = (videoId: string) => {
    setVideos((prev) => prev.filter((v) => v.video_id !== videoId));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Watch Later
        </h1>
        <p className="text-muted-foreground mt-1">
          Videos you've saved to watch later
        </p>
      </div>

      {/* Watch Later List */}
      <section>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <WatchLaterSkeleton key={i} />
            ))}
          </div>
        ) : videos.length > 0 ? (
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {videos.map((item, index) => (
                <WatchLaterCard 
                  key={item.video_id} 
                  item={item} 
                  index={index} 
                  onRemove={handleRemove}
                />
              ))}
            </AnimatePresence>
            
            {/* Load more */}
            {!hasLoadedAll && videos.length >= 20 && (
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
            <Clock className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No videos saved</h3>
            <p className="text-muted-foreground mb-6">
              Save videos to watch later by clicking the clock icon on any video
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

