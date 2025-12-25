"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DemoVideoCard } from "./demo-video-card";

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
  youtube_channels: {
    title: string;
    thumbnail_url: string | null;
    custom_url: string | null;
  } | null;
};

interface DemoVideoFeedProps {
  videos: Video[];
}

export function DemoVideoFeed({ videos }: DemoVideoFeedProps) {
  return (
    <div>
      {/* Video grid */}
      <AnimatePresence mode="popLayout">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          layout
        >
          {videos.map((video, index) => (
            <DemoVideoCard key={video.id} video={video} index={index} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty state when no videos */}
      {videos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">
            No videos found for this selection.
          </p>
        </div>
      )}

      {/* End indicator */}
      {videos.length > 0 && (
        <div className="py-8">
          <p className="text-center text-muted-foreground text-sm">
            End of demo feed • Sign up to see unlimited videos
          </p>
        </div>
      )}
    </div>
  );
}

