/**
 * Dodo Payments product configuration.
 * 
 * Map your subscription tiers to Dodo product IDs.
 * Create these products in the Dodo Payments dashboard first.
 * 
 * Environment variables (optional - can hardcode after setup):
 * - DODO_PRODUCT_PRO: Product ID for Pro tier
 * - DODO_PRODUCT_UNLIMITED: Product ID for Unlimited tier
 */

export type SubscriptionTier = "free" | "pro" | "unlimited";

export interface ProductConfig {
  productId: string;
  tier: SubscriptionTier;
  name: string;
  priceDisplay: string;
}

/**
 * Get the Dodo product ID for a subscription tier.
 * Returns null for 'free' tier (no product needed).
 */
export function getProductIdForTier(tier: SubscriptionTier): string | null {
  const products = getProducts();
  const product = products.find((p) => p.tier === tier);
  return product?.productId || null;
}

/**
 * Get the subscription tier for a Dodo product ID.
 * Returns 'free' if product ID not found.
 */
export function getTierForProductId(productId: string | null): SubscriptionTier {
  if (!productId) return "free";
  const products = getProducts();
  const product = products.find((p) => p.productId === productId);
  return product?.tier || "free";
}

/**
 * Get all configured products.
 * 
 * These product IDs match your Dodo Payments dashboard.
 * Override with env vars if needed.
 */
export function getProducts(): ProductConfig[] {
  return [
    {
      productId: process.env.DODO_PRODUCT_PRO || "pdt_0NUxgSgmDu9GmA6RXIILj",
      tier: "pro",
      name: "Pro",
      priceDisplay: "$9/month",
    },
    {
      productId: process.env.DODO_PRODUCT_UNLIMITED || "pdt_0NUxgbFKv2jYYQ2tF8lA5",
      tier: "unlimited",
      name: "Unlimited",
      priceDisplay: "$12/month",
    },
  ];
}

/**
 * Validate that a tier is upgradeable (not free).
 */
export function isUpgradeableTier(tier: string): tier is "pro" | "unlimited" {
  return tier === "pro" || tier === "unlimited";
}

