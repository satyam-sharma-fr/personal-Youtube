"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassPortal, GlassSurface } from "./glass/GlassSurface";
import { usePointerVars } from "@/hooks/usePointerVars";
import {
  Play,
  Tv,
  Grid3X3,
  Clock,
  BarChart3,
  ArrowRight,
  Sparkles,
  Eye,
} from "lucide-react";
import { fadeUp, staggerContainer } from "./motion";

const demoFeatures = [
  {
    icon: Tv,
    title: "Curated channels",
    description: "Real YouTube channels, beautifully organized",
  },
  {
    icon: Grid3X3,
    title: "Categories & filters",
    description: "See how channel organization works",
  },
  {
    icon: Play,
    title: "Clean watch experience",
    description: "Distraction-free video player",
  },
  {
    icon: Clock,
    title: "Watch time tracking",
    description: "Daily limits and progress stats",
  },
];

// Mock preview elements for the portal window
function MockDashboardPreview() {
  return (
    <div className="relative w-full h-full bg-background/50 rounded-xl overflow-hidden">
      {/* Mock header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/30">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Play className="w-4 h-4 text-primary fill-primary" />
        </div>
        <div className="flex-1">
          <div className="h-3 w-24 bg-muted rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded-full bg-muted/50" />
          <div className="h-8 w-20 rounded-lg bg-accent/20" />
        </div>
      </div>

      {/* Mock video grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.4 }}
            className="space-y-2"
          >
            <div className="aspect-video rounded-lg bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center group cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-4 h-4 text-foreground fill-foreground ml-0.5" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-muted/60" />
              <div className="flex-1 space-y-1">
                <div className="h-2.5 w-full bg-muted/60 rounded" />
                <div className="h-2 w-2/3 bg-muted/40 rounded" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating watch time indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
        className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30"
      >
        <div className="w-4 h-4 rounded-full border-2 border-emerald-500 flex items-center justify-center">
          <Clock className="w-2 h-2 text-emerald-500" />
        </div>
        <span className="text-xs font-medium text-emerald-400">23:45 / 1:00:00</span>
      </motion.div>
    </div>
  );
}

export function DemoPortal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  usePointerVars(portalRef, { enabled: !shouldReduceMotion });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.5, 1, 1, 0.5]);

  return (
    <section
      ref={containerRef}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-6xl mx-auto"
        >
          {/* Section badge */}
          <motion.div variants={fadeUp} className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium">
              <Eye className="w-4 h-4" />
              See it in action
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Try the{" "}
              <span className="text-gradient">live demo</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the real dashboard with curated channels. No signup needed.
              Just explore.
            </p>
          </motion.div>

          {/* Main portal area */}
          <motion.div
            variants={fadeUp}
            style={shouldReduceMotion ? {} : { y, scale, opacity }}
            className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center"
          >
            {/* Portal preview */}
            <div ref={portalRef} className="relative order-2 lg:order-1">
              <GlassPortal
                glowing={!shouldReduceMotion}
                className="aspect-[4/3] p-2 md:p-3"
              >
                <MockDashboardPreview />
              </GlassPortal>

              {/* Decorative floating elements */}
              {!shouldReduceMotion && (
                <>
                  <motion.div
                    className="absolute -top-6 -right-6 w-16 h-16"
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <GlassSurface className="w-full h-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-accent" />
                    </GlassSurface>
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-4 -left-4 w-12 h-12"
                    animate={{
                      y: [0, 8, 0],
                      rotate: [0, -5, 0],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                  >
                    <GlassSurface className="w-full h-full flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </GlassSurface>
                  </motion.div>
                </>
              )}
            </div>

            {/* Features and CTA */}
            <div className="order-1 lg:order-2 space-y-8">
              {/* Feature list */}
              <div className="grid sm:grid-cols-2 gap-4">
                {demoFeatures.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    variants={fadeUp}
                    custom={i}
                    className="group"
                  >
                    <GlassSurface
                      specular={!shouldReduceMotion}
                      className="p-4 h-full"
                      whileHover={
                        shouldReduceMotion
                          ? undefined
                          : { scale: 1.02, y: -2 }
                      }
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                          <feature.icon className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{feature.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </GlassSurface>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <motion.div variants={fadeUp} className="space-y-4">
                <Link href="/demo" className="block">
                  <Button
                    size="lg"
                    className="w-full h-14 text-lg group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Play className="w-5 h-5 fill-current" />
                      Enter Live Demo
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  </Button>
                </Link>

                <p className="text-center text-sm text-muted-foreground">
                  Browse-only mode • Real channels • No account required
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

