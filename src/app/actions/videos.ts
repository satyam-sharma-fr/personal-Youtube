"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface FeedOptions {
  cursor?: string;
  limit?: number;
  channelId?: string;
  categoryId?: string;
}

export async function getFeed(options: FeedOptions = {}) {
  const { cursor, limit = 20, channelId, categoryId } = options;
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

  let channelIds: string[];

  if (channelId) {
    // Filter by specific channel
    channelIds = [channelId];
  } else if (categoryId) {
    // Filter by category - get channels in this category
    const { data: categoryChannels } = await supabase
      .from("channel_category_channels")
      .select("channel_id")
      .eq("user_id", user.id)
      .eq("category_id", categoryId);

    if (!categoryChannels?.length) {
      return { success: true, videos: [], hasMore: false, nextCursor: null };
    }

    // Also ensure these channels are still subscribed
    const categoryChannelIds = categoryChannels.map((c) => c.channel_id);
    const subscribedIds = new Set(subscriptions.map((s) => s.channel_id));
    channelIds = categoryChannelIds.filter((id) => subscribedIds.has(id));

    if (channelIds.length === 0) {
      return { success: true, videos: [], hasMore: false, nextCursor: null };
    }
  } else {
    // All subscribed channels
    channelIds = subscriptions.map((s) => s.channel_id);
  }

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

export async function getWatchHistory(limit = 50, includePartial = true) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  // Get watch history - order by last_watched_at (most recent activity)
  // Include partial watches if requested (for "continue watching" and better summaries)
  let query = supabase
    .from("user_video_state")
    .select("video_id, watched_at, last_watched_at, first_watched_at, progress_seconds, total_watched_seconds, completed, watch_count")
    .eq("user_id", user.id);

  if (!includePartial) {
    // Only fully watched videos
    query = query.eq("watched", true);
  } else {
    // Include any video the user has interacted with (watched or has progress)
    query = query.or("watched.eq.true,total_watched_seconds.gt.0,progress_seconds.gt.0");
  }

  const { data: history, error } = await query
    .order("last_watched_at", { ascending: false, nullsFirst: false })
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
    .select("video_id, title, thumbnail_url, thumbnail_high_url, duration, channel_id")
    .in("video_id", videoIds);

  // Get channel info for the videos
  const channelIds = [...new Set(videos?.map((v) => v.channel_id) || [])];
  const { data: channels } = await supabase
    .from("youtube_channels")
    .select("channel_id, title, thumbnail_url")
    .in("channel_id", channelIds);

  // Create maps
  const videoMap = new Map(videos?.map((v) => [v.video_id, v]) || []);
  const channelMap = new Map(channels?.map((c) => [c.channel_id, c]) || []);

  // Combine the data
  const combined = history.map((h) => {
    const video = videoMap.get(h.video_id);
    const channel = video ? channelMap.get(video.channel_id) : null;
    return {
      ...h,
      video: video ? {
        ...video,
        youtube_channels: channel || null,
      } : null,
    };
  });

  return { success: true, history: combined };
}

// Log watch time delta for a specific video (called periodically from watch page)
export interface LogVideoWatchDeltaParams {
  videoId: string;
  deltaSeconds: number;
  progressSeconds?: number;
  completed?: boolean;
  isNewSession?: boolean; // true when starting a new watch session
}

export async function logVideoWatchDelta(params: LogVideoWatchDeltaParams) {
  const { videoId, deltaSeconds, progressSeconds, completed = false, isNewSession = false } = params;
  
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  const now = new Date().toISOString();

  // First, get existing state to properly increment values
  const { data: existing } = await supabase
    .from("user_video_state")
    .select("total_watched_seconds, watch_count, first_watched_at, progress_seconds")
    .eq("user_id", user.id)
    .eq("video_id", videoId)
    .single();

  // Calculate new values
  const currentTotalSeconds = existing?.total_watched_seconds ?? 0;
  const currentWatchCount = existing?.watch_count ?? 0;
  const currentProgress = existing?.progress_seconds ?? 0;
  
  const newTotalSeconds = currentTotalSeconds + Math.max(0, deltaSeconds);
  const newWatchCount = isNewSession ? currentWatchCount + 1 : currentWatchCount;
  const newProgress = progressSeconds !== undefined 
    ? Math.max(currentProgress, progressSeconds) 
    : currentProgress;

  // Determine if this should be marked as "watched" (threshold: 30 seconds or completed)
  const WATCHED_THRESHOLD_SECONDS = 30;
  const shouldMarkWatched = completed || newTotalSeconds >= WATCHED_THRESHOLD_SECONDS;

  const { error } = await supabase
    .from("user_video_state")
    .upsert({
      user_id: user.id,
      video_id: videoId,
      total_watched_seconds: newTotalSeconds,
      watch_count: newWatchCount,
      progress_seconds: newProgress,
      last_watched_at: now,
      first_watched_at: existing?.first_watched_at ?? now,
      completed: completed || undefined,
      watched: shouldMarkWatched || undefined,
      watched_at: shouldMarkWatched && !existing ? now : undefined,
      updated_at: now,
    }, {
      onConflict: "user_id,video_id",
    });

  if (error) {
    console.error("Log video watch delta error:", error);
    return { error: "Failed to log watch time" };
  }

  return { 
    success: true, 
    totalWatchedSeconds: newTotalSeconds,
    watched: shouldMarkWatched,
  };
}

