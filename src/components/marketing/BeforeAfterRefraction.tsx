"use client";

import { useState, useRef, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GlassSurface } from "./glass/GlassSurface";
import { Play, ThumbsUp, Bell, Clock, Shuffle, X, Check, GripVertical } from "lucide-react";
import { fadeUp, staggerContainer } from "./motion";

const noisyElements = [
  { icon: ThumbsUp, label: "Recommended for you" },
  { icon: Shuffle, label: "Mix - Quick picks" },
  { icon: Clock, label: "Watch it again" },
  { icon: Bell, label: "From your subscriptions" },
  { icon: Play, label: "Shorts" },
];

const cleanElements = [
  { channel: "3Blue1Brown", time: "2 hours ago" },
  { channel: "Fireship", time: "4 hours ago" },
  { channel: "Veritasium", time: "1 day ago" },
];

export function BeforeAfterRefraction() {
  const [splitPosition, setSplitPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleDrag = useCallback((e: React.PointerEvent | PointerEvent) => {
    if (!containerRef.current || !isDragging) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(10, Math.min(90, (x / rect.width) * 100));
    setSplitPosition(percentage);
  }, [isDragging]);

  const handlePointerDown = () => setIsDragging(true);
  const handlePointerUp = () => setIsDragging(false);

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-5xl mx-auto"
        >
          {/* Section header */}
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Your feed,{" "}
              <span className="text-accent">purified.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-4">
              Drag the handle to see the difference.
            </p>
          </motion.div>

          {/* Interactive comparison */}
          <motion.div variants={fadeUp}>
            <GlassSurface
              refraction
              className="relative overflow-hidden select-none"
              style={{ touchAction: "none" }}
            >
              <div
                ref={containerRef}
                className="relative h-[500px] md:h-[550px]"
                onPointerMove={handleDrag}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                {/* "Before" side (YouTube noise) */}
                <div
                  className="absolute inset-0 p-8 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - splitPosition}% 0 0)` }}
                >
                  <div className="h-full">
                    <div className="text-sm text-destructive/80 font-medium mb-6 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                      Typical YouTube Homepage
                      <X className="w-4 h-4 ml-auto opacity-50" />
                    </div>
                    <div className="space-y-4">
                      {noisyElements.map((item, i) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: shouldReduceMotion ? 0 : i * 0.1 }}
                          className="flex items-center gap-4 p-4 rounded-xl bg-destructive/5 border border-destructive/10"
                        >
                          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                            <item.icon className="w-5 h-5 text-destructive/70" />
                          </div>
                          <div className="flex-1">
                            <div className="h-3 w-48 bg-muted/50 rounded" />
                            <div className="h-2 w-32 bg-muted/30 rounded mt-2" />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.label}
                          </div>
                        </motion.div>
                      ))}
                      <div className="text-center pt-4">
                        <span className="text-sm text-muted-foreground">
                          ...and 50 more you didn't ask for
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* "After" side (FocusTube clean) */}
                <div
                  className="absolute inset-0 p-8 overflow-hidden"
                  style={{ clipPath: `inset(0 0 0 ${splitPosition}%)` }}
                >
                  <div className="h-full">
                    <div className="text-sm text-accent font-medium mb-6 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-accent" />
                      Your FocusTube Feed
                      <Check className="w-4 h-4 ml-auto" />
                    </div>
                    <div className="space-y-4">
                      {cleanElements.map((item, i) => (
                        <motion.div
                          key={item.channel}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
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
                    </div>
                  </div>
                </div>

                {/* Drag handle with prism effect */}
                <div
                  className="absolute top-0 bottom-0 z-20 cursor-col-resize"
                  style={{ left: `${splitPosition}%`, transform: "translateX(-50%)" }}
                  onPointerDown={handlePointerDown}
                >
                  {/* Vertical line */}
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-primary via-accent to-primary" />
                  
                  {/* Handle button */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="relative">
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-lg opacity-50" />
                      
                      {/* Handle */}
                      <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                        <GripVertical className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Labels */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 whitespace-nowrap">
                    <span className="text-xs font-medium px-2 py-1 rounded bg-destructive/20 text-destructive">
                      Before
                    </span>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-accent/20 text-accent">
                      After
                    </span>
                  </div>
                </div>
              </div>
            </GlassSurface>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

