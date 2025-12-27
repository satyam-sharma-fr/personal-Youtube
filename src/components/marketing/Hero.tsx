"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { staggerContainer, fadeUp, blurIn, scaleIn } from "./motion";

const algorithmCopy = {
  headline: "The algorithm owns your attention.",
  subhead: "Endless recommendations. Autoplay rabbit holes. Hours lost to content you never asked for.",
};

const youCopy = {
  headline: "You own your attention.",
  subhead: "Only channels you choose. No recommendations. Watch with intent, then leave.",
};

export function Hero() {
  const [mode, setMode] = useState<"algorithm" | "you">("algorithm");
  const shouldReduceMotion = useReducedMotion();
  const copy = mode === "algorithm" ? algorithmCopy : youCopy;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
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

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={scaleIn} className="mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              YouTube, minus the algorithm
            </span>
          </motion.div>

          {/* Toggle */}
          <motion.div variants={fadeUp} className="mb-10">
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
          <div className="relative h-[120px] md:h-[160px] mb-8">
            <AnimatePresence mode="wait">
              <motion.h1
                key={mode}
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={`absolute inset-0 text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight ${
                  mode === "algorithm" ? "text-foreground" : "text-accent"
                }`}
              >
                {copy.headline}
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* Subhead */}
          <div className="relative h-[80px] md:h-[60px] mb-12">
            <AnimatePresence mode="wait">
              <motion.p
                key={mode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                className="absolute inset-0 text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto"
              >
                {copy.subhead}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="#pricing">
              <Button
                size="lg"
                className="h-14 px-8 text-lg group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity"
                  layoutId="button-glow"
                />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg border-border/50 hover:border-primary/50"
              >
                <Zap className="mr-2 w-5 h-5" />
                See How It Works
              </Button>
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2"
            >
              <motion.div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

