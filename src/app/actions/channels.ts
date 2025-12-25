"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  parseChannelInput,
  getChannelById,
  getChannelByHandle,
  getChannelByUsername,
  getChannelByCustomUrl,
  getChannelVideos,
  searchChannels as searchYouTubeChannels,
} from "@/lib/youtube";

export async function addChannel(input: string, categoryIds?: string[]) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in to add channels" };
  }

  // Parse the input
  const parsed = parseChannelInput(input);
  if (!parsed) {
    return { error: "Invalid channel input" };
  }

  try {
    // Get channel info from YouTube
    let channelData = null;
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
      .eq("user_id", user.id)
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
      .eq("id", user.id)
      .single();

    const { count: currentCount } = await supabase
      .from("channel_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

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
        user_id: user.id,
        channel_id: channelData.channelId,
      });

    if (subError) {
      console.error("Subscription error:", subError);
      return { error: `Failed to subscribe to channel: ${subError.message}` };
    }

    // Assign categories if provided
    if (categoryIds && categoryIds.length > 0) {
      const categoryAssignments = categoryIds.map((categoryId) => ({
        user_id: user.id,
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

    revalidatePath("/dashboard");
    revalidatePath("/channels");

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

export async function removeChannel(channelId: string) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  // Remove category assignments first
  await supabase
    .from("channel_category_channels")
    .delete()
    .eq("user_id", user.id)
    .eq("channel_id", channelId);

  const { error } = await supabase
    .from("channel_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("channel_id", channelId);

  if (error) {
    console.error("Remove channel error:", error);
    return { error: "Failed to remove channel" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/channels");

  return { success: true };
}

export async function searchChannels(query: string) {
  try {
    const results = await searchYouTubeChannels(query, 10);
    return { success: true, channels: results };
  } catch (error) {
    console.error("Search error:", error);
    return { error: "Failed to search channels" };
  }
}

export async function getUserChannels() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  const { data: subscriptions, error } = await supabase
    .from("channel_subscriptions")
    .select(`
      id,
      channel_id,
      category,
      created_at,
      youtube_channels (
        channel_id,
        title,
        description,
        thumbnail_url,
        subscriber_count,
        video_count,
        custom_url
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Get channels error:", error);
    return { error: "Failed to load channels" };
  }

  return { success: true, channels: subscriptions };
}

export async function refreshChannelVideos(channelId: string) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  // Get channel's uploads playlist
  const { data: channel } = await supabase
    .from("youtube_channels")
    .select("uploads_playlist_id")
    .eq("channel_id", channelId)
    .single();

  if (!channel?.uploads_playlist_id) {
    return { error: "Channel not found" };
  }

  try {
    const videos = await getChannelVideos(channel.uploads_playlist_id, 20);
    
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

    // Update channel's updated_at
    await supabase
      .from("youtube_channels")
      .update({ updated_at: new Date().toISOString() })
      .eq("channel_id", channelId);

    revalidatePath("/dashboard");

    return { success: true, count: videos.length };
  } catch (error) {
    console.error("Refresh error:", error);
    return { error: "Failed to refresh videos" };
  }
}

export async function refreshAllChannels() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  // Get all user's subscribed channels
  const { data: subscriptions } = await supabase
    .from("channel_subscriptions")
    .select("channel_id")
    .eq("user_id", user.id);

  if (!subscriptions?.length) {
    return { success: true, count: 0 };
  }

  const channelIds = subscriptions.map((s) => s.channel_id);

  // Get uploads playlists
  const { data: channels } = await supabase
    .from("youtube_channels")
    .select("channel_id, uploads_playlist_id")
    .in("channel_id", channelIds);

  if (!channels?.length) {
    return { error: "No channels found" };
  }

  let totalVideos = 0;

  // Refresh each channel (could be parallelized but we'll be careful with rate limits)
  for (const channel of channels) {
    if (!channel.uploads_playlist_id) continue;

    try {
      const videos = await getChannelVideos(channel.uploads_playlist_id, 10);
      
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

        totalVideos += videos.length;
      }
    } catch (error) {
      console.error(`Failed to refresh channel ${channel.channel_id}:`, error);
    }
  }

  revalidatePath("/dashboard");

  return { success: true, count: totalVideos };
}

