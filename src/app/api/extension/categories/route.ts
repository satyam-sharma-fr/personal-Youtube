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
        { error: "Missing or invalid Authorization header", categories: [] },
        { status: 401, headers: corsHeaders }
      );
    }

    const accessToken = authHeader.slice(7); // Remove "Bearer " prefix

    // Create a Supabase client with the user's access token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Server configuration error", categories: [] },
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
        { error: "Invalid or expired token", categories: [] },
        { status: 401, headers: corsHeaders }
      );
    }

    // Get user's categories
    const { data: categories, error: categoriesError } = await supabase
      .from("channel_categories")
      .select("id, name, color, icon")
      .eq("user_id", user.id)
      .order("name", { ascending: true });

    if (categoriesError) {
      console.error("Categories fetch error:", categoriesError);
      return NextResponse.json(
        { error: "Failed to fetch categories", categories: [] },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { categories: categories || [] },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Extension categories error:", error);
    return NextResponse.json(
      { error: "Internal server error", categories: [] },
      { status: 500, headers: corsHeaders }
    );
  }
}

