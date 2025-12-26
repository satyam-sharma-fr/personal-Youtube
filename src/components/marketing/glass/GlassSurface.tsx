"use client";

import { forwardRef, useRef, ReactNode } from "react";
import { motion, HTMLMotionProps, useReducedMotion } from "framer-motion";
import { usePointerVars, useTiltVars } from "@/hooks/usePointerVars";
import { cn } from "@/lib/utils";

interface GlassSurfaceProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  children: ReactNode;
  /** Enable specular highlight that follows cursor */
  specular?: boolean;
  /** Enable refraction border effect */
  refraction?: boolean;
  /** Enable 3D tilt on hover */
  tilt?: boolean;
  /** Maximum tilt angle in degrees */
  maxTilt?: number;
  /** Enable shimmer animation */
  shimmer?: boolean;
  /** Additional glass opacity (0-1) */
  opacity?: number;
  /** Blur intensity */
  blur?: "sm" | "md" | "lg" | "xl";
  /** Color variant for accents */
  variant?: "default" | "red" | "teal";
}

const blurMap = {
  sm: "10px",
  md: "20px",
  lg: "30px",
  xl: "40px",
};

export const GlassSurface = forwardRef<HTMLDivElement, GlassSurfaceProps>(
  function GlassSurface(
    {
      children,
      className,
      specular = false,
      refraction = false,
      tilt = false,
      maxTilt = 8,
      shimmer = false,
      opacity,
      blur = "md",
      style,
      ...props
    },
    forwardedRef
  ) {
    const internalRef = useRef<HTMLDivElement>(null);
    const ref = (forwardedRef as React.RefObject<HTMLDivElement>) || internalRef;
    const shouldReduceMotion = useReducedMotion();

    // Enable pointer tracking for specular effect
    usePointerVars(ref, { enabled: specular && !shouldReduceMotion });
    
    // Enable tilt effect
    useTiltVars(ref, { enabled: tilt && !shouldReduceMotion, maxTilt });

    const glassStyles = {
      "--glass-opacity": opacity ?? 0.08,
      "--glass-blur": blurMap[blur],
      ...(tilt && !shouldReduceMotion
        ? {
            transform: "perspective(1000px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))",
            transformStyle: "preserve-3d" as const,
          }
        : {}),
      ...style,
    } as React.CSSProperties;

    return (
      <motion.div
        ref={ref}
        className={cn(
          "glass-surface rounded-2xl",
          specular && "glass-specular",
          refraction && "glass-refraction",
          shimmer && !shouldReduceMotion && "glass-shimmer",
          tilt && "transition-transform duration-200 ease-out",
          className
        )}
        style={glassStyles}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

/**
 * A glass card variant optimized for content display
 */
export function GlassCard({
  children,
  className,
  hover = true,
  ...props
}: GlassSurfaceProps & { hover?: boolean }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <GlassSurface
      specular={hover}
      refraction
      className={cn("p-6", className)}
      whileHover={
        hover && !shouldReduceMotion
          ? { scale: 1.02, y: -4 }
          : undefined
      }
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      {...props}
    >
      {children}
    </GlassSurface>
  );
}

/**
 * A portal-style glass surface with depth effect
 */
export function GlassPortal({
  children,
  className,
  glowing = true,
  ...props
}: GlassSurfaceProps & { glowing?: boolean }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <GlassSurface
      specular
      refraction
      tilt={!shouldReduceMotion}
      maxTilt={6}
      className={cn(
        "glass-portal",
        glowing && !shouldReduceMotion && "animate-portal-pulse",
        className
      )}
      {...props}
    >
      <div className="glass-portal-inner">{children}</div>
    </GlassSurface>
  );
}

