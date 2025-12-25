"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCategories } from "@/components/dashboard/dashboard-shell";
import { getContinueWatching } from "@/app/actions/videos";
import { formatDuration } from "@/lib/youtube";
import { formatWatchTime } from "@/components/watch-timer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Sparkles, 
  Tag, 
  Plus,
  ArrowRight,
  PlayCircle,
  History
} from "lucide-react";

// Time-based greeting
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Type for continue watching videos
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

// Fallback gradients for categories without images
const fallbackGradients = [
  "from-violet-600 via-purple-600 to-fuchsia-600",
  "from-cyan-600 via-blue-600 to-indigo-600",
  "from-amber-600 via-orange-600 to-red-600",
  "from-emerald-600 via-green-600 to-teal-600",
  "from-pink-600 via-rose-600 to-red-600",
  "from-sky-600 via-blue-600 to-violet-600",
  "from-lime-600 via-green-600 to-emerald-600",
  "from-fuchsia-600 via-pink-600 to-rose-600",
];

// Continue Watching Card Component
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
        className="group relative flex-shrink-0 w-64 rounded-xl overflow-hidden border border-border/50 bg-card hover:border-primary/50 transition-colors"
      >
        {/* Thumbnail */}
        <div className="relative aspect-video">
          <Image
            src={item.video.thumbnail_high_url || item.video.thumbnail_url || "/placeholder.jpg"}
            alt={item.video.title}
            fill
            className="object-cover"
            sizes="256px"
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
            <PlayCircle className="w-10 h-10 text-white" />
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
            <span className="truncate">{item.video.youtube_channels?.title}</span>
            <span className="flex items-center gap-1 flex-shrink-0">
              <Play className="w-3 h-3" />
              {formatWatchTime(progress)}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// Continue Watching Section Component
function ContinueWatchingSection() {
  const [videos, setVideos] = useState<ContinueWatchingVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadContinueWatching() {
      const result = await getContinueWatching(6);
      if (result.videos) {
        setVideos(result.videos as ContinueWatchingVideo[]);
      }
      setIsLoading(false);
    }
    loadContinueWatching();
  }, []);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-5xl mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <PlayCircle className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Continue Watching</h2>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-64 h-40 rounded-xl flex-shrink-0" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (videos.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="w-full max-w-5xl mb-8"
    >
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <PlayCircle className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Continue Watching</h2>
        </div>
        <Link href="/history" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          <History className="w-4 h-4" />
          View all
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide px-2 -mx-2">
        <AnimatePresence mode="popLayout">
          {videos.map((video, index) => (
            <motion.div
              key={video.video_id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <ContinueWatchingCard item={video} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function HomeDashboard() {
  const categories = useCategories();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll state
  const checkScrollState = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    checkScrollState();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollState);
      window.addEventListener("resize", checkScrollState);
    }
    return () => {
      container?.removeEventListener("scroll", checkScrollState);
      window.removeEventListener("resize", checkScrollState);
    };
  }, [categories]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const hasCategories = categories.length > 0;

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center px-4 py-8">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      {/* Continue Watching Section */}
      <ContinueWatchingSection />

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mb-12 max-w-2xl"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
        >
          <Sparkles className="w-4 h-4" />
          {getGreeting()}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
        >
          What would you like to
          <span className="block bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
            watch today?
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-lg text-muted-foreground"
        >
          {hasCategories 
            ? "Choose a category to stay focused, or browse your full feed."
            : "Create categories to organize your channels and stay focused."
          }
        </motion.p>
      </motion.div>

      {/* Categories Carousel */}
      {hasCategories ? (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="w-full max-w-5xl relative"
        >
          {/* Scroll buttons - desktop only */}
          <AnimatePresence>
            {canScrollLeft && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 hidden md:block"
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full shadow-lg bg-background/80 backdrop-blur-sm"
                  onClick={() => scroll("left")}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {canScrollRight && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 hidden md:block"
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full shadow-lg bg-background/80 backdrop-blur-sm"
                  onClick={() => scroll("right")}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Carousel container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 px-2 -mx-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      ) : (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
            <Tag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No categories yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Categories help you organize your channels and focus on what matters.
          </p>
          <Link href="/channels">
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Create Your First Category
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Go to Feed CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="mt-12"
      >
        <Link href="/dashboard">
          <Button
            variant="outline"
            size="lg"
            className="gap-2 group px-8"
          >
            <Play className="w-5 h-5 fill-current" />
            Go to feed
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

interface CategoryCardProps {
  category: { id: string; name: string; image_url?: string | null };
  index: number;
}

function CategoryCard({ category, index }: CategoryCardProps) {
  const fallbackGradient = fallbackGradients[index % fallbackGradients.length];
  const hasImage = !!category.image_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
      className="flex-shrink-0 snap-center"
    >
      <Link href={`/dashboard?category=${category.id}`}>
        <motion.div
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "relative w-64 h-40 rounded-2xl cursor-pointer overflow-hidden",
            "border border-border/30 shadow-lg",
            "transition-all duration-300 hover:shadow-xl hover:border-white/20",
            "group"
          )}
        >
          {/* Background - Image or Gradient */}
          {hasImage ? (
            <div className="absolute inset-0">
              <Image
                src={category.image_url!}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="256px"
              />
              {/* Dark gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
            </div>
          ) : (
            <div className={cn("absolute inset-0 bg-gradient-to-br", fallbackGradient)}>
              {/* Decorative pattern for gradient backgrounds */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-white/20 blur-2xl" />
                <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-white/10 blur-xl" />
              </div>
              {/* Dark overlay for consistency */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          )}

          {/* Content overlay */}
          <div className="relative h-full flex flex-col justify-end p-5">
            {/* Category icon badge */}
            <div className="absolute top-4 left-4">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <Tag className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Title and subtitle */}
            <div className="space-y-1">
              <h3 className="font-bold text-xl text-white drop-shadow-lg truncate">
                {category.name}
              </h3>
              <p className="text-sm text-white/70 flex items-center gap-1">
                <Play className="w-3 h-3 fill-current" />
                Open feed
              </p>
            </div>

            {/* Hover arrow indicator */}
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 0, x: -8 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

