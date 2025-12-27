import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDodoClient, isDodoConfigured } from "@/lib/dodo/client";

/**
 * GET /api/billing/customer-portal
 * 
 * Redirects authenticated user to Dodo Payments customer portal
 * where they can manage their subscription (cancel, update payment method, etc.)
 */
export async function GET() {
  try {
    // Check Dodo configuration
    if (!isDodoConfigured()) {
      return NextResponse.json(
        { error: "Payment system not configured" },
        { status: 503 }
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

    // Get user's Dodo customer ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("dodo_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile?.dodo_customer_id) {
      return NextResponse.json(
        { error: "No subscription found. Please upgrade first." },
        { status: 400 }
      );
    }

    // Create customer portal session
    const dodoClient = getDodoClient();

    const portalSession = await dodoClient.customers.customerPortal.create(
      profile.dodo_customer_id,
      {}
    );

    if (!portalSession.link) {
      return NextResponse.json(
        { error: "Failed to create portal session" },
        { status: 500 }
      );
    }

    // Return the portal URL for redirect
    return NextResponse.json({
      portal_url: portalSession.link,
    });
  } catch (error) {
    console.error("Customer portal error:", error);
    return NextResponse.json(
      { error: "Failed to create customer portal session" },
      { status: 500 }
    );
  }
}

