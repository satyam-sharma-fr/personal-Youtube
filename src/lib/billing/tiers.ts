/**
 * Shared tier configuration - Single source of truth for pricing and features.
 * 
 * All UI surfaces (marketing, settings, demo) and backend configs should
 * reference this module for consistent pricing information.
 */

export type TierID = "free" | "pro" | "unlimited";

export interface TierConfig {
  id: TierID;
  name: string;
  /** Price display string, e.g. "$9/month" or "$0" */
  price: string;
  /** Just the dollar amount, e.g. "$9" */
  priceAmount: string;
  /** Period suffix, e.g. "/month" or "forever" */
  period: string;
  /** Short description */
  description: string;
  /** Channel limit (Infinity for unlimited) */
  channels: number;
  /** Feature bullet points */
  features: string[];
}

/**
 * All subscription tiers with their display information.
 * 
 * Prices:
 * - Free: $0
 * - Pro: $9/month
 * - Unlimited: $12/month
 */
export const TIERS: Record<TierID, TierConfig> = {
  free: {
    id: "free",
    name: "Free",
    price: "$0",
    priceAmount: "$0",
    period: "forever",
    description: "Perfect for getting started",
    channels: 5,
    features: [
      "Up to 5 channels",
      "Basic chronological feed",
      "Watch history (7 days)",
      "Watch time tracking",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "$9/month",
    priceAmount: "$9",
    period: "/month",
    description: "Most popular for focused viewers",
    channels: 25,
    features: [
      "Up to 25 channels",
      "Custom categories",
      "Watch history (30 days)",
      "Resume playback",
      "Video search",
      "Daily watch limits",
      "7-day free trial",
    ],
  },
  unlimited: {
    id: "unlimited",
    name: "Unlimited",
    price: "$12/month",
    priceAmount: "$12",
    period: "/month",
    description: "No limits, ever",
    channels: Infinity,
    features: [
      "Unlimited channels",
      "Everything in Pro",
      "Forever watch history",
      "Export channel list",
      "Priority support",
      "Priority access to new features",
      "7-day free trial",
    ],
  },
};

/**
 * Get tier config by ID.
 */
export function getTier(id: TierID): TierConfig {
  return TIERS[id];
}

/**
 * Get all tiers as an array (useful for iteration).
 */
export function getAllTiers(): TierConfig[] {
  return Object.values(TIERS);
}

