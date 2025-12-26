"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Tv, Clock, Sparkles, Check } from "lucide-react";
import { staggerContainer, fadeUp, scaleIn } from "./motion";

// Popular YouTube channels with real thumbnails
const HERO_CHANNELS = [
  {
    id: 1,
    thumbnail: "https://i.ytimg.com/vi/XuSz4YQYGEQ/maxresdefault.jpg",
    title: "The BEST Smartphones of 2024!",
    channel: "MKBHD",
    channelAvatar: "https://yt3.googleusercontent.com/lkH37D712tiyphLsBkT8CRLSLCLMOeSLKyxdY6mfSdWB7sJBxwfnYc_VNQBqQ6-2TkM3Nj5Hpg=s176-c-k-c0x00ffffff-no-rj",
    views: "4.2M views",
    time: "2 days ago",
    duration: "18:45",
  },
  {
    id: 2,
    thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    title: "Framework Laptop 16 Review",
    channel: "Linus Tech Tips",
    channelAvatar: "https://yt3.googleusercontent.com/Vy6KL7EM_apxPSxF0pPy5w_c87YDTOlBQo3MADZ0ynNu8bWh3UjdgGTc1cTN2VgRRUgBzNVR5Q=s176-c-k-c0x00ffffff-no-rj",
    views: "2.8M views",
    time: "5 days ago",
    duration: "21:33",
  },
  {
    id: 3,
    thumbnail: "https://i.ytimg.com/vi/OcE7_nLX5W0/maxresdefault.jpg",
    title: "The Bizarre Behavior of Rotating Bodies",
    channel: "Veritasium",
    channelAvatar: "https://yt3.googleusercontent.com/ytc/AIdro_kED97yk3MKP6Abzc5u9pnNBWH8pKzYh-36EJNWBLpvhg=s176-c-k-c0x00ffffff-no-rj",
    views: "12M views",
    time: "1 month ago",
    duration: "15:42",
  },
  {
    id: 4,
    thumbnail: "https://i.ytimg.com/vi/aircAruvnKk/maxresdefault.jpg",
    title: "But what is a neural network?",
    channel: "3Blue1Brown",
    channelAvatar: "https://yt3.googleusercontent.com/ytc/AIdro_nFzgcTrxulXeYVmDXRAblMhvQ-MjI1aTXU3kqwQS5a=s176-c-k-c0x00ffffff-no-rj",
    views: "18M views",
    time: "2 years ago",
    duration: "19:13",
  },
];

// Modern FocusTube Logo
function FocusTubeLogo({ className = "", size = "default" }: { className?: string; size?: "small" | "default" | "large" }) {
  const sizes = {
    small: { wrapper: "h-8", icon: "w-6 h-6", text: "text-lg" },
    default: { wrapper: "h-10", icon: "w-8 h-8", text: "text-xl" },
    large: { wrapper: "h-12", icon: "w-10 h-10", text: "text-2xl" },
  };
  const s = sizes[size];
  
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Modern play button icon */}
      <div className={`${s.icon} rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/25`}>
        <Play className="w-[55%] h-[55%] text-white fill-white ml-0.5" />
      </div>
      <span className={`${s.text} font-display font-semibold text-foreground tracking-tight`}>
        FocusTube
      </span>
    </div>
  );
}

