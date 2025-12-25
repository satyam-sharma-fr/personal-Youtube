"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ChannelCategory } from "@/types/database";

// Default categories with their built-in images
const DEFAULT_CATEGORIES = [
  { name: "Work", image_url: "/category-images/work.svg" },
  { name: "Learning", image_url: "/category-images/learning.svg" },
  { name: "Personal", image_url: "/category-images/personal.svg" },
  { name: "Travel", image_url: "/category-images/travel.svg" },
  { name: "Hobby", image_url: "/category-images/hobby.svg" },
] as const;

/**
 * Ensures the user has the default categories.
 * This is idempotent - it only creates categories that don't already exist.
 * Called from the dashboard layout on first visit.
 */
export async function ensureDefaultCategories() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  // Get existing categories for this user
  const { data: existingCategories, error: fetchError } = await supabase
    .from("channel_categories")
    .select("name")
    .eq("user_id", user.id);

  if (fetchError) {
    console.error("Error fetching existing categories:", fetchError);
    return { error: "Failed to check existing categories" };
  }

  // Create a Set of existing category names (lowercase for case-insensitive comparison)
  const existingNames = new Set(
    (existingCategories || []).map((c) => c.name.toLowerCase())
  );

  // Find which default categories are missing
  const missingCategories = DEFAULT_CATEGORIES.filter(
    (dc) => !existingNames.has(dc.name.toLowerCase())
  );

  if (missingCategories.length === 0) {
    return { success: true, created: 0 };
  }

  // Insert missing default categories
  const { error: insertError } = await supabase
    .from("channel_categories")
    .insert(
      missingCategories.map((cat) => ({
        user_id: user.id,
        name: cat.name,
        image_url: cat.image_url,
      }))
    );

  if (insertError) {
    console.error("Error inserting default categories:", insertError);
    return { error: "Failed to create default categories" };
  }

  return { success: true, created: missingCategories.length };
}

export async function createCategory(name: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in to create categories" };
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    return { error: "Category name cannot be empty" };
  }

  // Check for duplicate (case-insensitive check handled by DB unique constraint)
  const { data: existing } = await supabase
    .from("channel_categories")
    .select("id")
    .eq("user_id", user.id)
    .ilike("name", trimmedName)
    .single();

  if (existing) {
    return { error: "A category with this name already exists" };
  }

  const { data, error } = await supabase
    .from("channel_categories")
    .insert({
      user_id: user.id,
      name: trimmedName,
    })
    .select()
    .single();

  if (error) {
    console.error("Create category error:", error);
    return { error: "Failed to create category" };
  }

  revalidatePath("/channels");
  revalidatePath("/dashboard");

  return { success: true, category: data };
}

