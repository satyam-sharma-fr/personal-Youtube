"use client";

import { motion, useReducedMotion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface YouTubeLogoProps {
  mode?: "chaos" | "calm" | "static";
  size?: "sm" | "md" | "lg" | "xl";
  showGlow?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

const iconSizes = {
  sm: "w-3 h-3",
  md: "w-5 h-5",
  lg: "w-7 h-7",
  xl: "w-10 h-10",
};

// Animation variants
const chaosVariants: Variants = {
  animate: {
    x: [-2, 2, -1, 1, -2],
    y: [1, -1, 2, -2, 1],
    rotate: [-2, 2, -1, 1, 0],
    scale: [1, 1.05, 0.98, 1.02, 1],
    transition: {
      duration: 0.4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const calmVariants: Variants = {
  animate: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const glowChaosVariants: Variants = {
  animate: {
    boxShadow: [
      "0 0 20px -5px rgba(255, 0, 0, 0.4)",
      "0 0 40px -5px rgba(255, 0, 0, 0.7)",
      "0 0 25px -5px rgba(255, 0, 0, 0.5)",
    ],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const glowCalmVariants: Variants = {
  animate: {
    boxShadow: [
      "0 0 30px -10px rgba(255, 0, 0, 0.3)",
      "0 0 50px -10px rgba(255, 0, 0, 0.5)",
      "0 0 30px -10px rgba(255, 0, 0, 0.3)",
    ],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export function YouTubeLogo({ 
  mode = "calm", 
  size = "md",
  showGlow = true,
  className,
}: YouTubeLogoProps) {
  const shouldReduceMotion = useReducedMotion();
  
  const containerVariants = mode === "chaos" ? chaosVariants : calmVariants;
  const glowVariants = mode === "chaos" ? glowChaosVariants : glowCalmVariants;
  
  return (
    <motion.div
      className={cn("relative", className)}
      variants={shouldReduceMotion ? undefined : containerVariants}
      animate="animate"
    >
      {/* Glow effect layer */}
      {showGlow && !shouldReduceMotion && (
        <motion.div
          className={cn(
            "absolute inset-0 rounded-xl",
            sizeClasses[size]
          )}
          variants={glowVariants}
          animate="animate"
        />
      )}
      
      {/* Main logo container */}
      <div
        className={cn(
          "relative rounded-xl flex items-center justify-center",
          "bg-[#FF0000]",
          sizeClasses[size]
        )}
        style={{
          boxShadow: showGlow && shouldReduceMotion 
            ? "0 0 30px -10px rgba(255, 0, 0, 0.4)" 
            : undefined,
        }}
      >
        {/* Play triangle */}
        <svg
          viewBox="0 0 24 24"
          className={cn("text-white fill-current", iconSizes[size])}
          style={{ marginLeft: "2px" }}
        >
          <path d="M8 5.14v14l11-7-11-7z" />
        </svg>
      </div>
    </motion.div>
  );
}

// Floating YouTube Logo for particles
interface FloatingYouTubeLogoProps {
  mode?: "chaos" | "calm";
  delay?: number;
  duration?: number;
  size?: number;
  opacity?: number;
  className?: string;
}

export function FloatingYouTubeLogo({
  mode = "calm",
  delay = 0,
  duration = 8,
  size = 24,
  opacity = 0.15,
  className,
}: FloatingYouTubeLogoProps) {
  const shouldReduceMotion = useReducedMotion();
  
  const floatVariants: Variants = {
    animate: mode === "chaos" 
      ? {
          y: [-10, 10, -5, 15, -10],
          x: [-5, 8, -8, 5, -5],
          rotate: [-5, 5, -3, 3, -5],
          transition: {
            duration: duration * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
            delay,
          },
        }
      : {
          y: [-15, 15, -15],
          transition: {
            duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay,
          },
        },
  };
  
  return (
    <motion.div
      className={cn("absolute", className)}
      style={{ opacity }}
      variants={shouldReduceMotion ? undefined : floatVariants}
      animate="animate"
    >
      <div
        className="rounded-md flex items-center justify-center bg-[#FF0000]"
        style={{ width: size, height: size * 0.7 }}
      >
        <svg
          viewBox="0 0 24 24"
          className="text-white fill-current"
          style={{ width: size * 0.4, height: size * 0.4, marginLeft: 1 }}
        >
          <path d="M8 5.14v14l11-7-11-7z" />
        </svg>
      </div>
    </motion.div>
  );
}

// YouTube Play Button specifically for header/brand
interface YouTubePlayButtonProps {
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  className?: string;
}

export function YouTubePlayButton({
  size = "md",
  animate = true,
  className,
}: YouTubePlayButtonProps) {
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = animate && !shouldReduceMotion;
  
  const sizes = {
    sm: { container: "w-8 h-8", icon: "w-3 h-3" },
    md: { container: "w-10 h-10", icon: "w-4 h-4" },
    lg: { container: "w-12 h-12", icon: "w-5 h-5" },
  };
  
  return (
    <motion.div
      className={cn(
        "rounded-xl flex items-center justify-center bg-gradient-to-br from-[#FF0000] to-[#cc0000]",
        sizes[size].container,
        className
      )}
      whileHover={shouldAnimate ? { 
        scale: 1.05,
        boxShadow: "0 0 25px -5px rgba(255, 0, 0, 0.5)",
      } : undefined}
      transition={{ duration: 0.2 }}
    >
      <svg
        viewBox="0 0 24 24"
        className={cn("text-white fill-current", sizes[size].icon)}
        style={{ marginLeft: "2px" }}
      >
        <path d="M8 5.14v14l11-7-11-7z" />
      </svg>
    </motion.div>
  );
}

