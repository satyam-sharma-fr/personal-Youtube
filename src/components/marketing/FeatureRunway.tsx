"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { 
  Plus, 
  Grid3X3, 
  ListVideo, 
  Play, 
  Clock, 
  BarChart3,
  Check,
  Filter,
  Eye,
  ArrowRight,
  Tv,
} from "lucide-react";
import { fadeUp, staggerContainer, zenEase } from "./motion";
import { cn } from "@/lib/utils";

const features = [
  {
    id: "channels",
    icon: Plus,
    title: "Add your channels",
    description: "Search and add only the YouTube channels you actually want to follow.",
    accentColor: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    activeBg: "bg-red-50",
    shadowColor: "shadow-red-100/50",
  },
  {
    id: "categories",
    icon: Grid3X3,
    title: "Organize with categories",
    description: "Create custom categories like 'Learning', 'Entertainment', or 'News'.",
    accentColor: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    activeBg: "bg-teal-50",
    shadowColor: "shadow-teal-100/50",
  },
  {
    id: "feed",
    icon: ListVideo,
    title: "Browse your clean feed",
    description: "A chronological feed with only videos from your selected channels.",
    accentColor: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    activeBg: "bg-emerald-50",
    shadowColor: "shadow-emerald-100/50",
  },
  {
    id: "watch",
    icon: Play,
    title: "Watch with intent",
    description: "No sidebar suggestions. No autoplay. Watch what you came for.",
    accentColor: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    activeBg: "bg-indigo-50",
    shadowColor: "shadow-indigo-100/50",
  },
  {
    id: "timer",
    icon: Clock,
    title: "Set watch time limits",
    description: "Define daily limits. Get gentle nudges when approaching your limit.",
    accentColor: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    activeBg: "bg-orange-50",
    shadowColor: "shadow-orange-100/50",
  },
  {
    id: "stats",
    icon: BarChart3,
    title: "Track your progress",
    description: "See your daily and weekly watch time stats. Build better habits.",
    accentColor: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    activeBg: "bg-violet-50",
    shadowColor: "shadow-violet-100/50",
  },
];

