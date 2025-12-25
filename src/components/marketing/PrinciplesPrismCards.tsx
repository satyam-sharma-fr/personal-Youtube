"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GlassCard } from "./glass/GlassSurface";
import { useTiltVars } from "@/hooks/usePointerVars";
import { Target, Ban, Zap } from "lucide-react";
import { fadeUp, staggerContainer } from "./motion";

const principles = [
  {
    icon: Target,
    title: "Only channels you pick.",
    description:
      "You decide what shows up. Add channels you love, remove ones you don't. Full control, zero algorithmic interference.",
    gradient: "from-primary/20 to-primary/5",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    borderGlow: "group-hover:shadow-[0_0_30px_-5px_var(--primary)]",
  },
  {
    icon: Ban,
    title: "No recommendations.",
    description:
      "Zero algorithmic suggestions. No 'you might also like.' No autoplay into oblivion. Just what you asked for.",
    gradient: "from-accent/20 to-accent/5",
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
    borderGlow: "group-hover:shadow-[0_0_30px_-5px_var(--accent)]",
  },
  {
    icon: Zap,
    title: "Fast. Cached. Ready.",
    description:
      "Your feed loads instantly from cache. We pre-fetch channel updates so you spend time watching, not waiting.",
    gradient: "from-chart-3/20 to-chart-3/5",
    iconBg: "bg-chart-3/10",
    iconColor: "text-chart-3",
    borderGlow: "group-hover:shadow-[0_0_30px_-5px_var(--chart-3)]",
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
    >
      <GlassCard
        hover={false}
        className={`relative h-full bg-gradient-to-b ${principle.gradient} transition-shadow duration-500 ${principle.borderGlow}`}
      >
        {/* Specular sweep overlay */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
          initial={false}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(
                105deg,
                transparent 40%,
                rgba(255, 255, 255, 0.03) 45%,
                rgba(255, 255, 255, 0.06) 50%,
                rgba(255, 255, 255, 0.03) 55%,
                transparent 60%
              )`,
              transform: "translateX(var(--px, 0))",
            }}
          />
        </motion.div>

        {/* Icon */}
        <motion.div
          className={`w-16 h-16 rounded-2xl ${principle.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
          style={shouldReduceMotion ? {} : { transform: "translateZ(20px)" }}
        >
          <principle.icon className={`w-8 h-8 ${principle.iconColor}`} />
        </motion.div>

        {/* Content */}
        <h3 className="text-xl font-bold mb-3">{principle.title}</h3>
        <p className="text-muted-foreground leading-relaxed">
          {principle.description}
        </p>

        {/* Number badge */}
        <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-background/50 border border-border/50 flex items-center justify-center text-xs font-mono text-muted-foreground">
          0{index + 1}
        </div>

        {/* Corner accent */}
        <div className={`absolute bottom-0 right-0 w-24 h-24 ${principle.iconBg} rounded-tl-3xl opacity-50 -z-10`} />
      </GlassCard>
    </motion.div>
  );
}

export function PrinciplesPrismCards() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-full blur-3xl" />
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
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Three principles.{" "}
              <span className="text-muted-foreground">One mission.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Built around one idea: you should control what you watch.
            </p>
          </motion.div>

          {/* Principles grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {principles.map((principle, i) => (
              <PrismCard key={principle.title} principle={principle} index={i} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

