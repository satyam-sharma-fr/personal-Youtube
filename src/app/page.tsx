"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Sparkles, Shield, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

const features = [
  {
    icon: Shield,
    title: "Zero Distractions",
    description: "No recommendations, no trending, no shorts. Just the content you chose to follow.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Instant access to your curated feed. No algorithm deciding what you should watch.",
  },
  {
    icon: Sparkles,
    title: "Track Progress",
    description: "Mark videos as watched and pick up right where you left off.",
  },
];

const benefits = [
  "Add unlimited YouTube channels",
  "Chronological video feed",
  "Mark videos as watched",
  "Beautiful dark interface",
  "Search your channels",
  "No ads or trackers",
];

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn } = useAuthActions();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-chart-5/10 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Play className="w-5 h-5 text-primary-foreground fill-current" />
              </div>
              <span className="text-xl font-bold">FocusTube</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              {isLoading ? (
                <div className="w-24 h-10 bg-muted rounded-lg animate-pulse" />
              ) : isAuthenticated ? (
                <Link href="/dashboard">
                  <Button className="gap-2">
                    Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signin">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href="/signin">
                    <Button className="gap-2">
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Reclaim your attention</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            YouTube Without the
            <br />
            <span className="gradient-text">Distractions</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Add your favorite channels and watch only what matters. 
            No recommendations, no trending page, no endless rabbit holes.
            Just you and your content.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/signin">
              <Button size="lg" className="gap-2 text-lg px-8 h-14 glow">
                <Play className="w-5 h-5 fill-current" />
                Start Watching Free
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 text-lg px-8 h-14">
              See How It Works
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-chart-5/20 to-primary/20 rounded-3xl blur-2xl" />
            <div className="relative bg-card rounded-2xl border shadow-2xl overflow-hidden">
              <div className="p-4 border-b bg-muted/50 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/80" />
                  <div className="w-3 h-3 rounded-full bg-chart-4/80" />
                  <div className="w-3 h-3 rounded-full bg-chart-3/80" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-sm text-muted-foreground">focustube.app/dashboard</span>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-b from-background to-muted/20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="group"
                    >
                      <div className="aspect-video bg-muted rounded-lg mb-2 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-chart-5/20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-background/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 fill-current text-primary" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-xs text-white">
                          {10 + i}:24
                        </div>
                      </div>
                      <div className="h-4 bg-muted rounded w-3/4 mb-1" />
                      <div className="h-3 bg-muted/50 rounded w-1/2" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Built for Focus
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to enjoy YouTube content without falling into endless scrolling.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="absolute -inset-px bg-gradient-to-b from-primary/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-8 rounded-2xl bg-card border hover:border-primary/50 transition-colors">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Everything You Need,
                <br />
                <span className="gradient-text">Nothing You Don&apos;t</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We stripped away all the noise that makes YouTube addictive and kept only what matters - 
                your subscriptions, presented chronologically, without any algorithmic manipulation.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span>{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-chart-5/10 rounded-3xl blur-2xl" />
              <div className="relative grid grid-cols-2 gap-4">
                {[
                  { label: "Channels", value: "∞" },
                  { label: "Videos/Day", value: "∞" },
                  { label: "Distractions", value: "0" },
                  { label: "Focus Mode", value: "100%" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card border rounded-2xl p-6 text-center hover-lift"
                  >
                    <div className="text-4xl font-bold gradient-text mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 animated-gradient rounded-3xl blur-xl opacity-50" />
            <div className="relative bg-card border rounded-3xl p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Focus?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of people who have taken back control of their attention.
                It&apos;s free to get started.
              </p>
              <Link href="/signin">
                <Button size="lg" className="gap-2 text-lg px-10 h-14 glow">
                  <Play className="w-5 h-5 fill-current" />
                  Get Started Free
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Play className="w-4 h-4 text-primary-foreground fill-current" />
            </div>
            <span className="font-semibold">FocusTube</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FocusTube. Built for focused minds.
          </p>
        </div>
      </footer>
    </div>
  );
}
