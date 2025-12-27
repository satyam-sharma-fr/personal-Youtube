"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Delete the current user's account and all associated data.
 * This action:
 * 1. Deletes all user data from tables (cascades via FK)
 * 2. Deletes the user from Supabase Auth
 */
export async function deleteAccount() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in to delete your account" };
  }

  try {
    // Delete user data from all related tables
    // Most tables cascade on delete from profiles, but let's be explicit
    
    // Delete watch later items
    await supabase
      .from("user_watch_later")
      .delete()
      .eq("user_id", user.id);
    
    // Delete video states
    await supabase
      .from("user_video_state")
      .delete()
      .eq("user_id", user.id);
    
    // Delete daily watch sessions
    await supabase
      .from("daily_watch_sessions")
      .delete()
      .eq("user_id", user.id);
    
    // Delete channel category assignments
    await supabase
      .from("channel_category_channels")
      .delete()
      .eq("user_id", user.id);
    
    // Delete categories
    await supabase
      .from("channel_categories")
      .delete()
      .eq("user_id", user.id);
    
    // Delete channel subscriptions
    await supabase
      .from("channel_subscriptions")
      .delete()
      .eq("user_id", user.id);
    
    // Delete profile (this should cascade, but be explicit)
    await supabase
      .from("profiles")
      .delete()
      .eq("id", user.id);

    // Delete the user from Supabase Auth using admin client
    const adminClient = createAdminClient();
    
    if (!adminClient) {
      console.error("Admin client not configured");
      return { error: "Account deletion is not configured. Please contact support." };
    }
    
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error("Failed to delete auth user:", deleteError);
      return { error: "Failed to delete account. Please contact support." };
    }

    return { success: true };
  } catch (error) {
    console.error("Delete account error:", error);
    return { error: "Failed to delete account. Please try again." };
  }
}

