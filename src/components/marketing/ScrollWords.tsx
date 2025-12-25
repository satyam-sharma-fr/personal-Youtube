"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

const words = [
  "The",
  "algorithm",
  "optimizes",
  "for",
  "time",
  "spent.",
  "Not",
  "time",
  "well",
  "spent.",
];

export function ScrollWords() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.2"],
  });

  return (
    <section
      ref={containerRef}
      className="relative py-32 md:py-48 overflow-hidden"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-destructive/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-center">
            {words.map((word, i) => {
              const start = i / words.length;
              const end = start + 1 / words.length;

              return (
                <Word
                  key={i}
                  word={word}
                  range={[start, end]}
                  progress={scrollYProgress}
                  isHighlight={word === "Not" || word === "well"}
                  shouldReduceMotion={shouldReduceMotion}
                />
              );
            })}
          </p>
        </div>
      </div>
    </section>
  );
}

function Word({
  word,
  range,
  progress,
  isHighlight,
  shouldReduceMotion,
}: {
  word: string;
  range: [number, number];
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  isHighlight: boolean;
  shouldReduceMotion: boolean | null;
}) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const y = useTransform(progress, range, [10, 0]);
  const blur = useTransform(progress, range, [4, 0]);

  if (shouldReduceMotion) {
    return (
      <span
        className={`inline-block mr-[0.25em] ${
          isHighlight ? "text-accent" : ""
        }`}
      >
        {word}
      </span>
    );
  }

  return (
    <motion.span
      style={{
        opacity,
        y,
        filter: blur.get() > 0 ? `blur(${blur.get()}px)` : "none",
      }}
      className={`inline-block mr-[0.25em] ${
        isHighlight ? "text-accent" : ""
      }`}
    >
      {word}
    </motion.span>
  );
}