// Device mockup showing real YouTube content
function DeviceMockup() {
  return (
    <div className="device-frame">
      <div className="device-screen aspect-[4/3] p-4">
        {/* App header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <Play className="w-3 h-3 text-white fill-white ml-0.5" />
            </div>
            <span className="text-white/90 text-sm font-medium">Your Feed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-teal-400" />
              <span className="text-teal-400 text-[10px] font-medium">32 min today</span>
            </div>
          </div>
        </div>

        {/* Video grid */}
        <div className="grid grid-cols-2 gap-3">
          {HERO_CHANNELS.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
              className="group cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-800 mb-2">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Duration badge */}
                <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-white text-[10px] font-medium">
                  {video.duration}
                </div>
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </motion.div>
                </div>
              </div>
              
              {/* Video info */}
              <div className="flex gap-2">
                <img 
                  src={video.channelAvatar} 
                  alt={video.channel}
                  className="w-6 h-6 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-white/90 text-[11px] font-medium line-clamp-2 leading-tight mb-0.5">
                    {video.title}
                  </h4>
                  <p className="text-white/50 text-[10px]">{video.channel}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const algorithmCopy = {
  headline: "The algorithm owns your attention.",
  subhead: "Endless recommendations. Autoplay rabbit holes. Hours lost to content you never asked for.",
};

const youCopy = {
  headline: "You own your attention.",
  subhead: "Only channels you choose. No recommendations. Watch with intent, then close the tab.",
};

export function HeroGlass() {
  const [mode, setMode] = useState<"algorithm" | "you">("algorithm");
  const shouldReduceMotion = useReducedMotion();
  const copy = mode === "algorithm" ? algorithmCopy : youCopy;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 bg-mesh" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern" />
      
      {/* Gradient orbs */}
      <motion.div
        className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full opacity-60"
        style={{
          background: "radial-gradient(circle, rgba(255, 0, 0, 0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={shouldReduceMotion ? {} : {
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] rounded-full opacity-60"
        style={{
          background: "radial-gradient(circle, rgba(13, 148, 136, 0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={shouldReduceMotion ? {} : {
          x: [0, -30, 0],
          y: [0, 20, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-7xl mx-auto">
          {/* Left: Text content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div variants={scaleIn} className="mb-8 flex justify-center lg:justify-start">
              <motion.div 
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-zinc-200 shadow-sm"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                </div>
                <span className="text-zinc-700 text-sm font-medium">
                  YouTube, minus the algorithm
                </span>
              </motion.div>
            </motion.div>

            {/* Toggle */}
            <motion.div variants={fadeUp} className="mb-8 flex justify-center lg:justify-start">
              <div className="inline-flex items-center gap-1 p-1 rounded-full bg-zinc-100 border border-zinc-200">
                <button
                  onClick={() => setMode("algorithm")}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    mode === "algorithm"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-700"
                  }`}
                >
                  Algorithm
                </button>
                <button
                  onClick={() => setMode("you")}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    mode === "you"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-700"
                  }`}
                >
                  You
                </button>
              </div>
            </motion.div>

            {/* Headline */}
            <div className="relative min-h-[100px] md:min-h-[140px] mb-6">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={mode}
                  initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -30, filter: "blur(8px)" }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className={`font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] ${
                    mode === "algorithm" ? "text-zinc-900" : "text-teal-600"
                  }`}
                >
                  {copy.headline}
                </motion.h1>
              </AnimatePresence>
            </div>

            {/* Subhead */}
            <div className="relative min-h-[60px] mb-10">
              <AnimatePresence mode="wait">
                <motion.p
                  key={mode}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  className="text-lg md:text-xl text-zinc-600 max-w-xl mx-auto lg:mx-0"
                >
                  {copy.subhead}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link href="#waitlist">
                <Button
                  size="lg"
                  className="h-14 px-8 text-base bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 rounded-xl"
                >
                  Get Early Access
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-base border-zinc-300 text-zinc-700 hover:bg-zinc-50 rounded-xl"
                >
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </Button>
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              variants={fadeUp}
              className="mt-10 flex items-center justify-center lg:justify-start gap-6"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 border-2 border-white"
                  />
                ))}
              </div>
              <div className="text-sm text-zinc-500">
                <span className="font-semibold text-zinc-700">500+</span> people on the waitlist
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Device mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotateY: -5 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative flex justify-center lg:justify-end perspective-1000"
          >
            <div className="relative">
              {/* Main device */}
              <motion.div
                animate={shouldReduceMotion ? {} : {
                  y: [0, -8, 0],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <DeviceMockup />
              </motion.div>

              {/* Floating badges */}
              <motion.div
                className="absolute -top-4 -left-4 lg:-left-8"
                animate={shouldReduceMotion ? {} : {
                  y: [0, -6, 0],
                  rotate: [0, 2, 0],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="glass-surface px-3 py-2 rounded-xl flex items-center gap-2">
                  <Tv className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-medium text-zinc-700">4 channels</span>
                </div>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -right-4 lg:-right-8"
                animate={shouldReduceMotion ? {} : {
                  y: [0, 6, 0],
                  rotate: [0, -2, 0],
                }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <div className="glass-surface px-3 py-2 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-500" />
                  <span className="text-xs font-medium text-zinc-700">No distractions</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-zinc-300 flex justify-center pt-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}
