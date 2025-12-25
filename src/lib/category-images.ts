import { createClient } from "@/lib/supabase/client";

const BUCKET_NAME = "category-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Uploads an image to Supabase Storage for category images
 * @param file The image file to upload
 * @param userId The user's ID (used for folder organization)
 * @returns The public URL of the uploaded image or an error
 */
export async function uploadCategoryImage(
  file: File,
  userId: string
): Promise<UploadResult> {
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      success: false,
      error: "Invalid file type. Please upload PNG, JPEG, or WebP images.",
    };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: "File too large. Maximum size is 5MB.",
    };
  }

  const supabase = createClient();

  // Generate a unique filename
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return {
      success: false,
      error: "Failed to upload image. Please try again.",
    };
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return {
    success: true,
    url: urlData.publicUrl,
  };
}

/**
 * Deletes a category image from Supabase Storage
 * @param imageUrl The full public URL of the image
 * @param userId The user's ID
 */
export async function deleteCategoryImage(
  imageUrl: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  // Don't delete built-in images (those starting with /category-images/)
  if (imageUrl.startsWith("/category-images/")) {
    return { success: true };
  }

  const supabase = createClient();

  // Extract the file path from the URL
  // URL format: https://xxx.supabase.co/storage/v1/object/public/category-images/userId/filename.ext
  try {
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/category-images\/(.+)$/);
    if (!pathMatch) {
      return { success: true }; // Not a storage URL, skip deletion
    }

    const filePath = pathMatch[1];

    // Verify the file belongs to this user
    if (!filePath.startsWith(`${userId}/`)) {
      return { success: false, error: "Cannot delete another user's image" };
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("Delete error:", error);
      return { success: false, error: "Failed to delete image" };
    }

    return { success: true };
  } catch {
    // Not a valid URL, probably a local path
    return { success: true };
  }
}

