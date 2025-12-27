"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Infinity as InfinityIcon, ArrowRight, LucideIcon } from "lucide-react";
import { fadeUp, staggerContainer } from "./motion";
import { TIERS, TierID } from "@/lib/billing";

// Component-specific tier display config (icons, colors, CTAs)
// Pricing data comes from the shared TIERS config
interface MarketingTier {
  id: TierID;
  name: string;
  price: string;
  period: string;
  description: string;
  channels: number;
  icon: LucideIcon;
  features: string[];
  cta: string;
  popular: boolean;
  accentColor: string;
}

const tiers: MarketingTier[] = [
  {
    ...TIERS.free,
    icon: Sparkles,
    cta: "Get Started",
    popular: false,
    accentColor: "#71717a",
    price: TIERS.free.priceAmount,
  },
  {
    ...TIERS.pro,
    icon: Crown,
    cta: "Start Pro Trial",
    popular: true,
    accentColor: "#dc2626",
    price: TIERS.pro.priceAmount,
  },
  {
    ...TIERS.unlimited,
    icon: InfinityIcon,
    cta: "Go Unlimited",
    popular: false,
    accentColor: "#0d9488",
    price: TIERS.unlimited.priceAmount,
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
        <motion.div 
          className="absolute -top-4 left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Badge className="bg-red-600 text-white px-4 py-1 text-sm font-medium shadow-lg shadow-red-500/30 border-0">
            Most Popular
          </Badge>
        </motion.div>
      )}

      <motion.div
        whileHover={shouldReduceMotion ? {} : {
          y: -4,
          boxShadow: tier.popular 
            ? "0 25px 50px -12px rgba(220, 38, 38, 0.15)"
            : "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
        }}
        transition={{ duration: 0.3 }}
        className={`h-full p-6 md:p-8 rounded-2xl border bg-white ${
          tier.popular
            ? "border-red-200 shadow-xl shadow-red-500/10"
            : "border-zinc-200 shadow-lg shadow-zinc-200/50"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <tier.icon 
                className="w-5 h-5" 
                style={{ color: tier.accentColor }}
              />
              <h3 className="text-xl font-display font-semibold text-zinc-900">{tier.name}</h3>
            </div>
            <p className="text-sm text-zinc-500">{tier.description}</p>
          </div>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-display font-bold text-zinc-900">{tier.price}</span>
            <span className="text-zinc-500">{tier.period}</span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            {tier.channels === Number.POSITIVE_INFINITY
              ? "Unlimited channels"
              : `Up to ${tier.channels} channels`}
          </p>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8">
          {tier.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <Check 
                className="w-5 h-5 flex-shrink-0 mt-0.5" 
                style={{ color: tier.accentColor }}
              />
              <span className="text-sm text-zinc-700">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link href="/signup" className="block">
          <motion.div
            whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
          >
            <Button
              className={`w-full h-12 text-base rounded-xl ${
                tier.popular
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
                  : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200"
              }`}
            >
              {tier.cta}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export function PricingTiers() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="pricing" className="relative py-24 md:py-32 overflow-hidden bg-zinc-50">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255, 0, 0, 0.04) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
          animate={shouldReduceMotion ? {} : {
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(13, 148, 136, 0.04) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
          animate={shouldReduceMotion ? {} : {
            x: [0, -20, 0],
            y: [0, 25, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
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
            <span className="text-sm font-medium text-red-600 mb-4 block tracking-wider uppercase">
              Pricing
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-semibold mb-4 text-zinc-900">
              Simple, transparent pricing.
            </h2>
            <p className="text-zinc-600 text-lg max-w-xl mx-auto">
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
            <p className="text-sm text-zinc-500">
              All plans include a 14-day free trial. Cancel anytime.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
