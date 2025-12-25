const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = "https://www.googleapis.com/youtube/v3";

export interface YouTubeChannelData {
  channelId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: string;
  videoCount: string;
  uploadsPlaylistId: string;
  customUrl?: string;
}

export interface YouTubeVideoData {
  videoId: string;
  channelId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  thumbnailHighUrl: string;
  publishedAt: string;
  duration?: string;
  viewCount?: string;
  likeCount?: string;
}

/**
 * Parse channel input (URL, handle, or ID)
 */
export function parseChannelInput(input: string): { type: "id" | "handle" | "username"; value: string } | null {
  const trimmed = input.trim();
  
  // YouTube channel URL patterns
  const patterns = {
    channelId: /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
    handle: /youtube\.com\/@([a-zA-Z0-9_.-]+)/,
    customUrl: /youtube\.com\/c\/([a-zA-Z0-9_-]+)/,
    user: /youtube\.com\/user\/([a-zA-Z0-9_-]+)/,
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    const match = trimmed.match(pattern);
    if (match) {
      if (type === "channelId") return { type: "id", value: match[1] };
      if (type === "handle") return { type: "handle", value: match[1] };
      return { type: "username", value: match[1] };
    }
  }

  // Direct handle (starts with @)
  if (trimmed.startsWith("@")) {
    return { type: "handle", value: trimmed.slice(1) };
  }

  // Channel ID (starts with UC and is 24 chars)
  if (trimmed.startsWith("UC") && trimmed.length === 24) {
    return { type: "id", value: trimmed };
  }

  // Assume it's a handle/username
  return { type: "handle", value: trimmed };
}

/**
 * Get channel info by ID
 */
export async function getChannelById(channelId: string): Promise<YouTubeChannelData | null> {
  if (!YOUTUBE_API_KEY) {
    throw new Error("YouTube API key is not configured");
  }

  const res = await fetch(
    `${BASE_URL}/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
  );

  if (!res.ok) {
    throw new Error(`YouTube API error: ${res.status}`);
  }

  const data = await res.json();

  if (!data.items?.[0]) return null;

  const channel = data.items[0];
  return {
    channelId: channel.id,
    title: channel.snippet.title,
    description: channel.snippet.description,
    thumbnailUrl: channel.snippet.thumbnails.medium?.url || channel.snippet.thumbnails.default?.url,
    subscriberCount: channel.statistics.subscriberCount,
    videoCount: channel.statistics.videoCount,
    uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads,
    customUrl: channel.snippet.customUrl,
  };
}

/**
 * Get channel info by handle (@username)
 */
export async function getChannelByHandle(handle: string): Promise<YouTubeChannelData | null> {
  if (!YOUTUBE_API_KEY) {
    throw new Error("YouTube API key is not configured");
  }

  const cleanHandle = handle.replace("@", "");
  const res = await fetch(
    `${BASE_URL}/channels?part=snippet,statistics,contentDetails&forHandle=${cleanHandle}&key=${YOUTUBE_API_KEY}`
  );

  if (!res.ok) {
    throw new Error(`YouTube API error: ${res.status}`);
  }

  const data = await res.json();

  if (!data.items?.[0]) return null;

  const channel = data.items[0];
  return {
    channelId: channel.id,
    title: channel.snippet.title,
    description: channel.snippet.description,
    thumbnailUrl: channel.snippet.thumbnails.medium?.url || channel.snippet.thumbnails.default?.url,
    subscriberCount: channel.statistics.subscriberCount,
    videoCount: channel.statistics.videoCount,
    uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads,
    customUrl: channel.snippet.customUrl,
  };
}

/**
 * Search for channels by query
 */
export async function searchChannels(query: string, maxResults = 10): Promise<YouTubeChannelData[]> {
  if (!YOUTUBE_API_KEY) {
    throw new Error("YouTube API key is not configured");
  }

  // First search for channels
  const searchRes = await fetch(
    `${BASE_URL}/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
  );

  if (!searchRes.ok) {
    throw new Error(`YouTube API error: ${searchRes.status}`);
  }

  const searchData = await searchRes.json();
  
  if (!searchData.items?.length) return [];

  // Get full channel details
  const channelIds = searchData.items.map((item: { id: { channelId: string } }) => item.id.channelId).join(",");
  const channelsRes = await fetch(
    `${BASE_URL}/channels?part=snippet,statistics,contentDetails&id=${channelIds}&key=${YOUTUBE_API_KEY}`
  );

  if (!channelsRes.ok) {
    throw new Error(`YouTube API error: ${channelsRes.status}`);
  }

  const channelsData = await channelsRes.json();

  return channelsData.items?.map((channel: {
    id: string;
    snippet: {
      title: string;
      description: string;
      thumbnails: { medium?: { url: string }; default?: { url: string } };
      customUrl?: string;
    };
    statistics: { subscriberCount: string; videoCount: string };
    contentDetails: { relatedPlaylists: { uploads: string } };
  }) => ({
    channelId: channel.id,
    title: channel.snippet.title,
    description: channel.snippet.description,
    thumbnailUrl: channel.snippet.thumbnails.medium?.url || channel.snippet.thumbnails.default?.url,
    subscriberCount: channel.statistics.subscriberCount,
    videoCount: channel.statistics.videoCount,
    uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads,
    customUrl: channel.snippet.customUrl,
  })) || [];
}

/**
 * Get videos from a channel's uploads playlist
 */
export async function getChannelVideos(uploadsPlaylistId: string, maxResults = 20): Promise<YouTubeVideoData[]> {
  if (!YOUTUBE_API_KEY) {
    throw new Error("YouTube API key is not configured");
  }

  // Get playlist items
  const playlistRes = await fetch(
    `${BASE_URL}/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
  );

  if (!playlistRes.ok) {
    throw new Error(`YouTube API error: ${playlistRes.status}`);
  }

  const playlistData = await playlistRes.json();

  if (!playlistData.items?.length) return [];

  // Get video details (for duration, view count, etc.)
  const videoIds = playlistData.items
    .map((item: { contentDetails: { videoId: string } }) => item.contentDetails.videoId)
    .join(",");

  const videosRes = await fetch(
    `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
  );

  if (!videosRes.ok) {
    throw new Error(`YouTube API error: ${videosRes.status}`);
  }

  const videosData = await videosRes.json();

  return videosData.items?.map((video: {
    id: string;
    snippet: {
      channelId: string;
      title: string;
      description: string;
      thumbnails: { medium?: { url: string }; high?: { url: string }; default?: { url: string } };
      publishedAt: string;
    };
    contentDetails: { duration: string };
    statistics: { viewCount: string; likeCount: string };
  }) => ({
    videoId: video.id,
    channelId: video.snippet.channelId,
    title: video.snippet.title,
    description: video.snippet.description,
    thumbnailUrl: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
    thumbnailHighUrl: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url,
    publishedAt: video.snippet.publishedAt,
    duration: video.contentDetails.duration,
    viewCount: video.statistics.viewCount,
    likeCount: video.statistics.likeCount,
  })) || [];
}

/**
 * Convert ISO 8601 duration to readable format
 */
export function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";

  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Format view count to readable format
 */
export function formatViewCount(count: string | number): string {
  const num = typeof count === "string" ? parseInt(count) : count;
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M views`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K views`;
  }
  return `${num} views`;
}

/**
 * Format subscriber count
 */
export function formatSubscriberCount(count: string | number): string {
  const num = typeof count === "string" ? parseInt(count) : count;
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return `${num}`;
}

