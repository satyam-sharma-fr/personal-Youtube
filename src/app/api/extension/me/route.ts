import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/types/database";

// CORS headers for extension requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header", authenticated: false },
        { status: 401, headers: corsHeaders }
      );
    }

    const accessToken = authHeader.slice(7); // Remove "Bearer " prefix

    // Create a Supabase client with the user's access token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Server configuration error", authenticated: false },
        { status: 500, headers: corsHeaders }
      );
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    // Verify the user from the token
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired token", authenticated: false },
        { status: 401, headers: corsHeaders }
      );
    }

    // Get user profile for additional info
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single();

    // Get channel count
    const { count: channelCount } = await supabase
      .from("channel_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          subscriptionTier: profile?.subscription_tier || "free",
          channelCount: channelCount || 0,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Extension me error:", error);
    return NextResponse.json(
      { error: "Internal server error", authenticated: false },
      { status: 500, headers: corsHeaders }
    );
  }
}

