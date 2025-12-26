"use client";

import { Variants } from "framer-motion";

// ========================================
// FocusTube Zen Animation System
// ========================================

// === Core Transitions ===
export const zenEase = [0.22, 1, 0.36, 1] as const;
export const zenEaseSlow = [0.4, 0, 0.2, 1] as const;
export const zenSpring = { type: "spring", stiffness: 100, damping: 20 } as const;

// === Fade Variants ===
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: zenEase },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const blurIn: Variants = {
  hidden: { opacity: 0, filter: "blur(12px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: zenEase },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: zenEase },
  },
};

// === Slide Variants ===
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: zenEase },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: zenEase },
  },
};

// === Stagger Containers ===
export const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

// === Text Animation Variants ===
export const letterAnimation: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: zenEase },
  },
};

export const wordAnimation: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: zenEase },
  },
};

// ========================================
// ZEN BREATHING ANIMATIONS
// ========================================

export const breathe: Variants = {
  initial: { scale: 1, opacity: 0.8 },
  animate: {
    scale: [1, 1.02, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const breatheSlow: Variants = {
  initial: { scale: 1, opacity: 0.9 },
  animate: {
    scale: [1, 1.015, 1],
    opacity: [0.9, 1, 0.9],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const breatheGlow: Variants = {
  initial: { 
    boxShadow: "0 0 30px -10px rgba(255, 0, 0, 0.3)",
    scale: 1,
  },
  animate: {
    boxShadow: [
      "0 0 30px -10px rgba(255, 0, 0, 0.3)",
      "0 0 50px -10px rgba(255, 0, 0, 0.5)",
      "0 0 30px -10px rgba(255, 0, 0, 0.3)",
    ],
    scale: [1, 1.01, 1],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ========================================
// CHAOS MODE ANIMATIONS (Algorithm)
// ========================================

export const chaos: Variants = {
  initial: { x: 0, y: 0, rotate: 0 },
  animate: {
    x: [-2, 2, -1, 1, -2],
    y: [1, -1, 2, -2, 1],
    rotate: [-1, 1, -1, 1, 0],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const chaosFast: Variants = {
  initial: { x: 0, y: 0, rotate: 0 },
  animate: {
    x: [-3, 3, -2, 2, -3],
    y: [2, -2, 3, -3, 2],
    rotate: [-2, 2, -1, 1, 0],
    transition: {
      duration: 0.3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const chaosParticle: Variants = {
  initial: { 
    x: 0, 
    y: 0, 
    opacity: 0.3,
    scale: 1,
  },
  animate: {
    x: [0, -5, 5, -3, 3, 0],
    y: [0, 3, -5, 5, -3, 0],
    opacity: [0.3, 0.5, 0.2, 0.4, 0.3],
    scale: [1, 1.1, 0.9, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ========================================
// CALM MODE ANIMATIONS (You)
// ========================================

export const calm: Variants = {
  initial: { x: 0, y: 0 },
  animate: {
    y: [0, -5, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const calmFloat: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-8, 8, -8],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const calmParticle: Variants = {
  initial: { 
    opacity: 0.15,
    scale: 1,
  },
  animate: {
    opacity: [0.15, 0.25, 0.15],
    scale: [1, 1.02, 1],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ========================================
// CHAOS TO CALM TRANSITION
// ========================================

export const chaosToCalm: Variants = {
  chaos: {
    x: [-2, 2, -1, 1, -2],
    y: [1, -1, 2, -2, 1],
    rotate: [-1, 1, -1, 1, 0],
    scale: [1, 1.05, 0.98, 1.02, 1],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  calm: {
    x: 0,
    y: [0, -3, 0],
    rotate: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: zenEase,
      y: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
};

export const glowChaosToCalm: Variants = {
  chaos: {
    boxShadow: [
      "0 0 20px -5px rgba(255, 0, 0, 0.5)",
      "0 0 40px -5px rgba(255, 0, 0, 0.7)",
      "0 0 25px -5px rgba(255, 0, 0, 0.4)",
    ],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  calm: {
    boxShadow: "0 0 40px -10px rgba(74, 158, 158, 0.4)",
    transition: {
      duration: 0.8,
      ease: zenEase,
    },
  },
};

// ========================================
// FLOATING ANIMATIONS
// ========================================

export const floatAnimation: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const floatRotate: Variants = {
  initial: { y: 0, rotate: 0 },
  animate: {
    y: [-8, 8, -8],
    rotate: [-3, 3, -3],
    transition: {
      duration: 7,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const driftAnimation: Variants = {
  initial: { x: 0, y: 0 },
  animate: {
    x: [0, 20, 0, -20, 0],
    y: [0, -15, -30, -15, 0],
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ========================================
// GLOW ANIMATIONS
// ========================================

export const glowPulse: Variants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 0.8, 0.5],
    scale: [1, 1.02, 1],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const redGlowPulse: Variants = {
  initial: { 
    boxShadow: "0 0 20px -5px rgba(255, 0, 0, 0.3)",
  },
  animate: {
    boxShadow: [
      "0 0 20px -5px rgba(255, 0, 0, 0.3)",
      "0 0 40px -5px rgba(255, 0, 0, 0.5)",
      "0 0 20px -5px rgba(255, 0, 0, 0.3)",
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const tealGlowPulse: Variants = {
  initial: { 
    boxShadow: "0 0 20px -5px rgba(74, 158, 158, 0.3)",
  },
  animate: {
    boxShadow: [
      "0 0 20px -5px rgba(74, 158, 158, 0.3)",
      "0 0 40px -5px rgba(74, 158, 158, 0.5)",
      "0 0 20px -5px rgba(74, 158, 158, 0.3)",
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ========================================
// PARALLAX SCROLL HELPERS
// ========================================

export const parallaxUp = (offset: number = 50): Variants => ({
  hidden: { y: offset, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: zenEase },
  },
});

export const parallaxFade: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: zenEase },
  },
};

// ========================================
// RIPPLE EFFECT
// ========================================

export const rippleEffect: Variants = {
  initial: { 
    scale: 0, 
    opacity: 0.5,
  },
  animate: {
    scale: 4,
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

export const createStaggerDelay = (index: number, baseDelay = 0.1) => ({
  delay: index * baseDelay,
});

export const safeTransition = {
  type: "spring" as const,
  stiffness: 100,
  damping: 20,
};

// Create custom floating animation with offset
export const createFloatAnimation = (
  duration: number = 6,
  amplitude: number = 10,
  delay: number = 0
): Variants => ({
  initial: { y: 0 },
  animate: {
    y: [-amplitude, amplitude, -amplitude],
    transition: {
      duration,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    },
  },
});

// Create custom breathing animation
export const createBreatheAnimation = (
  duration: number = 4,
  scaleAmount: number = 1.02
): Variants => ({
  initial: { scale: 1, opacity: 0.9 },
  animate: {
    scale: [1, scaleAmount, 1],
    opacity: [0.9, 1, 0.9],
    transition: {
      duration,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
});
