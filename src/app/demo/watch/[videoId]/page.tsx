"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Eye, Clock, ThumbsUp, ExternalLink, ArrowRight } from "lucide-react";
import { formatViewCount, formatDuration } from "@/lib/youtube";
import { cn } from "@/lib/utils";
import Link from "next/link";

// YTPlayer type (YouTube IFrame API types are declared globally in the main watch page)
interface YTPlayer {
  destroy: () => void;
  getPlayerState: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
}

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

export default function DemoWatchPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.videoId as string;
  const supabase = createClient();

  const [video, setVideo] = useState<VideoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  
  const playerRef = useRef<YTPlayer | null>(null);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setPlayerReady(true);
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      setPlayerReady(true);
    };

    return () => {
      window.onYouTubeIframeAPIReady = undefined;
    };
  }, []);

  // Initialize YouTube player when API is ready
  useEffect(() => {
    if (!playerReady || !videoId) return;

    playerRef.current = new window.YT.Player("youtube-player", {
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        rel: 0,
        modestbranding: 1,
      },
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [playerReady, videoId]);

  // Fetch video data
  useEffect(() => {
    async function fetchVideo() {
      setIsLoading(true);
      
      const { data: videoData, error: videoError } = await supabase
        .from("youtube_videos")
        .select("*")
        .eq("video_id", videoId)
        .single();

      if (videoError || !videoData) {
        setVideo(null);
      } else {
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

      setIsLoading(false);
    }

    fetchVideo();
  }, [videoId, supabase]);

  return (
    <div className="min-h-screen bg-background -m-6">
      {/* Header */}
      <div className="sticky top-24 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </Button>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-accent/20 text-accent">
              <Eye className="w-3 h-3 mr-1" />
              Demo Mode
            </Badge>

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
          <div id="youtube-player" className="w-full h-full" />
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
              {/* Title */}
              <h1 className="text-xl font-bold mb-4">{video.title}</h1>

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

              {/* Demo CTA */}
              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-border/50 text-center">
                <h3 className="text-lg font-semibold mb-2">Enjoying the demo?</h3>
                <p className="text-muted-foreground mb-4">
                  Sign up to track your watch history, set time limits, and more.
                </p>
                <Link href="/signup">
                  <Button size="lg">
                    Create Your Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
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

