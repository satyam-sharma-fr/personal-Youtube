"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Eye, EyeOff, Check, Clock, Loader2, ListPlus, ListMinus } from "lucide-react";
import { markVideoWatched, toggleWatchLater } from "@/app/actions/videos";
import { formatDuration, formatViewCount } from "@/lib/youtube";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VideoCardProps {
  video: {
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
  index: number;
}

export function VideoCard({ video, index }: VideoCardProps) {
  const [isWatched, setIsWatched] = useState(video.watched);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isInWatchLater, setIsInWatchLater] = useState(video.inWatchLater ?? false);
  const [isWatchLaterUpdating, setIsWatchLaterUpdating] = useState(false);

  const handleToggleWatched = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsUpdating(true);
    const newWatched = !isWatched;
    setIsWatched(newWatched);

    try {
      const result = await markVideoWatched(video.video_id, newWatched);
      if (result.error) {
        setIsWatched(!newWatched);
        toast.error(result.error);
      }
    } catch {
      setIsWatched(!newWatched);
      toast.error("Failed to update video");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleWatchLater = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsWatchLaterUpdating(true);
    const wasInWatchLater = isInWatchLater;
    setIsInWatchLater(!wasInWatchLater);

    try {
      const result = await toggleWatchLater(video.video_id);
      if (result.error) {
        setIsInWatchLater(wasInWatchLater);
        toast.error(result.error);
      } else {
        toast.success(result.inWatchLater ? "Added to Watch Later" : "Removed from Watch Later");
      }
    } catch {
      setIsInWatchLater(wasInWatchLater);
      toast.error("Failed to update Watch Later");
    } finally {
      setIsWatchLaterUpdating(false);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(video.published_at), { addSuffix: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
    >
      <Link href={`/watch/${video.video_id}`} className="group block">
        <div className="space-y-3">
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
            {video.thumbnail_high_url || video.thumbnail_url ? (
              <Image
                src={video.thumbnail_high_url || video.thumbnail_url!}
                alt={video.title}
                fill
                className={cn(
                  "object-cover transition-all duration-300 group-hover:scale-105",
                  isWatched && "opacity-60"
                )}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}

            {/* Duration badge */}
            {video.duration && (
              <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                {formatDuration(video.duration)}
              </span>
            )}

            {/* Watched indicator */}
            {isWatched && (
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="bg-accent/90 text-accent-foreground text-xs">
                  <Check className="w-3 h-3 mr-1" />
                  Watched
                </Badge>
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            {/* Action buttons */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Watch Later toggle button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className={cn(
                        "h-8 w-8 bg-background/90 hover:bg-background",
                        isInWatchLater && "text-primary"
                      )}
                      onClick={handleToggleWatchLater}
                      disabled={isWatchLaterUpdating}
                    >
                      {isWatchLaterUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isInWatchLater ? (
                        <ListMinus className="h-4 w-4" />
                      ) : (
                        <ListPlus className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isInWatchLater ? "Remove from Watch Later" : "Add to Watch Later"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Watch toggle button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-background/90 hover:bg-background"
                      onClick={handleToggleWatched}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isWatched ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isWatched ? "Mark as unwatched" : "Mark as watched"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Video Info */}
          <div className="flex gap-3">
            {/* Channel avatar */}
            {video.youtube_channels && (
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarImage
                  src={video.youtube_channels.thumbnail_url || undefined}
                  alt={video.youtube_channels.title}
                />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {video.youtube_channels.title[0]}
                </AvatarFallback>
              </Avatar>
            )}

            {/* Title and meta */}
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "font-medium text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors",
                  isWatched && "text-muted-foreground"
                )}
              >
                {video.title}
              </h3>

              {video.youtube_channels && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {video.youtube_channels.title}
                </p>
              )}

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                {video.view_count && (
                  <>
                    <span>{formatViewCount(video.view_count)}</span>
                    <span>•</span>
                  </>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeAgo}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

