"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Play, Clock, Eye, MoreVertical, Check, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { Video } from "@/lib/youtube";

interface VideoCardProps {
  video: Video;
  isWatched?: boolean;
}

export function VideoCard({ video, isWatched: initialIsWatched }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [localIsWatched, setLocalIsWatched] = useState(initialIsWatched);
  
  const markAsWatched = useMutation(api.watched.markAsWatched);
  const unmarkAsWatched = useMutation(api.watched.unmarkAsWatched);

  const handleToggleWatched = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (localIsWatched) {
        await unmarkAsWatched({ videoId: video.id });
        setLocalIsWatched(false);
        toast.success("Marked as unwatched");
      } else {
        await markAsWatched({ videoId: video.id, channelId: video.channelId });
        setLocalIsWatched(true);
        toast.success("Marked as watched");
      }
    } catch (error) {
      toast.error("Failed to update watch status");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <Link href={`/watch/${video.id}`}>
        <div className="space-y-3">
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              className={`object-cover transition-all duration-300 ${
                isHovered ? "scale-105" : "scale-100"
              } ${localIsWatched ? "opacity-60" : "opacity-100"}`}
            />
            
            {/* Play overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/30"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isHovered ? 1 : 0.8 }}
                className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg"
              >
                <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
              </motion.div>
            </motion.div>

            {/* Duration badge */}
            {video.duration && (
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-xs font-medium rounded">
                {video.duration}
              </span>
            )}

            {/* Watched indicator */}
            {localIsWatched && (
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="gap-1 bg-background/90">
                  <CheckCircle2 className="w-3 h-3" />
                  Watched
                </Badge>
              </div>
            )}

            {/* Actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-background/90 hover:bg-background"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleToggleWatched}>
                    {localIsWatched ? (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Mark as unwatched
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Mark as watched
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-1.5">
            <h3 className={`font-medium line-clamp-2 group-hover:text-primary transition-colors ${
              localIsWatched ? "text-muted-foreground" : ""
            }`}>
              {video.title}
            </h3>
            <p className="text-sm text-muted-foreground">{video.channelTitle}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {video.viewCount && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {video.viewCount}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

