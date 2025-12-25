"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface FeedOptions {
  cursor?: string;
  limit?: number;
  channelId?: string;
}

export async function getFeed(options: FeedOptions = {}) {
  const { cursor, limit = 20, channelId } = options;
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  // Get user's subscribed channel IDs
  const { data: subscriptions } = await supabase
    .from("channel_subscriptions")
    .select("channel_id")
    .eq("user_id", user.id);

  if (!subscriptions?.length) {
    return { success: true, videos: [], hasMore: false, nextCursor: null };
  }

  const channelIds = channelId 
    ? [channelId] 
    : subscriptions.map((s) => s.channel_id);

  // Use RPC function to get videos with channel info
  const { data: videosData, error } = await supabase.rpc("get_user_feed", {
    p_user_id: user.id,
    p_channel_ids: channelIds,
    p_limit: limit + 1,
    ...(cursor ? { p_cursor: cursor } : {}),
  });

  if (error) {
    console.error("Feed error:", error);
    return { error: "Failed to load feed" };
  }

  // Transform the data to match expected format
  const videos = videosData?.map((v: {
    id: string;
    video_id: string;
    channel_id: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    thumbnail_high_url: string | null;
    published_at: string;
    duration: string | null;
    view_count: string | null;
    like_count: string | null;
    channel_title: string | null;
    channel_thumbnail_url: string | null;
    channel_custom_url: string | null;
  }) => ({
    id: v.id,
    video_id: v.video_id,
    channel_id: v.channel_id,
    title: v.title,
    description: v.description,
    thumbnail_url: v.thumbnail_url,
    thumbnail_high_url: v.thumbnail_high_url,
    published_at: v.published_at,
    duration: v.duration,
    view_count: v.view_count,
    like_count: v.like_count,
    youtube_channels: v.channel_title ? {
      title: v.channel_title,
      thumbnail_url: v.channel_thumbnail_url,
      custom_url: v.channel_custom_url,
    } : null,
  })) || [];

  // Check if there are more results
  const hasMore = videos.length > limit;
  const returnVideos = hasMore ? videos.slice(0, limit) : videos;
  const nextCursor = hasMore ? returnVideos[returnVideos.length - 1].published_at : null;

  // Get watched states for these videos
  const videoIds = returnVideos.map((v: { video_id: string }) => v.video_id);
  const { data: watchedStates } = await supabase
    .from("user_video_state")
    .select("video_id, watched, progress_seconds, completed")
    .eq("user_id", user.id)
    .in("video_id", videoIds);

  // Create a map of video_id to watched state
  const watchedMap = new Map(
    watchedStates?.map((s) => [s.video_id, s]) || []
  );

  // Attach watched state to videos
  const videosWithState = returnVideos.map((video: { video_id: string }) => ({
    ...video,
    watched: watchedMap.get(video.video_id)?.watched || false,
    progress_seconds: watchedMap.get(video.video_id)?.progress_seconds || 0,
    completed: watchedMap.get(video.video_id)?.completed || false,
  }));

  return {
    success: true,
    videos: videosWithState,
    hasMore,
    nextCursor,
  };
}

export async function markVideoWatched(videoId: string, watched: boolean = true) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  const { error } = await supabase
    .from("user_video_state")
    .upsert({
      user_id: user.id,
      video_id: videoId,
      watched,
      watched_at: watched ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id,video_id",
    });

  if (error) {
    console.error("Mark watched error:", error);
    return { error: "Failed to update video state" };
  }

  revalidatePath("/dashboard");

  return { success: true };
}

export async function updateVideoProgress(videoId: string, progressSeconds: number, completed: boolean = false) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  const { error } = await supabase
    .from("user_video_state")
    .upsert({
      user_id: user.id,
      video_id: videoId,
      progress_seconds: progressSeconds,
      completed,
      watched: completed,
      watched_at: completed ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id,video_id",
    });

  if (error) {
    console.error("Update progress error:", error);
    return { error: "Failed to update video progress" };
  }

  return { success: true };
}

export async function getVideoState(videoId: string) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  const { data, error } = await supabase
    .from("user_video_state")
    .select("*")
    .eq("user_id", user.id)
    .eq("video_id", videoId)
    .single();

  if (error && error.code !== "PGRST116") { // PGRST116 is "not found"
    console.error("Get video state error:", error);
    return { error: "Failed to get video state" };
  }

  return { success: true, state: data || null };
}

export async function getWatchHistory(limit = 50) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  // Get watch history
  const { data: history, error } = await supabase
    .from("user_video_state")
    .select("video_id, watched_at, progress_seconds, completed")
    .eq("user_id", user.id)
    .eq("watched", true)
    .order("watched_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Watch history error:", error);
    return { error: "Failed to load watch history" };
  }

  if (!history?.length) {
    return { success: true, history: [] };
  }

  // Get video details separately
  const videoIds = history.map((h) => h.video_id);
  const { data: videos } = await supabase
    .from("youtube_videos")
    .select("video_id, title, thumbnail_url, duration, channel_id")
    .in("video_id", videoIds);

  // Create a map
  const videoMap = new Map(videos?.map((v) => [v.video_id, v]) || []);

  // Combine the data
  const combined = history.map((h) => ({
    ...h,
    video: videoMap.get(h.video_id) || null,
  }));

  return { success: true, history: combined };
}

