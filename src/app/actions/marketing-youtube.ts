"use server";

import {
  searchChannels as searchYouTubeChannels,
  getChannelById,
  getChannelVideos,
  type YouTubeChannelData,
  type YouTubeVideoData,
} from "@/lib/youtube";

/**
 * Public server action to search YouTube channels (no auth required).
 * Used by marketing pages.
 */
export async function searchChannelsPublic(
  query: string
): Promise<{ success?: boolean; channels?: YouTubeChannelData[]; error?: string }> {
  if (!query || query.trim().length < 2) {
    return { success: true, channels: [] };
  }

  try {
    const results = await searchYouTubeChannels(query.trim(), 10);
    return { success: true, channels: results };
  } catch (error) {
    console.error("Public channel search error:", error);
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("YouTube API key is not configured")) {
      return { error: "YouTube API is not configured" };
    }
    return { error: "Failed to search channels" };
  }
}

/**
 * Public server action to get latest videos for a single channel.
 * Returns up to `maxVideos` (default 3) most recent uploads.
 */
export async function getLatestVideosForChannelPublic(
  channelId: string,
  maxVideos = 3
): Promise<{ success?: boolean; videos?: YouTubeVideoData[]; error?: string }> {
  if (!channelId) {
    return { error: "Channel ID is required" };
  }

  try {
    // Get channel info to retrieve uploads playlist
    const channel = await getChannelById(channelId);
    if (!channel) {
      return { error: "Channel not found" };
    }

    const videos = await getChannelVideos(channel.uploadsPlaylistId, maxVideos);
    return { success: true, videos };
  } catch (error) {
    console.error("Get latest videos error:", error);
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("YouTube API key is not configured")) {
      return { error: "YouTube API is not configured" };
    }
    return { error: "Failed to fetch videos" };
  }
}

/**
 * Public server action to get latest videos for multiple channels at once.
 * Returns up to `perChannel` videos per channel (default 3).
 */
export async function getLatestVideosForChannelsPublic(
  channelIds: string[],
  perChannel = 3
): Promise<{
  success?: boolean;
  videosByChannel?: Record<string, YouTubeVideoData[]>;
  error?: string;
}> {
  if (!channelIds || channelIds.length === 0) {
    return { success: true, videosByChannel: {} };
  }

  try {
    const results: Record<string, YouTubeVideoData[]> = {};

    // Fetch videos for each channel in parallel
    await Promise.all(
      channelIds.map(async (channelId) => {
        try {
          const channel = await getChannelById(channelId);
          if (channel) {
            const videos = await getChannelVideos(channel.uploadsPlaylistId, perChannel);
            results[channelId] = videos;
          } else {
            results[channelId] = [];
          }
        } catch {
          results[channelId] = [];
        }
      })
    );

    return { success: true, videosByChannel: results };
  } catch (error) {
    console.error("Get latest videos for channels error:", error);
    return { error: "Failed to fetch videos" };
  }
}

