const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const BASE_URL = "https://www.googleapis.com/youtube/v3";

export interface Channel {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  subscriberCount: string;
  customUrl?: string;
}

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  description: string;
  viewCount?: string;
  duration?: string;
}

export interface SearchResult {
  channels: Channel[];
  nextPageToken?: string;
}

// Get channel info by ID
export async function getChannelById(channelId: string): Promise<Channel | null> {
  if (!YOUTUBE_API_KEY) {
    console.error("YouTube API key not configured");
    return null;
  }

  try {
    const res = await fetch(
      `${BASE_URL}/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );
    const data = await res.json();

    if (!data.items?.[0]) return null;

    const channel = data.items[0];
    return {
      id: channel.id,
      title: channel.snippet.title,
      thumbnail: channel.snippet.thumbnails.medium?.url || channel.snippet.thumbnails.default?.url,
      description: channel.snippet.description,
      subscriberCount: formatSubscriberCount(channel.statistics?.subscriberCount),
      customUrl: channel.snippet.customUrl,
    };
  } catch (error) {
    console.error("Error fetching channel:", error);
    return null;
  }
}

// Get channel by handle (@username)
export async function getChannelByHandle(handle: string): Promise<Channel | null> {
  if (!YOUTUBE_API_KEY) {
    console.error("YouTube API key not configured");
    return null;
  }

  const cleanHandle = handle.replace("@", "");
  
  try {
    const res = await fetch(
      `${BASE_URL}/channels?part=snippet,statistics&forHandle=${cleanHandle}&key=${YOUTUBE_API_KEY}`
    );
    const data = await res.json();

    if (!data.items?.[0]) return null;

    const channel = data.items[0];
    return {
      id: channel.id,
      title: channel.snippet.title,
      thumbnail: channel.snippet.thumbnails.medium?.url || channel.snippet.thumbnails.default?.url,
      description: channel.snippet.description,
      subscriberCount: formatSubscriberCount(channel.statistics?.subscriberCount),
      customUrl: channel.snippet.customUrl,
    };
  } catch (error) {
    console.error("Error fetching channel by handle:", error);
    return null;
  }
}

// Search for channels by name
export async function searchChannels(query: string, maxResults = 10): Promise<Channel[]> {
  if (!YOUTUBE_API_KEY) {
    console.error("YouTube API key not configured");
    return [];
  }

  try {
    // First search for channel IDs
    const searchRes = await fetch(
      `${BASE_URL}/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
    );
    const searchData = await searchRes.json();

    if (!searchData.items?.length) return [];

    // Get full channel details
    const channelIds = searchData.items.map((item: { id: { channelId: string } }) => item.id.channelId).join(",");
    const channelsRes = await fetch(
      `${BASE_URL}/channels?part=snippet,statistics&id=${channelIds}&key=${YOUTUBE_API_KEY}`
    );
    const channelsData = await channelsRes.json();

    return channelsData.items?.map((channel: {
      id: string;
      snippet: {
        title: string;
        thumbnails: { medium?: { url: string }; default?: { url: string } };
        description: string;
        customUrl?: string;
      };
      statistics?: { subscriberCount?: string };
    }) => ({
      id: channel.id,
      title: channel.snippet.title,
      thumbnail: channel.snippet.thumbnails.medium?.url || channel.snippet.thumbnails.default?.url,
      description: channel.snippet.description,
      subscriberCount: formatSubscriberCount(channel.statistics?.subscriberCount),
      customUrl: channel.snippet.customUrl,
    })) || [];
  } catch (error) {
    console.error("Error searching channels:", error);
    return [];
  }
}

// Get videos from a channel
export async function getChannelVideos(channelId: string, maxResults = 12): Promise<Video[]> {
  if (!YOUTUBE_API_KEY) {
    console.error("YouTube API key not configured");
    return [];
  }

  try {
    // First get the uploads playlist
    const channelRes = await fetch(
      `${BASE_URL}/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );
    const channelData = await channelRes.json();

    const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) return [];

    // Get videos from uploads playlist
    const videosRes = await fetch(
      `${BASE_URL}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
    );
    const videosData = await videosRes.json();

    if (!videosData.items?.length) return [];

    // Get video details (for duration and view count)
    const videoIds = videosData.items
      .map((item: { snippet: { resourceId: { videoId: string } } }) => item.snippet.resourceId.videoId)
      .join(",");
    
    const detailsRes = await fetch(
      `${BASE_URL}/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );
    const detailsData = await detailsRes.json();

    const detailsMap = new Map(
      detailsData.items?.map((item: {
        id: string;
        contentDetails?: { duration?: string };
        statistics?: { viewCount?: string };
      }) => [
        item.id,
        {
          duration: formatDuration(item.contentDetails?.duration),
          viewCount: formatViewCount(item.statistics?.viewCount),
        },
      ]) || []
    );

    return videosData.items?.map((item: {
      snippet: {
        resourceId: { videoId: string };
        title: string;
        thumbnails: { medium?: { url: string }; default?: { url: string } };
        channelTitle: string;
        channelId: string;
        publishedAt: string;
        description: string;
      };
    }) => {
      const videoId = item.snippet.resourceId.videoId;
      const details = detailsMap.get(videoId) as { duration?: string; viewCount?: string } | undefined;
      return {
        id: videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        description: item.snippet.description,
        duration: details?.duration,
        viewCount: details?.viewCount,
      };
    }) || [];
  } catch (error) {
    console.error("Error fetching channel videos:", error);
    return [];
  }
}

// Get videos from multiple channels (for feed)
export async function getVideosFromChannels(
  channelIds: string[],
  videosPerChannel = 6
): Promise<Video[]> {
  if (!channelIds.length) return [];

  const allVideos = await Promise.all(
    channelIds.map((id) => getChannelVideos(id, videosPerChannel))
  );

  // Flatten and sort by publish date
  return allVideos
    .flat()
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

// Parse channel input (URL, handle, or ID)
export function parseChannelInput(input: string): { type: "id" | "handle" | "search"; value: string } {
  const trimmed = input.trim();
  
  // YouTube channel URL patterns
  const channelIdPattern = /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/;
  const handlePattern = /youtube\.com\/@([a-zA-Z0-9_.-]+)/;
  const customUrlPattern = /youtube\.com\/c\/([a-zA-Z0-9_-]+)/;
  const userPattern = /youtube\.com\/user\/([a-zA-Z0-9_-]+)/;

  let match = trimmed.match(channelIdPattern);
  if (match) return { type: "id", value: match[1] };

  match = trimmed.match(handlePattern);
  if (match) return { type: "handle", value: match[1] };

  match = trimmed.match(customUrlPattern);
  if (match) return { type: "handle", value: match[1] };

  match = trimmed.match(userPattern);
  if (match) return { type: "handle", value: match[1] };

  // Direct handle (starts with @)
  if (trimmed.startsWith("@")) {
    return { type: "handle", value: trimmed.slice(1) };
  }

  // Looks like a channel ID (starts with UC and is 24 chars)
  if (trimmed.startsWith("UC") && trimmed.length === 24) {
    return { type: "id", value: trimmed };
  }

  // Otherwise treat as search query
  return { type: "search", value: trimmed };
}

// Helper functions
function formatSubscriberCount(count?: string): string {
  if (!count) return "N/A";
  const num = parseInt(count);
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return count;
}

function formatViewCount(count?: string): string {
  if (!count) return "";
  const num = parseInt(count);
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M views`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K views`;
  return `${count} views`;
}

function formatDuration(duration?: string): string {
  if (!duration) return "";
  
  // Parse ISO 8601 duration
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

