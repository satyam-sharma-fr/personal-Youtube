"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { GlassSurface } from "./glass/GlassSurface";
import { 
  Plus, 
  Grid3X3, 
  ListVideo, 
  Play, 
  Clock, 
  BarChart3,
  Check,
  Tv,
  Filter,
  Eye
} from "lucide-react";
import { fadeUp, staggerContainer } from "./motion";

const features = [
  {
    id: "channels",
    icon: Plus,
    title: "Add your channels",
    description: "Search and add only the YouTube channels you actually want to follow. No algorithm suggestions—just your picks.",
    accentColor: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "categories",
    icon: Grid3X3,
    title: "Organize with categories",
    description: "Create custom categories like 'Learning', 'Entertainment', or 'News'. Filter your feed by mood or focus area.",
    accentColor: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    id: "feed",
    icon: ListVideo,
    title: "Browse your clean feed",
    description: "A chronological feed with only videos from channels you selected. No recommendations, no distractions.",
    accentColor: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
  {
    id: "watch",
    icon: Play,
    title: "Watch with intent",
    description: "No sidebar suggestions. No autoplay into random videos. Watch what you came for, then move on with your day.",
    accentColor: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "timer",
    icon: Clock,
    title: "Set watch time limits",
    description: "Define daily limits to stay focused. Get gentle nudges when approaching your limit. Snooze when you need to.",
    accentColor: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    id: "stats",
    icon: BarChart3,
    title: "Track your progress",
    description: "See your daily and weekly watch time stats. Celebrate wins. Build better habits over time.",
    accentColor: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
];

// Mock preview components for each feature
function ChannelsPreview() {
  const channels = [
    { name: "3Blue1Brown", initials: "3B" },
    { name: "Fireship", initials: "FS" },
    { name: "Veritasium", initials: "VE" },
  ];
  return (
    <div className="space-y-3">
      {channels.map((ch, i) => (
        <motion.div
          key={ch.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30"
        >
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
            {ch.initials}
          </div>
          <span className="font-medium">{ch.name}</span>
          <Check className="w-4 h-4 text-accent ml-auto" />
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-border/50 text-muted-foreground"
      >
        <Plus className="w-5 h-5" />
        <span className="text-sm">Add more channels...</span>
      </motion.div>
    </div>
  );
}

function CategoriesPreview() {
  const categories = [
    { name: "Learning", count: 5, color: "bg-blue-500/20 text-blue-400" },
    { name: "Tech", count: 3, color: "bg-purple-500/20 text-purple-400" },
    { name: "Entertainment", count: 4, color: "bg-pink-500/20 text-pink-400" },
  ];
  return (
    <div className="space-y-3">
      {categories.map((cat, i) => (
        <motion.div
          key={cat.name}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30"
        >
          <div className={`w-8 h-8 rounded-lg ${cat.color} flex items-center justify-center`}>
            <Grid3X3 className="w-4 h-4" />
          </div>
          <span className="font-medium">{cat.name}</span>
          <span className="text-xs text-muted-foreground ml-auto">{cat.count} channels</span>
        </motion.div>
      ))}
    </div>
  );
}

function FeedPreview() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Showing: All channels</span>
      </div>
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex gap-3 p-2 rounded-lg hover:bg-muted/20 transition-colors"
        >
          <div className="w-24 h-14 rounded-md bg-gradient-to-br from-muted/60 to-muted/30 flex items-center justify-center">
            <Play className="w-5 h-5 text-muted-foreground/50" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="h-3 w-full bg-muted/50 rounded" />
            <div className="h-2 w-2/3 bg-muted/30 rounded" />
            <div className="h-2 w-1/3 bg-muted/20 rounded" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function WatchPreview() {
  return (
    <div className="space-y-4">
      <div className="aspect-video rounded-lg bg-gradient-to-br from-muted/60 to-muted/30 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-primary/80 flex items-center justify-center">
          <Play className="w-5 h-5 text-primary-foreground fill-current ml-0.5" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4 text-accent" />
        <span className="text-sm text-muted-foreground">No sidebar • No autoplay • No distractions</span>
      </div>
    </div>
  );
}

function TimerPreview() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center">
            <span className="text-sm font-bold text-emerald-500">38%</span>
          </div>
          <div>
            <div className="font-medium">23:00 watched</div>
            <div className="text-sm text-muted-foreground">of 1:00:00 daily limit</div>
          </div>
        </div>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "38%" }}
          transition={{ duration: 1, delay: 0.3 }}
          className="h-full bg-emerald-500 rounded-full"
        />
      </div>
    </div>
  );
}

function StatsPreview() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const heights = [40, 65, 30, 80, 55, 90, 45];
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between h-24 gap-2">
        {days.map((day, i) => (
          <div key={day} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${heights[i]}%` }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="w-full bg-gradient-to-t from-chart-4/80 to-chart-4/40 rounded-t-sm"
            />
            <span className="text-[10px] text-muted-foreground">{day}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">This week</span>
        <span className="font-medium">5h 23m total</span>
      </div>
    </div>
  );
}

const previewComponents: Record<string, React.FC> = {
  channels: ChannelsPreview,
  categories: CategoriesPreview,
  feed: FeedPreview,
  watch: WatchPreview,
  timer: TimerPreview,
  stats: StatsPreview,
};

export function FeatureRunway() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Calculate which feature is active based on scroll
  const activeIndex = useTransform(
    scrollYProgress,
    [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1],
    [0, 0, 1, 2, 3, 4, 5, 5]
  );

  return (
    <section
      ref={containerRef}
      id="features"
      className="relative"
      style={{ height: `${(features.length + 1) * 100}vh` }}
    >
      <div className="sticky top-0 min-h-screen flex items-center py-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-7xl mx-auto">
            {/* Left: Sticky glass preview */}
            <div className="relative order-2 lg:order-1">
              <GlassSurface
                specular={!shouldReduceMotion}
                refraction
                className="aspect-[4/3] p-6 md:p-8"
              >
                <motion.div
                  key={Math.round(activeIndex.get())}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="h-full"
                >
                  {features.map((feature, i) => {
                    const PreviewComponent = previewComponents[feature.id];
                    return (
                      <motion.div
                        key={feature.id}
                        style={{
                          opacity: useTransform(
                            activeIndex,
                            [i - 0.5, i, i + 0.5],
                            [0, 1, 0]
                          ),
                          display: useTransform(activeIndex, (v) =>
                            Math.abs(v - i) < 1 ? "block" : "none"
                          ),
                        }}
                        className="absolute inset-6 md:inset-8"
                      >
                        <PreviewComponent />
                      </motion.div>
                    );
                  })}
                </motion.div>
              </GlassSurface>
            </div>

            {/* Right: Feature list */}
            <div className="order-1 lg:order-2 space-y-6">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div variants={fadeUp} className="mb-8">
                  <span className="text-sm font-medium text-accent mb-2 block">
                    How it works
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Simple by design.
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Six steps to reclaim your attention.
                  </p>
                </motion.div>
              </motion.div>

              <div className="space-y-4">
                {features.map((feature, i) => (
                  <motion.div
                    key={feature.id}
                    style={{
                      opacity: useTransform(
                        activeIndex,
                        [i - 1, i - 0.5, i, i + 0.5, i + 1],
                        [0.4, 0.7, 1, 0.7, 0.4]
                      ),
                      scale: useTransform(
                        activeIndex,
                        [i - 1, i, i + 1],
                        [0.98, 1, 0.98]
                      ),
                    }}
                  >
                    <GlassSurface
                      className="p-4 cursor-pointer transition-colors hover:bg-muted/10"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center flex-shrink-0`}>
                          <feature.icon className={`w-6 h-6 ${feature.accentColor}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-muted-foreground">
                              0{i + 1}
                            </span>
                            <h3 className="font-semibold">{feature.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </GlassSurface>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

