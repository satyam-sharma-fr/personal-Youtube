"use client";

import { motion, AnimatePresence, useReducedMotion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ChaosToCalm {
  mode: "chaos" | "calm";
  children: ReactNode;
  className?: string;
}

export function ChaosToCalm({ mode, children, className }: ChaosToCalm) {
  const shouldReduceMotion = useReducedMotion();
  
  const chaosVariants: Variants = {
    initial: { scale: 1, rotate: 0 },
    animate: {
      x: [-2, 2, -1, 1, -2],
      y: [1, -1, 2, -2, 1],
      rotate: [-1, 1, -1, 1, 0],
      transition: {
        duration: 0.4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };
  
  const calmVariants: Variants = {
    initial: { scale: 1, x: 0, y: 0, rotate: 0 },
    animate: {
      scale: [1, 1.01, 1],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };
  
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }
  
  return (
    <motion.div
      className={className}
      variants={mode === "chaos" ? chaosVariants : calmVariants}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  );
}

// Transition wrapper for mode switching with animation
interface ModeTransitionProps {
  mode: "chaos" | "calm";
  children: ReactNode;
  className?: string;
}

export function ModeTransition({ mode, children, className }: ModeTransitionProps) {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mode}
        className={className}
        initial={shouldReduceMotion ? {} : { 
          opacity: 0, 
          scale: 0.95,
          filter: "blur(10px)",
        }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          filter: "blur(0px)",
        }}
        exit={shouldReduceMotion ? {} : { 
          opacity: 0, 
          scale: 1.05,
          filter: "blur(10px)",
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Color transition for text/elements switching between chaos red and calm teal
interface ColorTransitionProps {
  mode: "chaos" | "calm";
  chaosColor?: string;
  calmColor?: string;
  children: ReactNode;
  className?: string;
  as?: "div" | "span" | "p" | "h1" | "h2" | "h3";
}

export function ColorTransition({
  mode,
  chaosColor = "#FF0000",
  calmColor = "#4a9e9e",
  children,
  className,
  as: Component = "div",
}: ColorTransitionProps) {
  const shouldReduceMotion = useReducedMotion();
  
  const MotionComponent = motion[Component];
  
  return (
    <MotionComponent
      className={className}
      animate={{
        color: mode === "chaos" ? chaosColor : calmColor,
      }}
      transition={{ 
        duration: shouldReduceMotion ? 0 : 0.5, 
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </MotionComponent>
  );
}

// Background glow transition
interface GlowTransitionProps {
  mode: "chaos" | "calm";
  children: ReactNode;
  className?: string;
}

export function GlowTransition({ mode, children, className }: GlowTransitionProps) {
  const shouldReduceMotion = useReducedMotion();
  
  const chaosGlow = "0 0 40px -10px rgba(255, 0, 0, 0.5)";
  const calmGlow = "0 0 40px -10px rgba(74, 158, 158, 0.4)";
  
  return (
    <motion.div
      className={className}
      animate={{
        boxShadow: mode === "chaos" ? chaosGlow : calmGlow,
      }}
      transition={{ 
        duration: shouldReduceMotion ? 0 : 0.6, 
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

// Particle reorganization effect
interface ParticleReorgProps {
  mode: "chaos" | "calm";
  particleCount?: number;
  className?: string;
}

export function ParticleReorg({ 
  mode, 
  particleCount = 12,
  className,
}: ParticleReorgProps) {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) return null;
  
  // Generate particles in a grid for calm mode, random for chaos
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const row = Math.floor(i / 4);
    const col = i % 4;
    
    return {
      id: i,
      // Calm mode: organized grid
      calmX: 20 + col * 20,
      calmY: 25 + row * 25,
      // Chaos mode: random positions
      chaosX: Math.random() * 80 + 10,
      chaosY: Math.random() * 80 + 10,
      size: Math.random() * 6 + 4,
      delay: i * 0.05,
    };
  });
  
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#FF0000]"
          style={{ width: p.size, height: p.size }}
          animate={{
            left: `${mode === "chaos" ? p.chaosX : p.calmX}%`,
            top: `${mode === "chaos" ? p.chaosY : p.calmY}%`,
            opacity: mode === "chaos" ? [0.2, 0.4, 0.2] : 0.15,
            scale: mode === "chaos" ? [1, 1.2, 1] : 1,
            rotate: mode === "chaos" ? [0, 180, 360] : 0,
          }}
          transition={{
            duration: mode === "chaos" ? 1 : 0.8,
            ease: [0.22, 1, 0.36, 1],
            delay: p.delay,
            opacity: mode === "chaos" 
              ? { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.5 },
            scale: mode === "chaos"
              ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.5 },
            rotate: mode === "chaos"
              ? { duration: 2, repeat: Infinity, ease: "linear" }
              : { duration: 0.5 },
          }}
        />
      ))}
    </div>
  );
}

