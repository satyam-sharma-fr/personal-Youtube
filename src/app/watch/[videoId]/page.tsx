"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Check, 
  Eye,
  ExternalLink, 
  Share2, 
  ThumbsUp,
  Clock,
  Maximize2,
  Minimize2
} from "lucide-react";
import { toast } from "sonner";

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.videoId as string;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMarkedWatched, setIsMarkedWatched] = useState(false);

  const watchedVideoIds = useQuery(api.watched.getWatchedVideoIds);
  const markAsWatched = useMutation(api.watched.markAsWatched);
  const unmarkAsWatched = useMutation(api.watched.unmarkAsWatched);

  // Check if video is already watched
  useEffect(() => {
    if (watchedVideoIds) {
      setIsMarkedWatched(watchedVideoIds.includes(videoId));
    }
  }, [watchedVideoIds, videoId]);

  // Auto-mark as watched after 30 seconds of viewing
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!isMarkedWatched) {
        try {
          await markAsWatched({ videoId, channelId: "" });
          setIsMarkedWatched(true);
        } catch (error) {
          // Silently fail
        }
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [videoId, isMarkedWatched, markAsWatched]);

  const handleToggleWatched = async () => {
    try {
      if (isMarkedWatched) {
        await unmarkAsWatched({ videoId });
        setIsMarkedWatched(false);
        toast.success("Marked as unwatched");
      } else {
        await markAsWatched({ videoId, channelId: "" });
        setIsMarkedWatched(true);
        toast.success("Marked as watched");
      }
    } catch (error) {
      toast.error("Failed to update watch status");
    }
  };

  const handleShare = async () => {
    const url = `https://youtube.com/watch?v=${videoId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch {
      window.open(url, "_blank");
    }
  };

  const handleOpenYouTube = () => {
    window.open(`https://youtube.com/watch?v=${videoId}`, "_blank");
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.fullscreenElement) {
        router.back();
      }
      if (e.key === "f") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <div className={`min-h-screen bg-black ${isFullscreen ? "" : ""}`}>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10 ${
          isFullscreen ? "hidden" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-white hover:text-white hover:bg-white/10 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Feed
          </Button>

          <div className="flex items-center gap-2">
            {isMarkedWatched && (
              <Badge variant="secondary" className="gap-1 bg-white/10 text-white border-0">
                <Check className="w-3 h-3" />
                Watched
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleWatched}
              className="text-white hover:text-white hover:bg-white/10"
              title={isMarkedWatched ? "Mark as unwatched" : "Mark as watched"}
            >
              {isMarkedWatched ? (
                <Eye className="w-4 h-4" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-white hover:text-white hover:bg-white/10"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenYouTube}
              className="text-white hover:text-white hover:bg-white/10"
              title="Open in YouTube"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-white hover:text-white hover:bg-white/10"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Video Player */}
      <main className={`${isFullscreen ? "h-screen" : ""}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`w-full ${isFullscreen ? "h-full" : "max-w-7xl mx-auto"}`}
        >
          <div className={`relative ${isFullscreen ? "h-full" : "aspect-video"}`}>
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title="YouTube video player"
            />
          </div>
        </motion.div>

        {/* Minimal info section */}
        {!isFullscreen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-7xl mx-auto px-4 py-6"
          >
            <div className="flex items-center justify-between text-white/60 text-sm">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs mx-1">F</kbd> for fullscreen
                </span>
                <span className="flex items-center gap-1">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs mx-1">Esc</kbd> to go back
                </span>
              </div>
              <p className="text-white/40">
                Distraction-free viewing • No recommendations
              </p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

