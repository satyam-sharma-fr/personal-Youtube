"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Target, Ban, Zap } from "lucide-react";
import { fadeUp, staggerContainer, scaleIn } from "./motion";

const principles = [
  {
    icon: Target,
    title: "Only channels you pick.",
    description:
      "You decide what shows up. Add channels you love, remove ones you don't. Full control.",
    gradient: "from-primary/20 to-primary/5",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Ban,
    title: "No recommendations.",
    description:
      "Zero algorithmic suggestions. No 'you might also like.' No autoplay into oblivion.",
    gradient: "from-accent/20 to-accent/5",
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
  },
  {
    icon: Zap,
    title: "Fast. Cached. Ready.",
    description:
      "Your feed loads instantly from cache. Spend time watching, not waiting.",
    gradient: "from-chart-3/20 to-chart-3/5",
    iconBg: "bg-chart-3/10",
    iconColor: "text-chart-3",
  },
];

export function Principles() {
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
          <motion.div variants={fadeUp} className="text-center mb-20">
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
              <motion.div
                key={principle.title}
                variants={scaleIn}
                whileHover={shouldReduceMotion ? {} : { y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative"
              >
                {/* Card */}
                <div
                  className={`relative p-8 rounded-3xl border border-border/50 bg-gradient-to-b ${principle.gradient} backdrop-blur-sm h-full`}
                >
                  {/* Hover glow */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${
                        principle.iconColor === "text-primary"
                          ? "var(--primary)"
                          : principle.iconColor === "text-accent"
                          ? "var(--accent)"
                          : "var(--chart-3)"
                      } 0%, transparent 50%)`,
                      opacity: 0.1,
                    }}
                  />

                  {/* Icon */}
                  <motion.div
                    className={`w-16 h-16 rounded-2xl ${principle.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <principle.icon
                      className={`w-8 h-8 ${principle.iconColor}`}
                    />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3">{principle.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {principle.description}
                  </p>

                  {/* Number badge */}
                  <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-background/50 border border-border/50 flex items-center justify-center text-xs font-mono text-muted-foreground">
                    0{i + 1}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

