import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDodoClient, getReturnUrl, isDodoConfigured } from "@/lib/dodo/client";
import { getProductIdForTier, isUpgradeableTier } from "@/lib/dodo/products";

/**
 * POST /api/billing/checkout
 * 
 * Creates a Dodo Payments checkout session for subscription upgrade.
 * 
 * Request body:
 * - tier: "pro" | "unlimited"
 * 
 * Response:
 * - checkout_url: URL to redirect user to for payment
 */
export async function POST(request: Request) {
  try {
    // Check Dodo configuration
    if (!isDodoConfigured()) {
      return NextResponse.json(
        { error: "Payment system not configured" },
        { status: 503 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { tier } = body;

    // Validate tier
    if (!tier || !isUpgradeableTier(tier)) {
      return NextResponse.json(
        { error: "Invalid tier. Must be 'pro' or 'unlimited'" },
        { status: 400 }
      );
    }

    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user profile for email/name
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name, subscription_tier")
      .eq("id", user.id)
      .single();

    // Check if already on this tier or higher
    if (profile?.subscription_tier === tier) {
      return NextResponse.json(
        { error: "You are already on this plan" },
        { status: 400 }
      );
    }

    if (
      profile?.subscription_tier === "unlimited" &&
      tier === "pro"
    ) {
      return NextResponse.json(
        { error: "Cannot downgrade via checkout. Use customer portal to manage subscription." },
        { status: 400 }
      );
    }

    // Get product ID for the tier
    const productId = getProductIdForTier(tier);
    console.log(`[Checkout] tier=${tier}, productId=${productId}`);
    if (!productId) {
      return NextResponse.json(
        { error: "Product not configured for this tier" },
        { status: 500 }
      );
    }

    // Create Dodo checkout session
    const dodoClient = getDodoClient();
    const returnUrl = getReturnUrl();

    const checkoutResponse = await dodoClient.checkoutSessions.create({
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      customer: {
        email: profile?.email || user.email || "",
        name: profile?.full_name || user.user_metadata?.full_name || "",
      },
      metadata: {
        user_id: user.id,
        tier: tier,
      },
      return_url: `${returnUrl}/settings?billing=success`,
    });

    if (!checkoutResponse.checkout_url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      checkout_url: checkoutResponse.checkout_url,
      session_id: checkoutResponse.session_id,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