// Preview components for each feature
function ChannelsPreview() {
  const channels = [
    { name: "3Blue1Brown", initials: "3B", avatar: "https://yt3.googleusercontent.com/ytc/AIdro_nFzgcTrxulXeYVmDXRAblMhvQ-MjI1aTXU3kqwQS5a=s176-c-k-c0x00ffffff-no-rj" },
    { name: "Fireship", initials: "FS", avatar: "https://yt3.googleusercontent.com/ytc/AIdro_k_D9hKDXhJDNf1tSNJoXMTT8-OVx3jHfsmFnQOBA=s176-c-k-c0x00ffffff-no-rj" },
    { name: "Veritasium", initials: "VE", avatar: "https://yt3.googleusercontent.com/ytc/AIdro_kED97yk3MKP6Abzc5u9pnNBWH8pKzYh-36EJNWBLpvhg=s176-c-k-c0x00ffffff-no-rj" },
  ];
  return (
    <div className="space-y-3">
      {channels.map((ch, i) => (
        <motion.div
          key={ch.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <img src={ch.avatar} alt={ch.name} className="w-10 h-10 rounded-full" />
          <span className="font-medium text-zinc-900">{ch.name}</span>
          <Check className="w-4 h-4 text-teal-500 ml-auto" />
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-2 p-3 rounded-xl border-2 border-dashed border-zinc-200 text-zinc-400 hover:border-red-300 hover:text-red-500 transition-colors cursor-pointer"
      >
        <Plus className="w-5 h-5" />
        <span className="text-sm font-medium">Add more channels...</span>
      </motion.div>
    </div>
  );
}

function CategoriesPreview() {
  const categories = [
    { name: "Learning", count: 5, color: "bg-red-100 text-red-600 border-red-200" },
    { name: "Tech", count: 3, color: "bg-violet-100 text-violet-600 border-violet-200" },
    { name: "Entertainment", count: 4, color: "bg-teal-100 text-teal-600 border-teal-200" },
  ];
  return (
    <div className="space-y-3">
      {categories.map((cat, i) => (
        <motion.div
          key={cat.name}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", cat.color)}>
            <Grid3X3 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="font-medium text-zinc-900 group-hover:text-zinc-700">{cat.name}</span>
            <p className="text-xs text-zinc-500">{cat.count} channels</p>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
        </motion.div>
      ))}
    </div>
  );
}

function FeedPreview() {
  const videos = [
    { title: "Neural Networks Explained", channel: "3Blue1Brown", time: "2h ago" },
    { title: "100 Seconds of React", channel: "Fireship", time: "4h ago" },
    { title: "Why Roundabouts Are Great", channel: "Veritasium", time: "1d ago" },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-zinc-50 border border-zinc-100">
        <Filter className="w-4 h-4 text-zinc-400" />
        <span className="text-sm text-zinc-500">Showing all channels</span>
        <span className="ml-auto text-xs text-teal-600 font-medium">3 videos</span>
      </div>
      {videos.map((video, i) => (
        <motion.div
          key={video.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex gap-3 p-3 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="w-24 h-14 rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
            <Play className="w-5 h-5 text-zinc-400 group-hover:text-red-500 transition-colors" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-zinc-900 text-sm truncate group-hover:text-red-600 transition-colors">
              {video.title}
            </div>
            <div className="text-xs text-zinc-500">{video.channel}</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">{video.time}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function WatchPreview() {
  return (
    <div className="space-y-4">
      <div className="aspect-video rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center relative overflow-hidden">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30"
        >
          <Play className="w-6 h-6 text-white fill-current ml-1" />
        </motion.div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
          <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "35%" }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-red-500 rounded-full"
            />
          </div>
          <span className="text-white text-[10px] font-medium">5:23</span>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 p-3 rounded-xl bg-teal-50 border border-teal-100"
      >
        <Eye className="w-4 h-4 text-teal-600" />
        <span className="text-sm text-teal-700 font-medium">No sidebar • No autoplay • No distractions</span>
      </motion.div>
    </div>
  );
}

function TimerPreview() {
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-5 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <svg className="w-16 h-16 -rotate-90">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#fed7aa" strokeWidth="6" />
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#ea580c"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 28}
                initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 28 * 0.62 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-orange-600">
              38%
            </span>
          </div>
          <div>
            <div className="font-semibold text-zinc-900">23:00 watched</div>
            <div className="text-sm text-zinc-500">of 1:00:00 daily limit</div>
            <div className="text-xs text-orange-600 font-medium mt-1">37 minutes remaining</div>
          </div>
        </div>
      </motion.div>
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Clock className="w-4 h-4" />
        <span>You'll get a gentle reminder at 50 minutes</span>
      </div>
    </div>
  );
}

function StatsPreview() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const heights = [40, 65, 30, 80, 55, 90, 45];
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
        <div className="flex items-end justify-between h-28 gap-2">
          {days.map((day, i) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heights[i]}%` }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
                className="w-full bg-gradient-to-t from-violet-500 to-violet-400 rounded-t-md"
              />
              <span className="text-[10px] text-zinc-500 font-medium">{day}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-zinc-500">This week</div>
          <div className="font-semibold text-zinc-900">5h 23m total</div>
        </div>
        <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
          <span>↓ 18%</span>
          <span className="text-zinc-400">vs last week</span>
        </div>
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
  const [activeFeature, setActiveFeature] = useState("channels");
  const shouldReduceMotion = useReducedMotion();

  const PreviewComponent = previewComponents[activeFeature];
  const activeFeatureData = features.find(f => f.id === activeFeature);

  return (
    <section id="features" className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-b from-white to-zinc-50">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <motion.div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(220, 38, 38, 0.03) 0%, transparent 60%)",
            filter: "blur(80px)",
          }}
          animate={shouldReduceMotion ? {} : {
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Section header */}
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="inline-block text-sm font-medium text-red-600 mb-3 tracking-wider uppercase">
              How it works
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-semibold mb-4 text-zinc-900">
              Simple by design.
            </h2>
            <p className="text-zinc-600 text-lg max-w-xl mx-auto">
              Six steps to reclaim your attention and build better viewing habits.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start max-w-6xl mx-auto">
            {/* Left: Preview card */}
            <motion.div variants={fadeUp} className="order-2 lg:order-1">
              <div className="sticky top-24">
                <motion.div
                  className="p-6 md:p-8 rounded-2xl bg-white border shadow-xl"
                  animate={{
                    borderColor: activeFeatureData?.borderColor.replace("border-", "") || "#e4e4e7",
                    boxShadow: `0 25px 50px -12px ${activeFeatureData?.shadowColor.replace("shadow-", "").replace("/50", "") || "rgba(0,0,0,0.1)"}`,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Preview header */}
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-100">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      activeFeatureData?.bgColor
                    )}>
                      {activeFeatureData && <activeFeatureData.icon className={cn("w-5 h-5", activeFeatureData.accentColor)} />}
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-900">{activeFeatureData?.title}</div>
                      <div className="text-xs text-zinc-500">Preview</div>
                    </div>
                  </div>
                  
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeFeature}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: zenEase }}
                    >
                      <PreviewComponent />
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>

            {/* Right: Feature list */}
            <div className="order-1 lg:order-2 space-y-3">
              {features.map((feature, i) => {
                const isActive = activeFeature === feature.id;
                return (
                  <motion.div
                    key={feature.id}
                    variants={fadeUp}
                    onClick={() => setActiveFeature(feature.id)}
                    className={cn(
                      "p-4 rounded-xl cursor-pointer transition-all duration-300 border",
                      isActive
                        ? `${feature.activeBg} ${feature.borderColor} shadow-md`
                        : "bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
                        isActive ? feature.bgColor : "bg-zinc-100"
                      )}>
                        <feature.icon className={cn(
                          "w-6 h-6 transition-colors duration-300",
                          isActive ? feature.accentColor : "text-zinc-400"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "text-xs font-mono transition-colors",
                            isActive ? feature.accentColor : "text-zinc-400"
                          )}>
                            0{i + 1}
                          </span>
                          <h3 className="font-semibold text-zinc-900">{feature.title}</h3>
                          {isActive && (
                            <ArrowRight className={cn("w-4 h-4 ml-auto", feature.accentColor)} />
                          )}
                        </div>
                        <p className="text-sm text-zinc-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
