"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Play, ThumbsUp, Bell, Clock, Shuffle, X, Check } from "lucide-react";
import { fadeUp, staggerContainer } from "./motion";

const noisyElements = [
  { icon: ThumbsUp, label: "Recommended for you", delay: 0 },
  { icon: Shuffle, label: "Mix - Quick picks", delay: 0.1 },
  { icon: Clock, label: "Watch it again", delay: 0.2 },
  { icon: Bell, label: "From your subscriptions", delay: 0.3 },
  { icon: Play, label: "Shorts", delay: 0.4 },
];

const cleanElements = [
  { channel: "3Blue1Brown", time: "2 hours ago" },
  { channel: "Fireship", time: "4 hours ago" },
  { channel: "Veritasium", time: "1 day ago" },
];

export function BeforeAfter() {
  const [view, setView] = useState<"before" | "after">("before");
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto"
        >
          {/* Section header */}
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Your feed,{" "}
              <span className="text-accent">purified.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Pick channels. Get feed. Watch. Leave.
            </p>
          </motion.div>

          {/* Toggle */}
          <motion.div variants={fadeUp} className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl bg-muted/30 border border-border/50">
              <button
                onClick={() => setView("before")}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  view === "before"
                    ? "bg-destructive/80 text-white shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <X className="w-4 h-4" />
                Before
              </button>
              <button
                onClick={() => setView("after")}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  view === "after"
                    ? "bg-accent text-white shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Check className="w-4 h-4" />
                After
              </button>
            </div>
          </motion.div>

          {/* Comparison card */}
          <motion.div
            variants={fadeUp}
            className="relative rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
          >
            {/* Decorative corner elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-accent/10 to-transparent pointer-events-none" />

            <div className="relative p-8 md:p-12 min-h-[400px]">
              <AnimatePresence mode="wait">
                {view === "before" ? (
                  <motion.div
                    key="before"
                    initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: shouldReduceMotion ? 0 : 20 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-4"
                  >
                    <div className="text-sm text-destructive/80 font-medium mb-6 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                      Typical YouTube Homepage
                    </div>
                    {noisyElements.map((item, i) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: shouldReduceMotion ? 0 : item.delay }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/30"
                      >
                        <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-destructive/70" />
                        </div>
                        <div className="flex-1">
                          <div className="h-3 w-48 bg-muted rounded" />
                          <div className="h-2 w-32 bg-muted/50 rounded mt-2" />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.label}
                        </div>
                      </motion.div>
                    ))}
                    <div className="text-center pt-4">
                      <span className="text-sm text-muted-foreground">
                        ...and 50 more recommendations you didn't ask for
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="after"
                    initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-4"
                  >
                    <div className="text-sm text-accent font-medium mb-6 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-accent" />
                      Your FocusTube Feed
                    </div>
                    {cleanElements.map((item, i) => (
                      <motion.div
                        key={item.channel}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: shouldReduceMotion ? 0 : i * 0.1 }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-accent/5 border border-accent/20 hover:border-accent/40 transition-colors cursor-pointer group"
                      >
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Play className="w-6 h-6 text-accent" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-foreground mb-1">
                            {item.channel}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            New video • {item.time}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <div className="text-center pt-8">
                      <span className="text-sm text-accent/80">
                        That's it. Only what you chose.
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

