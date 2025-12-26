"use client";

import { motion, useReducedMotion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface BreathingOrbProps {
  color?: "red" | "teal" | "mixed";
  size?: "sm" | "md" | "lg" | "xl";
  intensity?: "soft" | "medium" | "strong";
  className?: string;
}

const sizeClasses = {
  sm: "w-32 h-32",
  md: "w-64 h-64",
  lg: "w-96 h-96",
  xl: "w-[500px] h-[500px]",
};

const colorGradients = {
  red: "radial-gradient(circle, rgba(255, 0, 0, 0.4) 0%, rgba(255, 0, 0, 0.1) 40%, transparent 70%)",
  teal: "radial-gradient(circle, rgba(74, 158, 158, 0.4) 0%, rgba(74, 158, 158, 0.1) 40%, transparent 70%)",
  mixed: "radial-gradient(circle, rgba(255, 0, 0, 0.3) 0%, rgba(74, 158, 158, 0.15) 40%, transparent 70%)",
};

const intensityOpacity = {
  soft: 0.3,
  medium: 0.5,
  strong: 0.7,
};

export function BreathingOrb({
  color = "red",
  size = "lg",
  intensity = "medium",
  className,
}: BreathingOrbProps) {
  const shouldReduceMotion = useReducedMotion();
  
  const breatheVariants: Variants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [
        intensityOpacity[intensity],
        intensityOpacity[intensity] * 1.3,
        intensityOpacity[intensity],
      ],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };
  
  return (
    <motion.div
      className={cn(
        "rounded-full pointer-events-none",
        sizeClasses[size],
        className
      )}
      style={{
        background: colorGradients[color],
        filter: "blur(60px)",
        opacity: shouldReduceMotion ? intensityOpacity[intensity] : undefined,
      }}
      variants={shouldReduceMotion ? undefined : breatheVariants}
      animate="animate"
    />
  );
}

// Dual orb setup for hero background
interface DualOrbsProps {
  mode?: "chaos" | "calm";
  className?: string;
}

export function DualOrbs({ mode = "calm", className }: DualOrbsProps) {
  const shouldReduceMotion = useReducedMotion();
  
  const primaryVariants: Variants = mode === "chaos"
    ? {
        animate: {
          x: [0, 50, -30, 40, 0],
          y: [0, -40, 30, -20, 0],
          scale: [1, 1.2, 0.9, 1.1, 1],
          opacity: [0.4, 0.6, 0.3, 0.5, 0.4],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          },
        },
      }
    : {
        animate: {
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.08, 1],
          opacity: [0.35, 0.45, 0.35],
          transition: {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          },
        },
      };
  
  const secondaryVariants: Variants = mode === "chaos"
    ? {
        animate: {
          x: [0, -40, 35, -25, 0],
          y: [0, 35, -30, 25, 0],
          scale: [1.1, 0.85, 1.15, 0.95, 1.1],
          opacity: [0.3, 0.5, 0.25, 0.4, 0.3],
          transition: {
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        },
      }
    : {
        animate: {
          x: [0, -25, 0],
          y: [0, 25, 0],
          scale: [1.05, 0.98, 1.05],
          opacity: [0.25, 0.35, 0.25],
          transition: {
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          },
        },
      };
  
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Primary red orb */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255, 0, 0, 0.35) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        variants={shouldReduceMotion ? undefined : primaryVariants}
        animate="animate"
      />
      
      {/* Secondary teal orb */}
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(74, 158, 158, 0.3) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        variants={shouldReduceMotion ? undefined : secondaryVariants}
        animate="animate"
      />
    </div>
  );
}

// Ambient glow for cards and elements
interface AmbientGlowProps {
  color?: "red" | "teal";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AmbientGlow({
  color = "red",
  size = "md",
  className,
}: AmbientGlowProps) {
  const shouldReduceMotion = useReducedMotion();
  
  const sizes = {
    sm: "w-24 h-24",
    md: "w-40 h-40",
    lg: "w-64 h-64",
  };
  
  const colors = {
    red: "rgba(255, 0, 0, 0.25)",
    teal: "rgba(74, 158, 158, 0.25)",
  };
  
  const glowVariants: Variants = {
    animate: {
      opacity: [0.3, 0.5, 0.3],
      scale: [1, 1.1, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };
  
  return (
    <motion.div
      className={cn(
        "absolute rounded-full pointer-events-none",
        sizes[size],
        className
      )}
      style={{
        background: `radial-gradient(circle, ${colors[color]} 0%, transparent 70%)`,
        filter: "blur(30px)",
      }}
      variants={shouldReduceMotion ? undefined : glowVariants}
      animate="animate"
    />
  );
}

