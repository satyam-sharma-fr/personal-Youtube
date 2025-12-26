"use client";

import { useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  ThumbsUp, 
  Bell, 
  Clock, 
  Shuffle, 
  X, 
  Check, 
  ArrowRight,
  Flame,
  Sparkles,
  TrendingUp,
  Radio,
  Tv,
} from "lucide-react";
import { fadeUp, staggerContainer } from "./motion";
import { cn } from "@/lib/utils";

// Noisy YouTube-like recommendations
const noisyElements = [
  { icon: ThumbsUp, label: "Recommended for you", category: "Because you watched...", color: "text-red-500", bg: "bg-red-50" },
  { icon: Flame, label: "Trending #3", category: "Trending", color: "text-orange-500", bg: "bg-orange-50" },
  { icon: Shuffle, label: "Mix - Quick picks", category: "Your mix", color: "text-purple-500", bg: "bg-purple-50" },
  { icon: TrendingUp, label: "Popular right now", category: "Explore", color: "text-pink-500", bg: "bg-pink-50" },
  { icon: Radio, label: "Live now", category: "Live", color: "text-red-500", bg: "bg-red-50" },
  { icon: Sparkles, label: "New to you", category: "Discover", color: "text-blue-500", bg: "bg-blue-50" },
];

// Clean FocusTube channels
const cleanChannels = [
  { 
    name: "3Blue1Brown", 
    avatar: "https://yt3.googleusercontent.com/ytc/AIdro_nFzgcTrxulXeYVmDXRAblMhvQ-MjI1aTXU3kqwQS5a=s176-c-k-c0x00ffffff-no-rj",
    video: "The essence of calculus",
    time: "2 hours ago",
  },
  { 
    name: "Veritasium", 
    avatar: "https://yt3.googleusercontent.com/ytc/AIdro_kED97yk3MKP6Abzc5u9pnNBWH8pKzYh-36EJNWBLpvhg=s176-c-k-c0x00ffffff-no-rj",
    video: "The Most Misunderstood Concept",
    time: "1 day ago",
  },
  { 
    name: "MKBHD", 
    avatar: "https://yt3.googleusercontent.com/lkH37D712tiyphLsBkT8CRLSLCLMOeSLKyxdY6mfSdWB7sJBxwfnYc_VNQBqQ6-2TkM3Nj5Hpg=s176-c-k-c0x00ffffff-no-rj",
    video: "iPhone 16 Pro Review",
    time: "3 days ago",
  },
];

