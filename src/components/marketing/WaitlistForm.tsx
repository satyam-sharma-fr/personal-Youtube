"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Check, Sparkles, Mail, Shield, Zap, Play } from "lucide-react";
import { fadeUp, staggerContainer, scaleIn } from "./motion";
import { toast } from "sonner";

const benefits = [
  { icon: Zap, text: "Early access before public launch" },
  { icon: Shield, text: "Zero spam. One email when ready." },
  { icon: Sparkles, text: "Shape the product with feedback" },
];

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    setIsLoading(false);
    setIsSubmitted(true);
    toast.success("You're on the list! We'll be in touch soon.");
  };

  return (
    <section id="waitlist" className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-b from-zinc-50 to-white">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255, 0, 0, 0.05) 0%, rgba(13, 148, 136, 0.03) 50%, transparent 70%)",
            filter: "blur(80px)",
          }}
          animate={shouldReduceMotion ? {} : {
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={fadeUp} className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-600 text-sm font-medium mb-6"
            >
              <Mail className="w-4 h-4" />
              Join the waitlist
            </motion.div>
            <h2 className="font-display text-3xl md:text-5xl font-semibold mb-4 text-zinc-900">
              Be early.{" "}
              <span className="text-teal-600">Stay focused.</span>
            </h2>
            <p className="text-zinc-600 text-lg">
              Get invited first when we launch. No spam, ever.
            </p>
          </motion.div>

          {/* Form card */}
          <motion.div
            variants={scaleIn}
            className="relative p-8 md:p-12 rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/50"
          >
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-24 h-24 border-l-2 border-t-2 border-red-200 rounded-tl-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-teal-200 rounded-br-3xl pointer-events-none" />

            {/* Floating logo */}
            <motion.div
              className="absolute -top-6 right-8"
              animate={shouldReduceMotion ? {} : {
                y: [0, -5, 0],
                rotate: [0, 3, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Email input */}
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-14 text-lg px-6 rounded-2xl border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:border-red-300 focus:ring-red-200"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Submit button */}
                  <motion.div
                    whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-14 text-lg rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
                      disabled={isLoading}
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          />
                        ) : (
                          <>
                            Get Early Access
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </span>
                    </Button>
                  </motion.div>

                  {/* Benefits */}
                  <div className="pt-6 space-y-3">
                    {benefits.map((benefit, i) => (
                      <motion.div
                        key={benefit.text}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: shouldReduceMotion ? 0 : 0.3 + i * 0.1 }}
                        className="flex items-center gap-3 text-sm text-zinc-500"
                      >
                        <benefit.icon className="w-4 h-4 text-teal-500" />
                        {benefit.text}
                      </motion.div>
                    ))}
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-6"
                  >
                    <Check className="w-10 h-10 text-teal-600" />
                  </motion.div>
                  <h3 className="font-display text-2xl font-semibold mb-2 text-zinc-900">You're in!</h3>
                  <p className="text-zinc-600">
                    We'll send you an email when FocusTube is ready.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Trust note */}
          <motion.p
            variants={fadeUp}
            className="text-center text-sm text-zinc-500 mt-8"
          >
            Join 500+ others waiting for distraction-free YouTube.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