export async function renameCategory(categoryId: string, newName: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  const trimmedName = newName.trim();
  if (!trimmedName) {
    return { error: "Category name cannot be empty" };
  }

  // Check for duplicate (excluding current category)
  const { data: existing } = await supabase
    .from("channel_categories")
    .select("id")
    .eq("user_id", user.id)
    .ilike("name", trimmedName)
    .neq("id", categoryId)
    .single();

  if (existing) {
    return { error: "A category with this name already exists" };
  }

  const { error } = await supabase
    .from("channel_categories")
    .update({
      name: trimmedName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", categoryId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Rename category error:", error);
    return { error: "Failed to rename category" };
  }

  revalidatePath("/channels");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  // Delete category (cascade will remove join table entries)
  const { error } = await supabase
    .from("channel_categories")
    .delete()
    .eq("id", categoryId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Delete category error:", error);
    return { error: "Failed to delete category" };
  }

  revalidatePath("/channels");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function getUserCategories(): Promise<{
  error?: string;
  success?: boolean;
  categories?: ChannelCategory[];
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  const { data, error } = await supabase
    .from("channel_categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) {
    console.error("Get categories error:", error);
    return { error: "Failed to load categories" };
  }

  return { success: true, categories: data };
}

export async function setChannelCategories(
  channelId: string,
  categoryIds: string[]
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  // Verify channel is subscribed by this user
  const { data: subscription } = await supabase
    .from("channel_subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("channel_id", channelId)
    .single();

  if (!subscription) {
    return { error: "Channel not found in your subscriptions" };
  }

  // Delete existing category assignments for this channel
  const { error: deleteError } = await supabase
    .from("channel_category_channels")
    .delete()
    .eq("user_id", user.id)
    .eq("channel_id", channelId);

  if (deleteError) {
    console.error("Delete channel categories error:", deleteError);
    return { error: "Failed to update channel categories" };
  }

  // Insert new assignments if any categories selected
  if (categoryIds.length > 0) {
    const assignments = categoryIds.map((categoryId) => ({
      user_id: user.id,
      category_id: categoryId,
      channel_id: channelId,
    }));

    const { error: insertError } = await supabase
      .from("channel_category_channels")
      .insert(assignments);

    if (insertError) {
      console.error("Insert channel categories error:", insertError);
      return { error: "Failed to update channel categories" };
    }
  }

  revalidatePath("/channels");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function getChannelCategories(channelId: string): Promise<{
  error?: string;
  success?: boolean;
  categoryIds?: string[];
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  const { data, error } = await supabase
    .from("channel_category_channels")
    .select("category_id")
    .eq("user_id", user.id)
    .eq("channel_id", channelId);

  if (error) {
    console.error("Get channel categories error:", error);
    return { error: "Failed to load channel categories" };
  }

  return {
    success: true,
    categoryIds: data.map((d) => d.category_id),
  };
}

export async function getChannelsInCategory(categoryId: string): Promise<{
  error?: string;
  success?: boolean;
  channelIds?: string[];
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  const { data, error } = await supabase
    .from("channel_category_channels")
    .select("channel_id")
    .eq("user_id", user.id)
    .eq("category_id", categoryId);

  if (error) {
    console.error("Get channels in category error:", error);
    return { error: "Failed to load channels in category" };
  }

  return {
    success: true,
    channelIds: data.map((d) => d.channel_id),
  };
}

export async function getCategoriesWithChannelCounts(): Promise<{
  error?: string;
  success?: boolean;
  categories?: (ChannelCategory & { channelCount: number })[];
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  // Get categories
  const { data: categories, error: catError } = await supabase
    .from("channel_categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (catError) {
    console.error("Get categories error:", catError);
    return { error: "Failed to load categories" };
  }

  // Get counts per category
  const { data: counts, error: countError } = await supabase
    .from("channel_category_channels")
    .select("category_id")
    .eq("user_id", user.id);

  if (countError) {
    console.error("Get counts error:", countError);
    return { error: "Failed to load category counts" };
  }

  // Build count map
  const countMap = new Map<string, number>();
  for (const row of counts || []) {
    countMap.set(row.category_id, (countMap.get(row.category_id) || 0) + 1);
  }

  // Attach counts to categories
  const categoriesWithCounts = (categories || []).map((cat) => ({
    ...cat,
    channelCount: countMap.get(cat.id) || 0,
  }));

  return { success: true, categories: categoriesWithCounts };
}

export async function updateCategoryImage(
  categoryId: string,
  imageUrl: string | null
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  const { error } = await supabase
    .from("channel_categories")
    .update({
      image_url: imageUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", categoryId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Update category image error:", error);
    return { error: "Failed to update category image" };
  }

  revalidatePath("/channels");
  revalidatePath("/dashboard");
  revalidatePath("/home");

  return { success: true };
}

export async function createCategoryWithImage(name: string, imageUrl?: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in to create categories" };
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    return { error: "Category name cannot be empty" };
  }

  // Check for duplicate (case-insensitive check handled by DB unique constraint)
  const { data: existing } = await supabase
    .from("channel_categories")
    .select("id")
    .eq("user_id", user.id)
    .ilike("name", trimmedName)
    .single();

  if (existing) {
    return { error: "A category with this name already exists" };
  }

  const { data, error } = await supabase
    .from("channel_categories")
    .insert({
      user_id: user.id,
      name: trimmedName,
      image_url: imageUrl || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Create category error:", error);
    return { error: "Failed to create category" };
  }

  revalidatePath("/channels");
  revalidatePath("/dashboard");
  revalidatePath("/home");

  return { success: true, category: data };
}

