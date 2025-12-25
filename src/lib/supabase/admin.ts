import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Demo user ID - this should be a real user in your database
 * with curated channel subscriptions for demonstration.
 * 
 * Set this in your environment variables as DEMO_USER_ID
 */
export const DEMO_USER_ID = process.env.DEMO_USER_ID || "00000000-0000-0000-0000-000000000000";

/**
 * Helper to check if the admin client is properly configured.
 * Useful for graceful degradation in demo mode.
 */
export function isAdminConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Server-only Supabase admin client using service role key.
 * This bypasses RLS and should ONLY be used for:
 * - Demo routes (reading demo user's data)
 * - Admin operations
 * 
 * NEVER expose this client to the browser.
 * 
 * Returns null if not configured (for graceful degradation in demo).
 */
export function createAdminClient(): SupabaseClient<Database> | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn(
      "[Demo] Admin client not configured. Set SUPABASE_SERVICE_ROLE_KEY for live demo data."
    );
    return null;
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Mock data for demo when admin client is not configured.
 * This allows the demo to work without database setup.
 */
export const MOCK_DEMO_CHANNELS = [
  {
    channel_id: "UCYO_jab_esuFRV4b17AJtAw",
    title: "3Blue1Brown",
    description: "3Blue1Brown, by Grant Sanderson, is some combination of math and entertainment.",
    thumbnail_url: "https://yt3.ggpht.com/ytc/AIdro_nFzZFPLxPZRHcE3SSwzdrbuWqfoWYwLAqYpBGi4g=s88-c-k-c0x00ffffff-no-rj",
    subscriber_count: "6000000",
    video_count: "150",
    custom_url: "@3blue1brown",
  },
  {
    channel_id: "UCsBjURrPoezykLs9EqgamOA",
    title: "Fireship",
    description: "High-intensity code tutorials to help you build & ship your app faster.",
    thumbnail_url: "https://yt3.ggpht.com/ytc/AIdro_kDnGa_9nU1XjJfhVb5GMzH2yzqhRnR_cYAW48a5A=s88-c-k-c0x00ffffff-no-rj",
    subscriber_count: "3000000",
    video_count: "500",
    custom_url: "@Fireship",
  },
  {
    channel_id: "UCHnyfMqiRRG1u-2MsSQLbXA",
    title: "Veritasium",
    description: "An element of truth - videos about science, education, and anything else I find interesting.",
    thumbnail_url: "https://yt3.ggpht.com/ytc/AIdro_mKzklyPPhghBJQH5H3HpZ138MD5hPHPSVBbCk5Gw=s88-c-k-c0x00ffffff-no-rj",
    subscriber_count: "15000000",
    video_count: "200",
    custom_url: "@veritasium",
  },
  {
    channel_id: "UCBcRF18a7Qf58cCRy5xuWwQ",
    title: "MKBHD",
    description: "Quality Tech Videos | Host of Waveform Podcast",
    thumbnail_url: "https://yt3.ggpht.com/lkH37D712tiyphnu0Id0D5MwwQ7IRuwgQLVD05iMXlDWO-kDHut3uI4MgIBNvMJTH2Zr2xG6hME=s88-c-k-c0x00ffffff-no-rj",
    subscriber_count: "19000000",
    video_count: "1500",
    custom_url: "@mkbhd",
  },
];

export const MOCK_DEMO_CATEGORIES = [
  { id: "cat-1", name: "Learning" },
  { id: "cat-2", name: "Tech" },
];

export const MOCK_DEMO_VIDEOS = [
  {
    id: "v1",
    video_id: "r6sGWTCMz2k",
    channel_id: "UCYO_jab_esuFRV4b17AJtAw",
    title: "But what is a neural network? | Deep learning chapter 1",
    description: "An introduction to neural networks and deep learning.",
    thumbnail_url: "https://i.ytimg.com/vi/aircAruvnKk/hqdefault.jpg",
    thumbnail_high_url: "https://i.ytimg.com/vi/aircAruvnKk/maxresdefault.jpg",
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    duration: "PT19M13S",
    view_count: "15000000",
    like_count: "500000",
    channel_title: "3Blue1Brown",
    channel_thumbnail_url: "https://yt3.ggpht.com/ytc/AIdro_nFzZFPLxPZRHcE3SSwzdrbuWqfoWYwLAqYpBGi4g=s88-c-k-c0x00ffffff-no-rj",
    channel_custom_url: "@3blue1brown",
  },
  {
    id: "v2",
    video_id: "Tn6-PIqc4UM",
    channel_id: "UCsBjURrPoezykLs9EqgamOA",
    title: "React in 100 Seconds",
    description: "Learn the basics of React in 100 seconds.",
    thumbnail_url: "https://i.ytimg.com/vi/Tn6-PIqc4UM/hqdefault.jpg",
    thumbnail_high_url: "https://i.ytimg.com/vi/Tn6-PIqc4UM/maxresdefault.jpg",
    published_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    duration: "PT2M27S",
    view_count: "2000000",
    like_count: "80000",
    channel_title: "Fireship",
    channel_thumbnail_url: "https://yt3.ggpht.com/ytc/AIdro_kDnGa_9nU1XjJfhVb5GMzH2yzqhRnR_cYAW48a5A=s88-c-k-c0x00ffffff-no-rj",
    channel_custom_url: "@Fireship",
  },
  {
    id: "v3",
    video_id: "OoC0-vb7yE8",
    channel_id: "UCHnyfMqiRRG1u-2MsSQLbXA",
    title: "The Simplest Math Problem No One Can Solve",
    description: "The Collatz Conjecture is the simplest math problem no one can solve.",
    thumbnail_url: "https://i.ytimg.com/vi/094y1Z2wpJg/hqdefault.jpg",
    thumbnail_high_url: "https://i.ytimg.com/vi/094y1Z2wpJg/maxresdefault.jpg",
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    duration: "PT22M9S",
    view_count: "30000000",
    like_count: "900000",
    channel_title: "Veritasium",
    channel_thumbnail_url: "https://yt3.ggpht.com/ytc/AIdro_mKzklyPPhghBJQH5H3HpZ138MD5hPHPSVBbCk5Gw=s88-c-k-c0x00ffffff-no-rj",
    channel_custom_url: "@veritasium",
  },
  {
    id: "v4",
    video_id: "XuSz4YQYGEQ",
    channel_id: "UCBcRF18a7Qf58cCRy5xuWwQ",
    title: "The Best Smartphone of 2024!",
    description: "My picks for the best smartphones across categories.",
    thumbnail_url: "https://i.ytimg.com/vi/XuSz4YQYGEQ/hqdefault.jpg",
    thumbnail_high_url: "https://i.ytimg.com/vi/XuSz4YQYGEQ/maxresdefault.jpg",
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration: "PT18M45S",
    view_count: "5000000",
    like_count: "200000",
    channel_title: "MKBHD",
    channel_thumbnail_url: "https://yt3.ggpht.com/lkH37D712tiyphnu0Id0D5MwwQ7IRuwgQLVD05iMXlDWO-kDHut3uI4MgIBNvMJTH2Zr2xG6hME=s88-c-k-c0x00ffffff-no-rj",
    channel_custom_url: "@mkbhd",
  },
];

