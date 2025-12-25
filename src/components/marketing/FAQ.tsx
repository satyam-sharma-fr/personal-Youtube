"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { fadeUp, staggerContainer } from "./motion";

const faqs = [
  {
    question: "Does FocusTube replace YouTube?",
    answer:
      "No. FocusTube is a focused interface on top of YouTube. You still watch videos on YouTube's servers—we just remove all the recommendation noise and give you a clean, chronological feed of channels you choose.",
  },
  {
    question: "Do you store my data?",
    answer:
      "We store only what's necessary: your email (for auth), your channel list, and basic watch history if you opt in. We never sell data, and you can export or delete everything anytime.",
  },
  {
    question: "What about YouTube Shorts?",
    answer:
      "Shorts don't appear in your feed. FocusTube is built for long-form, intentional viewing. No infinite scroll loops.",
  },
  {
    question: "Can I use my existing YouTube subscriptions?",
    answer:
      "Not directly—that would require Google account access we intentionally avoid. But you can quickly add channels by searching or pasting URLs. Most users say rebuilding intentionally helps them cut channels they don't actually watch.",
  },
  {
    question: "Is there a mobile app?",
    answer:
      "FocusTube is a responsive web app that works great on mobile browsers. A native app is on the roadmap after we nail the core experience.",
  },
  {
    question: "How is this different from YouTube Premium?",
    answer:
      "YouTube Premium removes ads but keeps all the recommendation systems designed to maximize watch time. FocusTube removes recommendations entirely—you see only videos from channels you explicitly added.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Questions?{" "}
              <span className="text-muted-foreground">Answers.</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about FocusTube.
            </p>
          </motion.div>

          {/* FAQ items */}
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={faq.question}
                variants={fadeUp}
                className="border border-border/50 rounded-2xl overflow-hidden bg-card/30 backdrop-blur-sm"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                >
                  <span className="font-medium pr-4">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openIndex === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.3,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <div className="px-6 pb-5">
                        <p className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

