import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getDodoClient, isDodoConfigured } from "@/lib/dodo/client";
import { getTierForProductId, type SubscriptionTier } from "@/lib/dodo/products";
import type { Database } from "@/types/database";

/**
 * POST /api/billing/webhook
 * 
 * Handles Dodo Payments webhook events.
 * Verifies signature and updates user subscription status.
 * 
 * Webhook events handled:
 * - subscription.active: Subscription activated
 * - subscription.updated: Subscription updated
 * - subscription.cancelled: Subscription cancelled
 * - subscription.expired: Subscription expired
 * - subscription.on_hold: Subscription on hold (payment failed)
 * - subscription.failed: Subscription creation failed
 */

// Dodo subscription webhook payload structure
interface DodoSubscriptionPayload {
  subscription_id: string;
  product_id: string;
  status: "pending" | "active" | "on_hold" | "cancelled" | "failed" | "expired";
  customer: {
    customer_id: string;
    email: string;
    name?: string;
  };
  metadata?: {
    user_id?: string;
    tier?: string;
  };
  next_billing_date?: string;
  cancelled_at?: string | null;
}

interface DodoWebhookEvent {
  type: string;
  timestamp: string;
  business_id: string;
  data: DodoSubscriptionPayload;
}

// Create admin Supabase client for webhook handler (bypasses RLS)
function createAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase admin credentials not configured");
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(request: Request) {
  try {
    // Check configuration
    if (!isDodoConfigured()) {
      console.error("Dodo Payments not configured");
      return NextResponse.json(
        { error: "Webhook handler not configured" },
        { status: 503 }
      );
    }

    // Get raw body for signature verification
    const rawBody = await request.text();

    // Extract webhook headers
    const webhookId = request.headers.get("webhook-id");
    const webhookSignature = request.headers.get("webhook-signature");
    const webhookTimestamp = request.headers.get("webhook-timestamp");

    if (!webhookId || !webhookSignature || !webhookTimestamp) {
      console.error("Missing webhook headers");
      return NextResponse.json(
        { error: "Missing webhook headers" },
        { status: 400 }
      );
    }

    // Verify signature using Dodo SDK
    const dodoClient = getDodoClient();
    let event: DodoWebhookEvent;

    try {
      // The unwrap method verifies the signature and returns the parsed payload
      const unwrapped = dodoClient.webhooks.unwrap(rawBody, {
        headers: {
          "webhook-id": webhookId,
          "webhook-signature": webhookSignature,
          "webhook-timestamp": webhookTimestamp,
        },
      });
      event = unwrapped as unknown as DodoWebhookEvent;
    } catch (verifyError) {
      console.error("Webhook signature verification failed:", verifyError);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Create admin Supabase client
    const supabase = createAdminSupabase();

    // Idempotency check - insert webhook event first
    const { error: idempotencyError } = await supabase
      .from("dodo_webhook_events")
      .insert({
        webhook_id: webhookId,
        event_type: event.type,
        payload: event as unknown as Database["public"]["Tables"]["dodo_webhook_events"]["Insert"]["payload"],
        processed: false,
      });

    if (idempotencyError) {
      // If unique constraint violation, this webhook was already processed
      if (idempotencyError.code === "23505") {
        console.log(`Webhook ${webhookId} already processed, skipping`);
        return NextResponse.json({ received: true });
      }
      console.error("Idempotency insert error:", idempotencyError);
      // Continue processing even if idempotency insert fails
    }

    // Handle subscription events
    if (event.type.startsWith("subscription.")) {
      await handleSubscriptionEvent(supabase, event);
    }

    // Mark webhook as processed
    await supabase
      .from("dodo_webhook_events")
      .update({ processed: true })
      .eq("webhook_id", webhookId);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleSubscriptionEvent(
  supabase: ReturnType<typeof createAdminSupabase>,
  event: DodoWebhookEvent
) {
  const { type, data } = event;
  const subscription = data;

  // Get user_id from metadata or try to find by customer email
  let userId = subscription.metadata?.user_id;

  if (!userId && subscription.customer?.email) {
    // Try to find user by email
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", subscription.customer.email)
      .single();

    if (profile) {
      userId = profile.id;
    }
  }

  if (!userId) {
    console.error("Cannot find user for subscription:", subscription.subscription_id);
    return;
  }

  // Determine subscription tier from product_id
  const tier = getTierForProductId(subscription.product_id);

  // Map Dodo status to our subscription_status
  const statusMap: Record<string, string> = {
    pending: "pending",
    active: "active",
    on_hold: "past_due",
    cancelled: "cancelled",
    failed: "failed",
    expired: "expired",
  };
  const subscriptionStatus = statusMap[subscription.status] || subscription.status;

  console.log(`Processing ${type} for user ${userId}: status=${subscriptionStatus}, tier=${tier}`);

  switch (type) {
    case "subscription.active":
    case "subscription.renewed":
      // Subscription is active - grant access
      await supabase
        .from("profiles")
        .update({
          dodo_customer_id: subscription.customer.customer_id,
          dodo_subscription_id: subscription.subscription_id,
          dodo_product_id: subscription.product_id,
          subscription_tier: tier,
          subscription_status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      break;

    case "subscription.updated":
    case "subscription.plan_changed":
      // Subscription updated - sync status
      await supabase
        .from("profiles")
        .update({
          dodo_customer_id: subscription.customer.customer_id,
          dodo_subscription_id: subscription.subscription_id,
          dodo_product_id: subscription.product_id,
          subscription_tier: tier,
          subscription_status: subscriptionStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      break;

    case "subscription.on_hold":
      // Payment failed - keep tier but mark as past_due
      await supabase
        .from("profiles")
        .update({
          subscription_status: "past_due",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      break;

    case "subscription.cancelled":
    case "subscription.expired":
    case "subscription.failed":
      // Subscription ended - revert to free tier
      await supabase
        .from("profiles")
        .update({
          subscription_tier: "free" as SubscriptionTier,
          subscription_status: subscriptionStatus,
          // Keep dodo_customer_id for potential resubscription
          dodo_subscription_id: null,
          dodo_product_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      break;

    default:
      console.log(`Unhandled subscription event type: ${type}`);
  }
}

