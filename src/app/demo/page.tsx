import Link from "next/link";
import { createAdminClient, DEMO_USER_ID, MOCK_DEMO_CHANNELS, MOCK_DEMO_CATEGORIES, MOCK_DEMO_VIDEOS } from "@/lib/supabase/admin";
import { DemoVideoFeed } from "@/components/demo/demo-video-feed";
import { Button } from "@/components/ui/button";
import { Tv, Tag, X } from "lucide-react";

interface DemoFeedPageProps {
  searchParams: Promise<{ channel?: string; category?: string }>;
}

export default async function DemoFeedPage({ searchParams }: DemoFeedPageProps) {
  const { channel: selectedChannelId, category: selectedCategoryId } = await searchParams;
  const supabase = createAdminClient();

  // Use mock data if admin client isn't configured
  if (!supabase) {
    const mockChannelIds = MOCK_DEMO_CHANNELS.map((c) => c.channel_id);
    const validChannelId = selectedChannelId && mockChannelIds.includes(selectedChannelId) 
      ? selectedChannelId 
      : null;

    let videos = MOCK_DEMO_VIDEOS;
    let filterTitle = "Demo Feed";

    if (validChannelId) {
      videos = MOCK_DEMO_VIDEOS.filter((v) => v.channel_id === validChannelId);
      const channel = MOCK_DEMO_CHANNELS.find((c) => c.channel_id === validChannelId);
      filterTitle = channel?.title || "Channel";
    }

    const formattedVideos = videos.map((v) => ({
      ...v,
      youtube_channels: {
        title: v.channel_title,
        thumbnail_url: v.channel_thumbnail_url,
        custom_url: v.channel_custom_url,
      },
    }));

    return (
      <div>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{filterTitle}</h1>
              <p className="text-muted-foreground mt-1">
                {validChannelId ? (
                  <span className="flex items-center gap-2">
                    Showing videos from this channel
                    <Link href="/demo">
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        <X className="w-3 h-3 mr-1" />
                        Clear filter
                      </Button>
                    </Link>
                  </span>
                ) : (
                  <>Browse {mockChannelIds.length} curated channels in this demo</>
                )}
              </p>
            </div>
          </div>
        </div>
        <DemoVideoFeed videos={formattedVideos} />
      </div>
    );
  }

  // Get demo user's subscribed channel IDs
  const { data: subscriptions } = await supabase
    .from("channel_subscriptions")
    .select(`
      channel_id,
      youtube_channels (
        channel_id,
        title,
        thumbnail_url
      )
    `)
    .eq("user_id", DEMO_USER_ID);

  // Get demo user's categories
  const { data: categories } = await supabase
    .from("channel_categories")
    .select("*")
    .eq("user_id", DEMO_USER_ID)
    .order("name", { ascending: true });

  let channelIds = subscriptions?.map((s) => s.channel_id) || [];

  // If no channels in DB, fall back to mock data
  if (channelIds.length === 0) {
    const mockChannelIds = MOCK_DEMO_CHANNELS.map((c) => c.channel_id);
    const validChannelId = selectedChannelId && mockChannelIds.includes(selectedChannelId) 
      ? selectedChannelId 
      : null;

    let videos = MOCK_DEMO_VIDEOS;
    let filterTitle = "Demo Feed";

    if (validChannelId) {
      videos = MOCK_DEMO_VIDEOS.filter((v) => v.channel_id === validChannelId);
      const channel = MOCK_DEMO_CHANNELS.find((c) => c.channel_id === validChannelId);
      filterTitle = channel?.title || "Channel";
    }

    const formattedVideos = videos.map((v) => ({
      ...v,
      youtube_channels: {
        title: v.channel_title,
        thumbnail_url: v.channel_thumbnail_url,
        custom_url: v.channel_custom_url,
      },
    }));

    return (
      <div>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{filterTitle}</h1>
              <p className="text-muted-foreground mt-1">
                {validChannelId ? (
                  <span className="flex items-center gap-2">
                    Showing videos from this channel
                    <Link href="/demo">
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        <X className="w-3 h-3 mr-1" />
                        Clear filter
                      </Button>
                    </Link>
                  </span>
                ) : (
                  <>Browse {mockChannelIds.length} curated channels in this demo</>
                )}
              </p>
            </div>
          </div>
        </div>
        <DemoVideoFeed videos={formattedVideos} />
      </div>
    );
  }

  // Validate selectedChannelId is in demo user's subscriptions
  const validChannelId = selectedChannelId && channelIds.includes(selectedChannelId) 
    ? selectedChannelId 
    : null;

  // Validate selectedCategoryId is one of demo user's categories
  const validCategoryId = selectedCategoryId && categories?.some((c) => c.id === selectedCategoryId)
    ? selectedCategoryId
    : null;

  // Get channel info for header if filtering by channel
  let selectedChannel: { title: string; thumbnail_url: string | null } | null = null;
  if (validChannelId) {
    const sub = subscriptions?.find((s) => s.channel_id === validChannelId);
    if (sub?.youtube_channels) {
      const ch = sub.youtube_channels as unknown as { title: string; thumbnail_url: string | null };
      selectedChannel = { title: ch.title, thumbnail_url: ch.thumbnail_url };
    }
  }

  // Get category info for header if filtering by category
  let selectedCategory: { id: string; name: string } | null = null;
  if (validCategoryId) {
    const cat = categories?.find((c) => c.id === validCategoryId);
    if (cat) {
      selectedCategory = { id: cat.id, name: cat.name };
    }
  }

  // Determine which channels to fetch videos from
  let feedChannelIds: string[];
  
  if (validChannelId) {
    feedChannelIds = [validChannelId];
  } else if (validCategoryId) {
    // Filter by category - get channels in this category
    const { data: categoryChannels } = await supabase
      .from("channel_category_channels")
      .select("channel_id")
      .eq("user_id", DEMO_USER_ID)
      .eq("category_id", validCategoryId);

    const categoryChannelIds = categoryChannels?.map((c) => c.channel_id) || [];
    feedChannelIds = categoryChannelIds.filter((id) => channelIds.includes(id));
    
    if (feedChannelIds.length === 0) {
      return (
        <div>
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Tag className="w-6 h-6" />
                  {selectedCategory?.name}
                </h1>
                <p className="text-muted-foreground mt-1">
                  <span className="flex items-center gap-2">
                    No channels in this category
                    <Link href="/demo">
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        <X className="w-3 h-3 mr-1" />
                        Clear filter
                      </Button>
                    </Link>
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Tag className="w-12 h-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">No channels in this category</h2>
            <p className="text-muted-foreground mb-4">
              This demo category is empty.
            </p>
          </div>
        </div>
      );
    }
  } else {
    feedChannelIds = channelIds;
  }

  // Get videos from selected channels using RPC
  const { data: videosData } = await supabase.rpc("get_user_feed", {
    p_user_id: DEMO_USER_ID,
    p_channel_ids: feedChannelIds,
    p_limit: 20,
  });

  // Transform the data to match expected format
  const videos = videosData?.map((v) => ({
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

  // Determine filter display
  const isFiltering = selectedChannel || selectedCategory;
  const filterTitle = selectedChannel 
    ? selectedChannel.title 
    : selectedCategory 
      ? selectedCategory.name 
      : "Demo Feed";

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {selectedCategory && <Tag className="w-6 h-6" />}
              {filterTitle}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isFiltering ? (
                <span className="flex items-center gap-2">
                  {selectedChannel 
                    ? "Showing videos from this channel" 
                    : `Showing videos from ${feedChannelIds.length} channel${feedChannelIds.length !== 1 ? "s" : ""} in this category`}
                  <Link href="/demo">
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      <X className="w-3 h-3 mr-1" />
                      Clear filter
                    </Button>
                  </Link>
                </span>
              ) : (
                <>Browse {channelIds.length} curated channel{channelIds.length !== 1 ? "s" : ""} in this demo</>
              )}
            </p>
          </div>
        </div>
      </div>

      <DemoVideoFeed videos={videos} />
    </div>
  );
}

