"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Check, Eye, EyeOff, Clock, ThumbsUp, ExternalLink, Loader2 } from "lucide-react";
import { markVideoWatched, updateVideoProgress, getVideoState } from "@/app/actions/videos";
import { formatViewCount, formatDuration } from "@/lib/youtube";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VideoData {
  id: string;
  video_id: string;
  channel_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  published_at: string;
  duration: string | null;
  view_count: string | null;
  like_count: string | null;
  youtube_channels: {
    title: string;
    thumbnail_url: string | null;
    custom_url: string | null;
    subscriber_count: string | null;
  } | null;
}

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.videoId as string;
  const supabase = createClient();

  const [video, setVideo] = useState<VideoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWatched, setIsWatched] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Fetch video data
  useEffect(() => {
    async function fetchVideo() {
      setIsLoading(true);
      
      // Fetch video
      const { data: videoData, error: videoError } = await supabase
        .from("youtube_videos")
        .select("*")
        .eq("video_id", videoId)
        .single();

      if (videoError || !videoData) {
        // Video not in cache, just show the player
        setVideo(null);
      } else {
        // Fetch channel separately
        const { data: channelData } = await supabase
          .from("youtube_channels")
          .select("title, thumbnail_url, custom_url, subscriber_count")
          .eq("channel_id", videoData.channel_id)
          .single();

        setVideo({
          ...videoData,
          youtube_channels: channelData || null,
        });
      }

      // Get watched state
      const stateResult = await getVideoState(videoId);
      if (stateResult.state) {
        setIsWatched(stateResult.state.watched || false);
      }

      setIsLoading(false);
    }

    fetchVideo();
  }, [videoId, supabase]);

  // Mark as watched after viewing for 30 seconds
  useEffect(() => {
    if (isWatched) return;

    const timer = setTimeout(async () => {
      const result = await markVideoWatched(videoId, true);
      if (!result.error) {
        setIsWatched(true);
      }
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [videoId, isWatched]);

  const handleToggleWatched = useCallback(async () => {
    setIsUpdating(true);
    const newWatched = !isWatched;
    setIsWatched(newWatched);

    try {
      const result = await markVideoWatched(videoId, newWatched);
      if (result.error) {
        setIsWatched(!newWatched);
        toast.error(result.error);
      } else {
        toast.success(newWatched ? "Marked as watched" : "Marked as unwatched");
      }
    } catch {
      setIsWatched(!newWatched);
      toast.error("Failed to update");
    } finally {
      setIsUpdating(false);
    }
  }, [isWatched, videoId]);

  // Save progress on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Could save progress here with sendBeacon
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return (
    <div className="min-h-screen bg-background -m-6">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant={isWatched ? "secondary" : "outline"}
              size="sm"
              onClick={handleToggleWatched}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : isWatched ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              {isWatched ? "Watched" : "Mark Watched"}
            </Button>

            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                YouTube
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="aspect-video w-full bg-black"
        >
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video?.title || "Video"}
          />
        </motion.div>

        {/* Video Info */}
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-4 mt-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          ) : video ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Title and badges */}
              <div className="flex items-start gap-3 mb-4">
                <h1 className="text-xl font-bold flex-1">{video.title}</h1>
                {isWatched && (
                  <Badge variant="secondary" className="bg-accent/20 text-accent flex-shrink-0">
                    <Check className="w-3 h-3 mr-1" />
                    Watched
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                {video.view_count && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {formatViewCount(video.view_count)}
                  </span>
                )}
                {video.like_count && (
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    {parseInt(video.like_count).toLocaleString()} likes
                  </span>
                )}
                {video.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDuration(video.duration)}
                  </span>
                )}
                <span>
                  {formatDistanceToNow(new Date(video.published_at), { addSuffix: true })}
                </span>
              </div>

              {/* Channel */}
              {video.youtube_channels && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 mb-6">
                  <Avatar className="h-14 w-14">
                    <AvatarImage
                      src={video.youtube_channels.thumbnail_url || undefined}
                      alt={video.youtube_channels.title}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {video.youtube_channels.title[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{video.youtube_channels.title}</h3>
                    {video.youtube_channels.subscriber_count && (
                      <p className="text-sm text-muted-foreground">
                        {formatViewCount(video.youtube_channels.subscriber_count).replace(" views", "")} subscribers
                      </p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://youtube.com/channel/${video.channel_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Channel
                    </a>
                  </Button>
                </div>
              )}

              {/* Description */}
              {video.description && (
                <div className="rounded-xl bg-card border border-border/50 p-4">
                  <p
                    className={cn(
                      "text-sm whitespace-pre-wrap",
                      !showFullDescription && "line-clamp-4"
                    )}
                  >
                    {video.description}
                  </p>
                  {video.description.length > 300 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="px-0 mt-2"
                      onClick={() => setShowFullDescription(!showFullDescription)}
                    >
                      {showFullDescription ? "Show less" : "Show more"}
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Video details not available. Watch on{" "}
                <a
                  href={`https://youtube.com/watch?v=${videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  YouTube
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

