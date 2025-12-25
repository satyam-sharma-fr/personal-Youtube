"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Check, Sparkles, Mail, Shield, Zap } from "lucide-react";
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
    <section id="waitlist" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-full blur-3xl opacity-50" />
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6"
            >
              <Mail className="w-4 h-4" />
              Join the waitlist
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Be early.{" "}
              <span className="text-accent">Stay focused.</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Get invited first when we launch. No spam, ever.
            </p>
          </motion.div>

          {/* Form card */}
          <motion.div
            variants={scaleIn}
            className="relative p-8 md:p-12 rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm"
          >
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-24 h-24 border-l-2 border-t-2 border-accent/30 rounded-tl-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-primary/30 rounded-br-3xl pointer-events-none" />

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
                      className="h-14 text-lg px-6 rounded-2xl border-border/50 bg-background/50 focus:border-accent focus:ring-accent/20"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Submit button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-lg rounded-2xl group relative overflow-hidden"
                    disabled={isLoading}
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                        />
                      ) : (
                        <>
                          Get Early Access
                          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </Button>

                  {/* Benefits */}
                  <div className="pt-6 space-y-3">
                    {benefits.map((benefit, i) => (
                      <motion.div
                        key={benefit.text}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: shouldReduceMotion ? 0 : 0.3 + i * 0.1 }}
                        className="flex items-center gap-3 text-sm text-muted-foreground"
                      >
                        <benefit.icon className="w-4 h-4 text-accent" />
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
                    className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6"
                  >
                    <Check className="w-10 h-10 text-accent" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-2">You're in!</h3>
                  <p className="text-muted-foreground">
                    We'll send you an email when FocusTube is ready.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Trust note */}
          <motion.p
            variants={fadeUp}
            className="text-center text-sm text-muted-foreground mt-8"
          >
            Join 500+ others waiting for distraction-free YouTube.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

