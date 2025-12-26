"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTiltVars } from "@/hooks/usePointerVars";
import { Target, Ban, Zap } from "lucide-react";
import { fadeUp, staggerContainer } from "./motion";
import { cn } from "@/lib/utils";

const principles = [
  {
    icon: Target,
    title: "Only channels you pick.",
    description:
      "You decide what shows up. Add channels you love, remove ones you don't. Full control, zero algorithmic interference.",
    gradient: "from-red-50 to-red-100/50",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    borderColor: "border-red-200",
    shadowColor: "shadow-red-100/50",
  },
  {
    icon: Ban,
    title: "No recommendations.",
    description:
      "Zero algorithmic suggestions. No 'you might also like.' No autoplay into oblivion. Just what you asked for.",
    gradient: "from-teal-50 to-teal-100/50",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    borderColor: "border-teal-200",
    shadowColor: "shadow-teal-100/50",
  },
  {
    icon: Zap,
    title: "Watch with intention.",
    description:
      "Reclaim your attention. Watch what matters, then close the tab. Built for mindful consumption, not endless scrolling.",
    gradient: "from-emerald-50 to-emerald-100/50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    borderColor: "border-emerald-200",
    shadowColor: "shadow-emerald-100/50",
  },
];

function PrismCard({ 
  principle, 
  index 
}: { 
  principle: typeof principles[0]; 
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useTiltVars(cardRef, { enabled: !shouldReduceMotion, maxTilt: 8 });

  return (
    <motion.div
      ref={cardRef}
      variants={fadeUp}
      className="group relative"
      style={
        shouldReduceMotion
          ? {}
          : {
              transform: "perspective(1000px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))",
              transformStyle: "preserve-3d",
              transition: "transform 0.1s ease-out",
            }
      }
      whileHover={shouldReduceMotion ? {} : { y: -6 }}
    >
      <div
        className={cn(
          "relative h-full p-6 md:p-8 rounded-2xl bg-white border shadow-lg hover:shadow-xl transition-all duration-300",
          principle.borderColor,
          principle.shadowColor
        )}
      >
        {/* Gradient overlay */}
        <div className={cn("absolute inset-0 rounded-2xl opacity-40 bg-gradient-to-br", principle.gradient)} />
        
        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <motion.div
            className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300",
              principle.iconBg
            )}
            style={shouldReduceMotion ? {} : { transform: "translateZ(20px)" }}
          >
            <principle.icon className={cn("w-7 h-7", principle.iconColor)} />
          </motion.div>

          {/* Title */}
          <h3 className="font-display text-xl font-semibold mb-3 text-zinc-900">
            {principle.title}
          </h3>
          
          {/* Description */}
          <p className="text-zinc-600 leading-relaxed text-[15px]">
            {principle.description}
          </p>
        </div>

        {/* Number badge */}
        <div className={cn(
          "absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold",
          principle.iconBg,
          principle.iconColor
        )}>
          0{index + 1}
        </div>
      </div>
    </motion.div>
  );
}

export function PrinciplesPrismCards() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-b from-zinc-50 to-white">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />
        <motion.div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(220, 38, 38, 0.04) 0%, transparent 60%)",
            filter: "blur(80px)",
          }}
          animate={shouldReduceMotion ? {} : {
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(13, 148, 136, 0.04) 0%, transparent 60%)",
            filter: "blur(80px)",
          }}
          animate={shouldReduceMotion ? {} : {
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Section header */}
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="inline-block text-sm font-medium text-red-600 mb-3 tracking-wider uppercase">
              Our Philosophy
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-semibold mb-4 text-zinc-900">
              Three principles.{" "}
              <span className="text-teal-600">One mission.</span>
            </h2>
            <p className="text-zinc-600 text-lg max-w-xl mx-auto">
              Built around one idea: you should control what you watch.
            </p>
          </motion.div>

          {/* Principles grid */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {principles.map((principle, i) => (
              <PrismCard key={principle.title} principle={principle} index={i} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
