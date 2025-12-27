-- Migration: Pivot from Stripe to Dodo Payments
-- This migration:
-- 1. Drops Stripe-specific columns from profiles table
-- 2. Adds Dodo Payments columns to profiles table
-- 3. Creates dodo_webhook_events table for idempotency

-- ============================================
-- Step 1: Drop Stripe columns from profiles
-- ============================================
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS stripe_customer_id,
  DROP COLUMN IF EXISTS stripe_subscription_id;

-- ============================================
-- Step 2: Add Dodo columns to profiles
-- ============================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dodo_customer_id TEXT NULL,
  ADD COLUMN IF NOT EXISTS dodo_subscription_id TEXT NULL,
  ADD COLUMN IF NOT EXISTS dodo_product_id TEXT NULL;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_dodo_customer_id 
  ON public.profiles(dodo_customer_id) 
  WHERE dodo_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_dodo_subscription_id 
  ON public.profiles(dodo_subscription_id) 
  WHERE dodo_subscription_id IS NOT NULL;

-- ============================================
-- Step 3: Create dodo_webhook_events table for idempotency
-- ============================================
CREATE TABLE IF NOT EXISTS public.dodo_webhook_events (
  webhook_id TEXT PRIMARY KEY,
  received_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE
);

-- Add index on event_type for querying
CREATE INDEX IF NOT EXISTS idx_dodo_webhook_events_event_type 
  ON public.dodo_webhook_events(event_type);

-- Add index on received_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_dodo_webhook_events_received_at 
  ON public.dodo_webhook_events(received_at);

-- ============================================
-- Step 4: Enable RLS on dodo_webhook_events (service role only)
-- ============================================
ALTER TABLE public.dodo_webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role (used by webhook handler) can access this table
-- No user-facing policies needed since webhooks use service role key

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON COLUMN public.profiles.dodo_customer_id IS 'Dodo Payments customer ID (cus_xxx)';
COMMENT ON COLUMN public.profiles.dodo_subscription_id IS 'Dodo Payments subscription ID (sub_xxx)';
COMMENT ON COLUMN public.profiles.dodo_product_id IS 'Dodo Payments product ID for the active subscription';
COMMENT ON TABLE public.dodo_webhook_events IS 'Stores Dodo Payments webhook events for idempotency';

