"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Check, Eye, Clock, ThumbsUp, ExternalLink, Loader2 } from "lucide-react";
import { markVideoWatched, getVideoState, logVideoWatchDelta } from "@/app/actions/videos";
import { formatViewCount, formatDuration } from "@/lib/youtube";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useWatchTimeSafe } from "@/components/watch-timer";

// Declare YouTube IFrame API types
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number; target: YTPlayer }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  destroy: () => void;
  getPlayerState: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
}

// YouTube Player State constants
const YT_PLAYING = 1;
const YT_PAUSED = 2;
const YT_BUFFERING = 3;
const YT_ENDED = 0;

// Sync interval for per-video watch tracking (in ms)
const VIDEO_SYNC_INTERVAL_MS = 30000;

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
  const [playerReady, setPlayerReady] = useState(false);
  
  const playerRef = useRef<YTPlayer | null>(null);

  // Watch time tracking (global daily limit)
  const watchTime = useWatchTimeSafe();
  
  // Per-video watch tracking refs
  const videoWatchSecondsRef = useRef(0); // Accumulated seconds watched in this session
  const lastSyncedSecondsRef = useRef(0); // Last synced to server
  const isVideoPlayingRef = useRef(false);
  const isVisibleRef = useRef(true);
  const videoTrackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoSyncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartedRef = useRef(false); // Track if we've started a new session

  // Sync per-video watch data to server
  const syncVideoWatchData = useCallback(async (completed = false) => {
    const currentSeconds = videoWatchSecondsRef.current;
    const delta = currentSeconds - lastSyncedSecondsRef.current;
    
    if (delta <= 0 && !completed) return;
    
    // Get current progress from player if available
    let progressSeconds: number | undefined;
    try {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        progressSeconds = Math.floor(playerRef.current.getCurrentTime());
      }
    } catch {
      // Player might not be ready
    }

    const result = await logVideoWatchDelta({
      videoId,
      deltaSeconds: delta,
      progressSeconds,
      completed,
      isNewSession: !sessionStartedRef.current,
    });
    
    if (!result.error) {
      lastSyncedSecondsRef.current = currentSeconds;
      sessionStartedRef.current = true;
      
      // Update watched state if server says it's now watched
      if (result.watched && !isWatched) {
        setIsWatched(true);
      }
    }
  }, [videoId, isWatched]);

  // Handle video ended
  const handleVideoEnded = useCallback(async () => {
    // Sync final watch data with completed flag
    await syncVideoWatchData(true);
    setIsWatched(true);
  }, [syncVideoWatchData]);

  // Load YouTube IFrame API
  useEffect(() => {
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      setPlayerReady(true);
      return;
    }

    // Load the API
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Set up callback
    window.onYouTubeIframeAPIReady = () => {
      setPlayerReady(true);
    };

    return () => {
      window.onYouTubeIframeAPIReady = undefined;
    };
  }, []);

  // Handle visibility changes for accurate tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === "visible";
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Initialize YouTube player when API is ready
  useEffect(() => {
    if (!playerReady || !videoId) return;

    // Create player
    playerRef.current = new window.YT.Player("youtube-player", {
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        rel: 0,
        modestbranding: 1,
      },
      events: {
        onStateChange: (event) => {
          // YT.PlayerState.PLAYING = 1, PAUSED = 2, BUFFERING = 3, ENDED = 0
          const isPlaying = event.data === YT_PLAYING || event.data === YT_BUFFERING;
          isVideoPlayingRef.current = isPlaying;
          watchTime?.setVideoPlaying(isPlaying);
          
          // Handle video ended
          if (event.data === YT_ENDED) {
            handleVideoEnded();
          }
        },
        onReady: () => {
          // Video starts autoplaying, so set initial state
          isVideoPlayingRef.current = true;
          watchTime?.setVideoPlaying(true);
        },
      },
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [playerReady, videoId, handleVideoEnded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Store tracking functions in ref to avoid effect re-runs when context value changes
  const watchTimeRef = useRef(watchTime);
  useEffect(() => {
    watchTimeRef.current = watchTime;
  }, [watchTime]);

  // Start watch time tracking when on this page (always track for stats, limit enforcement is separate)
  // Using empty deps to ensure this only runs once on mount/unmount
  useEffect(() => {
    // Start tracking when page mounts
    watchTimeRef.current?.startTracking();

    return () => {
      // Stop tracking when page unmounts
      watchTimeRef.current?.stopTracking();
    };
  }, []); // Empty deps - only run on mount/unmount

  // Per-video watch tracking: increment counter every second when playing + visible
  useEffect(() => {
    // Reset refs for new video
    videoWatchSecondsRef.current = 0;
    lastSyncedSecondsRef.current = 0;
    sessionStartedRef.current = false;

    // Increment every second (only when visible AND video is playing)
    videoTrackingIntervalRef.current = setInterval(() => {
      if (isVisibleRef.current && isVideoPlayingRef.current) {
        videoWatchSecondsRef.current += 1;
      }
    }, 1000);

    // Sync to server periodically
    videoSyncIntervalRef.current = setInterval(() => {
      syncVideoWatchData(false);
    }, VIDEO_SYNC_INTERVAL_MS);

    return () => {
      // Cleanup intervals
      if (videoTrackingIntervalRef.current) {
        clearInterval(videoTrackingIntervalRef.current);
        videoTrackingIntervalRef.current = null;
      }
      if (videoSyncIntervalRef.current) {
        clearInterval(videoSyncIntervalRef.current);
        videoSyncIntervalRef.current = null;
      }
      // Final sync on unmount
      syncVideoWatchData(false);
    };
  }, [videoId, syncVideoWatchData]);

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

  // Note: Videos are now marked as watched automatically when total_watched_seconds >= 30
  // This is handled by logVideoWatchDelta in the server action

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

  // Save progress on page unload using sendBeacon for reliability
  useEffect(() => {
    const handleBeforeUnload = () => {
      const delta = videoWatchSecondsRef.current - lastSyncedSecondsRef.current;
      if (delta > 0) {
        // Get progress from player if available
        let progressSeconds: number | undefined;
        try {
          if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
            progressSeconds = Math.floor(playerRef.current.getCurrentTime());
          }
        } catch {
          // Player might not be ready
        }
        
        // Use sendBeacon for reliable delivery on page unload
        // Note: This sends to an API endpoint that we'd need to create for sendBeacon
        // For now, the cleanup in the tracking effect handles this via regular fetch
        // The sync interval + unmount cleanup should handle most cases
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [videoId]);

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

