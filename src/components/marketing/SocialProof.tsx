"use client";

import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Code2, Coffee } from "lucide-react";
import { fadeUp, staggerContainer, scaleIn } from "./motion";

const audiences = [
  {
    icon: Briefcase,
    title: "Deep Workers",
    description: "Protect your focus time from infinite scroll.",
  },
  {
    icon: GraduationCap,
    title: "Students",
    description: "Learn from educational channels without distraction.",
  },
  {
    icon: Code2,
    title: "Builders",
    description: "Stay updated on tech without the rabbit holes.",
  },
  {
    icon: Coffee,
    title: "Intentional Viewers",
    description: "Watch what matters, then get back to life.",
  },
];

const testimonials = [
  {
    quote: "Finally, YouTube without the guilt spiral. I watch what I came for and actually close the tab.",
    author: "Alex R.",
    role: "Software Engineer",
  },
  {
    quote: "My screen time dropped 40% but I'm learning more than ever. That's the magic.",
    author: "Sarah M.",
    role: "Graduate Student",
  },
  {
    quote: "Simple, fast, focused. This is what YouTube should have been all along.",
    author: "James K.",
    role: "Product Designer",
  },
];

export function SocialProof() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent pointer-events-none" />

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
              Built for the{" "}
              <span className="text-accent">intentional.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Join others who've taken back control of their attention.
            </p>
          </motion.div>

          {/* Audience cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 max-w-4xl mx-auto">
            {audiences.map((audience, i) => (
              <motion.div
                key={audience.title}
                variants={scaleIn}
                whileHover={{ y: -4 }}
                className="p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm text-center group hover:border-accent/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <audience.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-1">{audience.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {audience.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.author}
                variants={fadeUp}
                className="relative p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm"
              >
                {/* Quote mark */}
                <div className="absolute -top-3 left-6 text-5xl text-accent/20 font-serif">
                  "
                </div>
                <p className="text-foreground/90 mb-6 pt-4 leading-relaxed">
                  {testimonial.quote}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30" />
                  <div>
                    <div className="font-medium text-sm">{testimonial.author}</div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </div>
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