// Get "continue watching" list - videos with progress but not completed
export async function getContinueWatching(limit = 10) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  const { data: history, error } = await supabase
    .from("user_video_state")
    .select("video_id, progress_seconds, total_watched_seconds, last_watched_at")
    .eq("user_id", user.id)
    .gt("progress_seconds", 0)
    .or("completed.is.null,completed.eq.false")
    .order("last_watched_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    console.error("Continue watching error:", error);
    return { error: "Failed to load continue watching" };
  }

  if (!history?.length) {
    return { success: true, videos: [] };
  }

  // Get video details
  const videoIds = history.map((h) => h.video_id);
  const { data: videos } = await supabase
    .from("youtube_videos")
    .select("video_id, title, thumbnail_url, thumbnail_high_url, duration, channel_id")
    .in("video_id", videoIds);

  // Get channel info
  const channelIds = [...new Set(videos?.map((v) => v.channel_id) || [])];
  const { data: channels } = await supabase
    .from("youtube_channels")
    .select("channel_id, title, thumbnail_url")
    .in("channel_id", channelIds);

  const videoMap = new Map(videos?.map((v) => [v.video_id, v]) || []);
  const channelMap = new Map(channels?.map((c) => [c.channel_id, c]) || []);

  const combined = history.map((h) => {
    const video = videoMap.get(h.video_id);
    const channel = video ? channelMap.get(video.channel_id) : null;
    return {
      ...h,
      video: video ? {
        ...video,
        youtube_channels: channel || null,
      } : null,
    };
  }).filter((h) => h.video !== null);

  return { success: true, videos: combined };
}

// ============================================
// Watch Later Actions
// ============================================

export async function getWatchLater(limit = 50) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  const { data: watchLater, error } = await supabase
    .from("user_watch_later")
    .select("video_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Get watch later error:", error);
    return { error: "Failed to load watch later" };
  }

  if (!watchLater?.length) {
    return { success: true, videos: [] };
  }

  // Get video details
  const videoIds = watchLater.map((w) => w.video_id);
  const { data: videos } = await supabase
    .from("youtube_videos")
    .select("video_id, title, thumbnail_url, thumbnail_high_url, duration, channel_id, published_at, view_count")
    .in("video_id", videoIds);

  // Get channel info
  const channelIds = [...new Set(videos?.map((v) => v.channel_id) || [])];
  const { data: channels } = await supabase
    .from("youtube_channels")
    .select("channel_id, title, thumbnail_url")
    .in("channel_id", channelIds);

  const videoMap = new Map(videos?.map((v) => [v.video_id, v]) || []);
  const channelMap = new Map(channels?.map((c) => [c.channel_id, c]) || []);

  // Combine the data, preserving watch later order
  const combined = watchLater.map((w) => {
    const video = videoMap.get(w.video_id);
    const channel = video ? channelMap.get(video.channel_id) : null;
    return {
      video_id: w.video_id,
      added_at: w.created_at,
      video: video ? {
        ...video,
        youtube_channels: channel || null,
      } : null,
    };
  }).filter((w) => w.video !== null);

  return { success: true, videos: combined };
}

export async function addToWatchLater(videoId: string) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  const { error } = await supabase
    .from("user_watch_later")
    .insert({
      user_id: user.id,
      video_id: videoId,
    });

  if (error) {
    // Check if it's a unique constraint violation (already added)
    if (error.code === "23505") {
      return { success: true, alreadyExists: true };
    }
    console.error("Add to watch later error:", error);
    return { error: "Failed to add to watch later" };
  }

  revalidatePath("/watch-later");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function removeFromWatchLater(videoId: string) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  const { error } = await supabase
    .from("user_watch_later")
    .delete()
    .eq("user_id", user.id)
    .eq("video_id", videoId);

  if (error) {
    console.error("Remove from watch later error:", error);
    return { error: "Failed to remove from watch later" };
  }

  revalidatePath("/watch-later");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function getWatchLaterStatus(videoIds: string[]) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  if (!videoIds.length) {
    return { success: true, watchLaterMap: {} };
  }

  const { data, error } = await supabase
    .from("user_watch_later")
    .select("video_id")
    .eq("user_id", user.id)
    .in("video_id", videoIds);

  if (error) {
    console.error("Get watch later status error:", error);
    return { error: "Failed to get watch later status" };
  }

  // Create a map of video_id to boolean
  const watchLaterMap: Record<string, boolean> = {};
  videoIds.forEach((id) => {
    watchLaterMap[id] = false;
  });
  data?.forEach((item) => {
    watchLaterMap[item.video_id] = true;
  });

  return { success: true, watchLaterMap };
}

export async function toggleWatchLater(videoId: string) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in" };
  }

  // Check if already in watch later
  const { data: existing } = await supabase
    .from("user_watch_later")
    .select("id")
    .eq("user_id", user.id)
    .eq("video_id", videoId)
    .single();

  if (existing) {
    // Remove from watch later
    const { error } = await supabase
      .from("user_watch_later")
      .delete()
      .eq("user_id", user.id)
      .eq("video_id", videoId);

    if (error) {
      console.error("Toggle watch later (remove) error:", error);
      return { error: "Failed to update watch later" };
    }

    revalidatePath("/watch-later");
    return { success: true, inWatchLater: false };
  } else {
    // Add to watch later
    const { error } = await supabase
      .from("user_watch_later")
      .insert({
        user_id: user.id,
        video_id: videoId,
      });

    if (error) {
      console.error("Toggle watch later (add) error:", error);
      return { error: "Failed to update watch later" };
    }

    revalidatePath("/watch-later");
    return { success: true, inWatchLater: true };
  }
}

