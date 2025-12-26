"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { searchChannels as searchYouTubeChannels } from "@/lib/youtube";
import { addChannelForUser } from "@/lib/channels/add-channel";

export async function addChannel(input: string, categoryIds?: string[]) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in to add channels" };
  }

  // Use the shared helper
  const result = await addChannelForUser({
    supabase,
    userId: user.id,
    input,
    categoryIds,
  });

  // Revalidate paths if successful (server action specific)
  if (result.success) {
    revalidatePath("/dashboard");
    revalidatePath("/channels");
  }

  return result;
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

