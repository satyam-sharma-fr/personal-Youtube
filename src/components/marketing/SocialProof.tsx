"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Briefcase, GraduationCap, Code2, Coffee } from "lucide-react";
import { fadeUp, staggerContainer, scaleIn } from "./motion";

const audiences = [
  {
    icon: Briefcase,
    title: "Deep Workers",
    description: "Protect your focus time from infinite scroll.",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-100",
  },
  {
    icon: GraduationCap,
    title: "Students",
    description: "Learn from educational channels without distraction.",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-100",
  },
  {
    icon: Code2,
    title: "Builders",
    description: "Stay updated on tech without the rabbit holes.",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-100",
  },
  {
    icon: Coffee,
    title: "Casual Viewers",
    description: "Enjoy your favorite content without the noise.",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-100",
  },
];

export function SocialProof() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-b from-zinc-50 to-white">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <motion.span variants={fadeUp} className="inline-block text-sm font-medium text-red-600 mb-3 tracking-wider uppercase">
            Who it's for
          </motion.span>
          <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-zinc-900">
            Built for{" "}
            <span className="text-red-600">Focused Minds</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Whether you're working, studying, or just relaxing, FocusTube helps you cut through the noise.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((audience, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className={`relative p-6 rounded-2xl border ${audience.borderColor} bg-white shadow-sm hover:shadow-lg transition-shadow text-center flex flex-col items-center`}
            >
              <div className={`mb-4 p-3 rounded-full ${audience.bgColor}`}>
                <audience.icon className={`w-6 h-6 ${audience.color}`} />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2 text-zinc-900">
                {audience.title}
              </h3>
              <p className="text-sm text-zinc-600">{audience.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
