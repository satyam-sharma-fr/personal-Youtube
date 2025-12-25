"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { GlassSurface } from "./glass/GlassSurface";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Infinity, ArrowRight } from "lucide-react";
import { fadeUp, staggerContainer } from "./motion";

// These match the real tiers from settings
const tiers = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    channels: 5,
    icon: Sparkles,
    features: [
      "Up to 5 channels",
      "Basic chronological feed",
      "Watch history (7 days)",
      "Watch time tracking",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "Most popular for focused viewers",
    channels: 25,
    icon: Crown,
    features: [
      "Up to 25 channels",
      "Custom categories",
      "Watch history (30 days)",
      "Resume playback",
      "Video search",
      "Daily watch limits",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    id: "unlimited",
    name: "Unlimited",
    price: "$19",
    period: "/month",
    description: "No limits, ever",
    channels: Infinity,
    icon: Infinity,
    features: [
      "Unlimited channels",
      "Everything in Pro",
      "Forever watch history",
      "Export channel list",
      "Priority support",
      "Early access to features",
    ],
    cta: "Go Unlimited",
    popular: false,
  },
];

function PricingCard({
  tier,
  index,
}: {
  tier: (typeof tiers)[0];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  // Create stacked glass pane effect on scroll
  const y = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [40 * (index - 1), 0, -40 * (index - 1)]
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.95, 1, 0.95]
  );

  return (
    <motion.div
      ref={cardRef}
      variants={fadeUp}
      style={shouldReduceMotion ? {} : { y, scale }}
      className={`relative ${tier.popular ? "z-10" : "z-0"}`}
    >
      {/* Popular badge */}
      {tier.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
          <Badge className="bg-accent text-accent-foreground px-4 py-1 text-sm font-medium shadow-lg">
            Most Popular
          </Badge>
        </div>
      )}

      <GlassSurface
        specular={!shouldReduceMotion}
        refraction={tier.popular}
        className={`h-full p-6 md:p-8 ${
          tier.popular
            ? "border-accent/50 bg-accent/5"
            : "border-border/50"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <tier.icon className={`w-5 h-5 ${tier.popular ? "text-accent" : "text-primary"}`} />
              <h3 className="text-xl font-bold">{tier.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{tier.description}</p>
          </div>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">{tier.price}</span>
            <span className="text-muted-foreground">{tier.period}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {tier.channels === Infinity
              ? "Unlimited channels"
              : `Up to ${tier.channels} channels`}
          </p>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8">
          {tier.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${tier.popular ? "text-accent" : "text-primary"}`} />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link href="/signup" className="block">
          <Button
            className={`w-full h-12 text-base ${
              tier.popular
                ? "bg-accent hover:bg-accent/90"
                : ""
            }`}
            variant={tier.popular ? "default" : "outline"}
          >
            {tier.cta}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </GlassSurface>
    </motion.div>
  );
}

export function PricingTiers() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="pricing" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-gradient-to-l from-accent/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Section header */}
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="text-sm font-medium text-accent mb-4 block">
              Pricing
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Simple, transparent pricing.
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Start free, upgrade when you need more. No hidden fees.
            </p>
          </motion.div>

          {/* Pricing cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
            {tiers.map((tier, i) => (
              <PricingCard key={tier.id} tier={tier} index={i} />
            ))}
          </div>

          {/* Trust note */}
          <motion.div variants={fadeUp} className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              All plans include a 14-day free trial. Cancel anytime.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

