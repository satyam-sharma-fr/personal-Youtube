"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Plus, Layout, Play, ArrowRight } from "lucide-react";
import { fadeUp, staggerContainer } from "./motion";

const steps = [
  {
    icon: Plus,
    title: "Add your channels",
    description: "Search and add only the YouTube channels you actually want to follow.",
    visual: "channels",
  },
  {
    icon: Layout,
    title: "Browse your feed",
    description: "A clean chronological feed with only videos from channels you picked.",
    visual: "feed",
  },
  {
    icon: Play,
    title: "Watch with intent",
    description: "No sidebar. No autoplay. Watch what you came for, then move on.",
    visual: "watch",
  },
];

export function HowItWorks() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="how-it-works" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Section header */}
          <motion.div variants={fadeUp} className="text-center mb-20">
            <span className="text-sm font-medium text-primary mb-4 block">
              How it works
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Simple by design.
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Three steps to reclaim your attention.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="max-w-5xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                variants={fadeUp}
                className="relative"
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute left-[39px] top-[88px] w-0.5 h-24 bg-gradient-to-b from-border to-transparent hidden md:block" />
                )}

                <div className="flex flex-col md:flex-row items-start gap-6 md:gap-12 mb-16 md:mb-24">
                  {/* Step indicator */}
                  <motion.div
                    whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
                    className="flex-shrink-0 relative"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-border/50 flex items-center justify-center">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xs font-bold text-primary">
                      {i + 1}
                    </div>
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
                      {step.description}
                    </p>
                  </div>

                  {/* Visual placeholder */}
                  <motion.div
                    whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                    className="flex-shrink-0 w-full md:w-64 h-40 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/30 flex items-center justify-center group cursor-pointer overflow-hidden"
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <step.icon className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Step {i + 1}
                      </span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Final arrow */}
          <motion.div
            variants={fadeUp}
            className="text-center"
          >
            <div className="inline-flex items-center gap-3 text-muted-foreground">
              <span className="text-lg">That's it. Done.</span>
              <ArrowRight className="w-5 h-5 text-accent" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

