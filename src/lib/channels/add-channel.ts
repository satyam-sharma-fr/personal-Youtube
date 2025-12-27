import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import {
  parseChannelInput,
  getChannelById,
  getChannelByHandle,
  getChannelByUsername,
  getChannelByCustomUrl,
  getChannelVideos,
  searchChannels as searchYouTubeChannels,
  type YouTubeChannelData,
} from "@/lib/youtube";

export interface AddChannelResult {
  success?: boolean;
  error?: string;
  channel?: YouTubeChannelData;
}

export interface AddChannelParams {
  supabase: SupabaseClient<Database>;
  userId: string;
  input: string;
  categoryIds?: string[];
}

/**
 * Core logic for adding a channel to a user's subscriptions.
 * This is used by both the server action (cookie session) and the extension API route (Bearer token).
 */
export async function addChannelForUser({
  supabase,
  userId,
  input,
  categoryIds,
}: AddChannelParams): Promise<AddChannelResult> {
  // Parse the input
  const parsed = parseChannelInput(input);
  if (!parsed) {
    return { error: "Invalid channel input" };
  }

  try {
    // Get channel info from YouTube
    let channelData: YouTubeChannelData | null = null;
    if (parsed.type === "id") {
      channelData = await getChannelById(parsed.value);
    } else if (parsed.type === "handle") {
      channelData = await getChannelByHandle(parsed.value);
    } else if (parsed.type === "username") {
      channelData =
        (await getChannelByUsername(parsed.value)) ??
        (await getChannelByHandle(parsed.value));
    } else if (parsed.type === "customUrl") {
      channelData = await getChannelByCustomUrl(parsed.value);
    }

    // Fallback: if parsing wasn't enough (or legacy endpoints didn't work), try search
    if (!channelData) {
      const results = await searchYouTubeChannels(parsed.value, 1);
      channelData = results[0] ?? null;
    }

    if (!channelData) {
      return { error: "Channel not found" };
    }

    // Check if already subscribed
    const { data: existingSub, error: existingSubError } = await supabase
      .from("channel_subscriptions")
      .select("id")
      .eq("user_id", userId)
      .eq("channel_id", channelData.channelId)
      .maybeSingle();

    // If we got an error other than "no rows", surface it for debugging
    if (existingSubError) {
      console.error("Existing subscription check error:", existingSubError);
      return { error: `Failed to check existing subscription: ${existingSubError.message}` };
    }

    if (existingSub) {
      return { error: "You're already subscribed to this channel" };
    }

    // Check subscription limits
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", userId)
      .single();

    const { count: currentCount } = await supabase
      .from("channel_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    const limits = { free: 5, pro: 25, unlimited: Infinity };
    const tier = (profile?.subscription_tier || "free") as keyof typeof limits;
    const limit = limits[tier];

    if (currentCount && currentCount >= limit) {
      return { error: `You've reached the ${limit} channel limit for your plan. Upgrade to add more.` };
    }

    // Upsert channel to cache
    const { error: channelError } = await supabase
      .from("youtube_channels")
      .upsert({
        channel_id: channelData.channelId,
        title: channelData.title,
        description: channelData.description,
        thumbnail_url: channelData.thumbnailUrl,
        subscriber_count: channelData.subscriberCount,
        video_count: channelData.videoCount,
        uploads_playlist_id: channelData.uploadsPlaylistId,
        custom_url: channelData.customUrl,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "channel_id",
      });

    if (channelError) {
      console.error("Channel upsert error:", channelError);
      return { error: `Failed to save channel data: ${channelError.message}` };
    }

    // Create subscription
    const { error: subError } = await supabase
      .from("channel_subscriptions")
      .insert({
        user_id: userId,
        channel_id: channelData.channelId,
      });

    if (subError) {
      console.error("Subscription error:", subError);
      return { error: `Failed to subscribe to channel: ${subError.message}` };
    }

    // Assign categories if provided
    if (categoryIds && categoryIds.length > 0) {
      const categoryAssignments = categoryIds.map((categoryId) => ({
        user_id: userId,
        category_id: categoryId,
        channel_id: channelData.channelId,
      }));

      const { error: categoryError } = await supabase
        .from("channel_category_channels")
        .insert(categoryAssignments);

      if (categoryError) {
        console.error("Category assignment error:", categoryError);
        // Don't fail the whole operation if category assignment fails
      }
    }

    // Fetch and cache videos
    try {
      const videos = await getChannelVideos(channelData.uploadsPlaylistId, 20);
      
      if (videos.length > 0) {
        const videoRecords = videos.map((video) => ({
          video_id: video.videoId,
          channel_id: video.channelId,
          title: video.title,
          description: video.description,
          thumbnail_url: video.thumbnailUrl,
          thumbnail_high_url: video.thumbnailHighUrl,
          published_at: video.publishedAt,
          duration: video.duration,
          view_count: video.viewCount,
          like_count: video.likeCount,
          updated_at: new Date().toISOString(),
        }));

        await supabase
          .from("youtube_videos")
          .upsert(videoRecords, { onConflict: "video_id" });
      }
    } catch (videoError) {
      console.error("Video fetch error:", videoError);
      // Don't fail the whole operation if video fetch fails
    }

    return { success: true, channel: channelData };
  } catch (error) {
    console.error("Add channel error:", error);

    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("YouTube API key is not configured")) {
      return {
        error:
          "Missing YOUTUBE_API_KEY. Add it to `.env.local` and restart the dev server.",
      };
    }
    if (message.startsWith("YouTube API error:")) {
      return {
        error:
          `${message}. Check that your key is valid, the YouTube Data API v3 is enabled in Google Cloud, and you have quota left.`,
      };
    }

    return { error: message || "Failed to add channel. Please try again." };
  }
}