export function BeforeAfterRefraction() {
  const [activeView, setActiveView] = useState<"before" | "after">("before");
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-white">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background: activeView === "before"
              ? "radial-gradient(circle, rgba(220, 38, 38, 0.04) 0%, transparent 50%)"
              : "radial-gradient(circle, rgba(13, 148, 136, 0.04) 0%, transparent 50%)",
            filter: "blur(80px)",
          }}
          animate={shouldReduceMotion ? {} : { scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-5xl mx-auto"
        >
          {/* Section header */}
          <motion.div variants={fadeUp} className="text-center mb-12">
            <span className="inline-block text-sm font-medium text-teal-600 mb-3 tracking-wider uppercase">
              The Difference
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-semibold mb-4 text-zinc-900">
              Your feed,{" "}
              <span className="text-teal-600">purified.</span>
            </h2>
            <p className="text-zinc-600 text-lg max-w-xl mx-auto">
              See what changes when you take control of your attention.
            </p>
          </motion.div>

          {/* Toggle */}
          <motion.div variants={fadeUp} className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-1 p-1.5 rounded-full bg-zinc-100 border border-zinc-200">
              <button
                onClick={() => setActiveView("before")}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                  activeView === "before"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                )}
              >
                <span className="flex items-center gap-2">
                  <X className="w-4 h-4" />
                  YouTube
                </span>
              </button>
              <button
                onClick={() => setActiveView("after")}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                  activeView === "after"
                    ? "bg-white text-teal-600 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                )}
              >
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  FocusTube
                </span>
              </button>
            </div>
          </motion.div>

          {/* Comparison view */}
          <motion.div variants={fadeUp}>
            <div className="relative">
              {/* Glow effect */}
              <motion.div
                className="absolute -inset-4 rounded-3xl blur-xl opacity-30"
                animate={{
                  background: activeView === "before"
                    ? "linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(249, 115, 22, 0.3))"
                    : "linear-gradient(135deg, rgba(13, 148, 136, 0.3), rgba(16, 185, 129, 0.3))",
                }}
                transition={{ duration: 0.5 }}
              />

              {/* Main comparison card */}
              <div className="relative bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden">
                {/* Header bar */}
                <div className={cn(
                  "px-6 py-4 border-b transition-colors duration-300",
                  activeView === "before" 
                    ? "bg-red-50 border-red-100" 
                    : "bg-teal-50 border-teal-100"
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        animate={{
                          backgroundColor: activeView === "before" ? "#fef2f2" : "#f0fdfa",
                        }}
                      >
                        {activeView === "before" ? (
                          <Play className="w-5 h-5 text-red-600 fill-red-600" />
                        ) : (
                          <Tv className="w-5 h-5 text-teal-600" />
                        )}
                      </motion.div>
                      <div>
                        <div className="font-semibold text-zinc-900">
                          {activeView === "before" ? "Typical YouTube Feed" : "Your FocusTube Feed"}
                        </div>
                        <div className={cn(
                          "text-xs font-medium",
                          activeView === "before" ? "text-red-500" : "text-teal-600"
                        )}>
                          {activeView === "before" 
                            ? "Algorithm decides what you see"
                            : "Only channels you chose"
                          }
                        </div>
                      </div>
                    </div>
                    <div className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5",
                      activeView === "before"
                        ? "bg-red-100 text-red-600"
                        : "bg-teal-100 text-teal-600"
                    )}>
                      {activeView === "before" ? (
                        <>
                          <X className="w-3 h-3" />
                          No control
                        </>
                      ) : (
                        <>
                          <Check className="w-3 h-3" />
                          You decide
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 min-h-[320px]">
                  <AnimatePresence mode="wait">
                    {activeView === "before" ? (
                      <motion.div
                        key="before"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-3"
                      >
                        {noisyElements.map((item, i) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: shouldReduceMotion ? 0 : i * 0.08 }}
                            className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-100 hover:border-zinc-200 transition-colors"
                          >
                            <motion.div
                              className={cn("w-12 h-12 rounded-xl flex items-center justify-center", item.bg)}
                              animate={shouldReduceMotion ? {} : {
                                rotate: [0, 3, -3, 0],
                              }}
                              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                            >
                              <item.icon className={cn("w-6 h-6", item.color)} />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-48 bg-zinc-200 rounded" />
                              </div>
                              <div className="text-xs text-zinc-400 mt-1">{item.category}</div>
                              <div className={cn("text-xs font-medium mt-0.5", item.color)}>
                                {item.label}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        <div className="text-center pt-4">
                          <span className="text-sm text-zinc-400">
                            ...and 47 more you never asked for
                          </span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="after"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-3"
                      >
                        {cleanChannels.map((channel, i) => (
                          <motion.div
                            key={channel.name}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: shouldReduceMotion ? 0 : i * 0.1 }}
                            className="flex items-center gap-4 p-4 rounded-xl bg-teal-50/50 border border-teal-100 hover:border-teal-200 hover:bg-teal-50 transition-all cursor-pointer group"
                          >
                            <img
                              src={channel.avatar}
                              alt={channel.name}
                              className="w-12 h-12 rounded-full group-hover:scale-105 transition-transform"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-zinc-900 group-hover:text-teal-700 transition-colors">
                                {channel.video}
                              </div>
                              <div className="text-sm text-zinc-500">
                                {channel.name}
                              </div>
                              <div className="text-xs text-zinc-400 mt-0.5">
                                {channel.time}
                              </div>
                            </div>
                            <Play className="w-5 h-5 text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </motion.div>
                        ))}
                        <div className="text-center pt-6">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: "spring" }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700"
                          >
                            <Check className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              That's it. Only what you chose.
                            </span>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom indicator */}
          <motion.div variants={fadeUp} className="flex justify-center mt-10">
            <motion.div
              className="flex items-center gap-4 px-6 py-3 rounded-full bg-zinc-100 border border-zinc-200"
              animate={shouldReduceMotion ? {} : { scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className={cn(
                "text-sm font-medium transition-colors",
                activeView === "before" ? "text-red-500" : "text-zinc-400"
              )}>
                Chaos
              </span>
              <ArrowRight className="w-4 h-4 text-zinc-400" />
              <span className={cn(
                "text-sm font-medium transition-colors",
                activeView === "after" ? "text-teal-600" : "text-zinc-400"
              )}>
                Focus
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
