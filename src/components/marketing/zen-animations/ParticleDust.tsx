"use client";

import { useMemo } from "react";
import { motion, useReducedMotion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  type: "dot" | "play";
}

interface ParticleDustProps {
  mode?: "chaos" | "calm";
  count?: number;
  showPlayIcons?: boolean;
  className?: string;
}

function generateParticles(count: number, showPlayIcons: boolean): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 12 + 4,
    opacity: Math.random() * 0.15 + 0.05,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 5,
    type: showPlayIcons && Math.random() > 0.7 ? "play" : "dot",
  }));
}

export function ParticleDust({ 
  mode = "calm",
  count = 20,
  showPlayIcons = true,
  className,
}: ParticleDustProps) {
  const shouldReduceMotion = useReducedMotion();
  
  const particles = useMemo(
    () => generateParticles(count, showPlayIcons),
    [count, showPlayIcons]
  );
  
  if (shouldReduceMotion) {
    return (
      <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
        {particles.slice(0, Math.floor(count / 2)).map((particle) => (
          <div
            key={particle.id}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              opacity: particle.opacity,
            }}
          >
            {particle.type === "play" ? (
              <PlayIcon size={particle.size} />
            ) : (
              <div
                className="rounded-full bg-[#FF0000]"
                style={{
                  width: particle.size,
                  height: particle.size,
                }}
              />
            )}
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {particles.map((particle) => (
        <ParticleItem
          key={particle.id}
          particle={particle}
          mode={mode}
        />
      ))}
    </div>
  );
}

function ParticleItem({ 
  particle, 
  mode,
}: { 
  particle: Particle; 
  mode: "chaos" | "calm";
}) {
  const chaosVariants: Variants = {
    animate: {
      y: [-20, 20, -10, 15, -20],
      x: [-10, 15, -15, 10, -10],
      rotate: [-10, 10, -5, 5, -10],
      opacity: [
        particle.opacity,
        particle.opacity * 1.5,
        particle.opacity * 0.7,
        particle.opacity * 1.2,
        particle.opacity,
      ],
      transition: {
        duration: particle.duration * 0.3,
        repeat: Infinity,
        ease: "easeInOut",
        delay: particle.delay,
      },
    },
  };
  
  const calmVariants: Variants = {
    animate: {
      y: [-30, 30, -30],
      x: [-10, 10, -10],
      opacity: [
        particle.opacity,
        particle.opacity * 1.3,
        particle.opacity,
      ],
      transition: {
        duration: particle.duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: particle.delay,
      },
    },
  };
  
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
      }}
      variants={mode === "chaos" ? chaosVariants : calmVariants}
      animate="animate"
    >
      {particle.type === "play" ? (
        <PlayIcon size={particle.size} />
      ) : (
        <div
          className="rounded-full bg-[#FF0000]"
          style={{
            width: particle.size,
            height: particle.size,
          }}
        />
      )}
    </motion.div>
  );
}

function PlayIcon({ size }: { size: number }) {
  return (
    <div
      className="rounded-sm flex items-center justify-center bg-[#FF0000]"
      style={{ 
        width: size * 1.5, 
        height: size,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="text-white fill-current"
        style={{ 
          width: size * 0.5, 
          height: size * 0.5,
          marginLeft: 1,
        }}
      >
        <path d="M8 5.14v14l11-7-11-7z" />
      </svg>
    </div>
  );
}

// Larger floating elements for background
interface FloatingElementsProps {
  mode?: "chaos" | "calm";
  className?: string;
}

export function FloatingElements({ 
  mode = "calm",
  className,
}: FloatingElementsProps) {
  const shouldReduceMotion = useReducedMotion();
  
  const elements = useMemo(() => [
    { id: 1, x: 10, y: 20, size: 40, delay: 0, duration: 15 },
    { id: 2, x: 80, y: 15, size: 30, delay: 2, duration: 18 },
    { id: 3, x: 20, y: 70, size: 35, delay: 4, duration: 20 },
    { id: 4, x: 75, y: 65, size: 25, delay: 1, duration: 16 },
    { id: 5, x: 50, y: 40, size: 45, delay: 3, duration: 22 },
  ], []);
  
  if (shouldReduceMotion) {
    return null;
  }
  
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {elements.map((el) => {
        const chaosAnim: Variants = {
          animate: {
            y: [-30, 30, -20, 25, -30],
            x: [-20, 25, -25, 20, -20],
            rotate: [-15, 15, -10, 10, -15],
            scale: [1, 1.1, 0.95, 1.05, 1],
            transition: {
              duration: el.duration * 0.25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: el.delay,
            },
          },
        };
        
        const calmAnim: Variants = {
          animate: {
            y: [-20, 20, -20],
            rotate: [-3, 3, -3],
            transition: {
              duration: el.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: el.delay,
            },
          },
        };
        
        return (
          <motion.div
            key={el.id}
            className="absolute"
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              opacity: 0.08,
            }}
            variants={mode === "chaos" ? chaosAnim : calmAnim}
            animate="animate"
          >
            <div
              className="rounded-lg flex items-center justify-center bg-[#FF0000]"
              style={{ 
                width: el.size * 1.5, 
                height: el.size,
              }}
            >
              <svg
                viewBox="0 0 24 24"
                className="text-white fill-current"
                style={{ 
                  width: el.size * 0.4, 
                  height: el.size * 0.4,
                  marginLeft: 2,
                }}
              >
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}


