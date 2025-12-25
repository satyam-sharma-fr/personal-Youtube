"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassPortal, GlassSurface } from "./glass/GlassSurface";
import { usePointerVars } from "@/hooks/usePointerVars";
import { ArrowRight, Sparkles, Play, Tv, Grid3X3, Clock } from "lucide-react";
import { staggerContainer, fadeUp, scaleIn } from "./motion";

// Real YouTube thumbnails for the hero animation
const HERO_THUMBNAILS = [
  {
    id: 1,
    thumbnail: "https://i.ytimg.com/vi/aircAruvnKk/mqdefault.jpg",
    title: "Neural Networks",
    channel: "3Blue1Brown",
    duration: "19:13",
  },
  {
    id: 2,
    thumbnail: "https://i.ytimg.com/vi/Tn6-PIqc4UM/mqdefault.jpg",
    title: "React in 100 Seconds",
    channel: "Fireship",
    duration: "2:27",
  },
  {
    id: 3,
    thumbnail: "https://i.ytimg.com/vi/094y1Z2wpJg/mqdefault.jpg",
    title: "Collatz Conjecture",
    channel: "Veritasium",
    duration: "22:09",
  },
  {
    id: 4,
    thumbnail: "https://i.ytimg.com/vi/XuSz4YQYGEQ/mqdefault.jpg",
    title: "Best Smartphone 2024",
    channel: "MKBHD",
    duration: "18:45",
  },
];

// Mock dashboard preview for the hero glass device
function MockDashboardMini() {
  return (
    <div className="relative w-full h-full bg-background/80 rounded-lg overflow-hidden">
      {/* Mini header */}
      <div className="flex items-center gap-2 p-3 border-b border-border/30">
        <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
          <Play className="w-3 h-3 text-primary fill-primary" />
        </div>
        <div className="h-2 w-16 bg-muted rounded" />
        <div className="ml-auto flex gap-1">
          <div className="w-6 h-6 rounded-full bg-muted/50" />
        </div>
      </div>

      {/* Mini video grid with real thumbnails */}
      <div className="p-3 grid grid-cols-2 gap-2">
        {HERO_THUMBNAILS.map((video, i) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.3 }}
            className="space-y-1.5 group"
          >
            <div className="aspect-video rounded-md overflow-hidden relative bg-muted/30">
              {/* Real YouTube thumbnail */}
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Duration badge */}
              <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[8px] px-1 py-0.5 rounded font-medium">
                {video.duration}
              </span>
              {/* Play overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="w-6 h-6 rounded-full bg-primary/90 flex items-center justify-center">
                  <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                </div>
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-[9px] font-medium text-foreground/90 line-clamp-1 leading-tight">
                {video.title}
              </div>
              <div className="text-[8px] text-muted-foreground">
                {video.channel}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating watch time indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30"
      >
        <Clock className="w-3 h-3 text-emerald-400" />
        <span className="text-[10px] font-medium text-emerald-400">0:15:30</span>
      </motion.div>
    </div>
  );
}

const algorithmCopy = {
  headline: "The algorithm owns your attention.",
  subhead: "Endless recommendations. Autoplay rabbit holes. Hours lost to content you never asked for.",
};

const youCopy = {
  headline: "You own your attention.",
  subhead: "Only channels you choose. No recommendations. Watch with intent, then leave.",
};

export function HeroGlass() {
  const [mode, setMode] = useState<"algorithm" | "you">("algorithm");
  const shouldReduceMotion = useReducedMotion();
  const glassRef = useRef<HTMLDivElement>(null);
  const copy = mode === "algorithm" ? algorithmCopy : youCopy;

  usePointerVars(glassRef, { enabled: !shouldReduceMotion });

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: [0, 50, 0],
                  y: [0, -30, 0],
                  scale: [1, 1.1, 1],
                }
          }
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: [0, -40, 0],
                  y: [0, 40, 0],
                  scale: [1.1, 1, 1.1],
                }
          }
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
          {/* Left: Text content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div variants={scaleIn} className="mb-8 flex justify-center lg:justify-start">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                YouTube, minus the algorithm
              </span>
            </motion.div>

            {/* Toggle */}
            <motion.div variants={fadeUp} className="mb-8 flex justify-center lg:justify-start">
              <div className="inline-flex items-center gap-1 p-1 rounded-full bg-muted/50 border border-border/50">
                <button
                  onClick={() => setMode("algorithm")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    mode === "algorithm"
                      ? "bg-destructive/80 text-white shadow-lg"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Algorithm
                </button>
                <button
                  onClick={() => setMode("you")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    mode === "you"
                      ? "bg-accent text-white shadow-lg"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  You
                </button>
              </div>
            </motion.div>

            {/* Headline */}
            <div className="relative min-h-[100px] md:min-h-[120px] mb-6">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={mode}
                  initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight ${
                    mode === "algorithm" ? "text-foreground" : "text-accent"
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
                  className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0"
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
                  className="h-14 px-8 text-lg group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Join Early Access
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </Button>
              </Link>
              <Link href="/demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg border-border/50 hover:border-accent/50"
                >
                  <Play className="mr-2 w-5 h-5" />
                  Try Live Demo
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: Glass device preview */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="relative flex justify-center lg:justify-end"
          >
            <div ref={glassRef} className="relative w-full max-w-md">
              <GlassPortal
                glowing={!shouldReduceMotion}
                className="aspect-[4/3] p-3"
              >
                <MockDashboardMini />
              </GlassPortal>

              {/* Floating feature badges */}
              {!shouldReduceMotion && (
                <>
                  <motion.div
                    className="absolute -top-4 -left-4"
                    animate={{
                      y: [0, -8, 0],
                      rotate: [0, 3, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <GlassSurface className="px-3 py-2 flex items-center gap-2">
                      <Tv className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium">Your channels</span>
                    </GlassSurface>
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-4 -right-4"
                    animate={{
                      y: [0, 6, 0],
                      rotate: [0, -3, 0],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                  >
                    <GlassSurface className="px-3 py-2 flex items-center gap-2">
                      <Grid3X3 className="w-4 h-4 text-accent" />
                      <span className="text-xs font-medium">Categories</span>
                    </GlassSurface>
                  </motion.div>
                </>
              )}
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
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2"
        >
          <motion.div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}

