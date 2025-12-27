import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { VideoFeed } from "@/components/videos/video-feed";
import { CategoryFilter } from "@/components/dashboard/category-filter";
import { Button } from "@/components/ui/button";
import { Plus, Tv, X, Tag, Inbox } from "lucide-react";

interface DashboardPageProps {
  searchParams: Promise<{ channel?: string; category?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { channel: selectedChannelId, category: selectedCategoryId } = await searchParams;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Get user's subscribed channel IDs
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
    .eq("user_id", user.id);

  // Get user's categories
  const { data: categories } = await supabase
    .from("channel_categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  const channelIds = subscriptions?.map((s) => s.channel_id) || [];

  // If no channels, show empty state
  if (channelIds.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
            <Tv className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Your feed is empty</h1>
          <p className="text-muted-foreground mb-8 max-w-md">
            Add some channels to start seeing videos from creators you love, without any distractions.
          </p>
          <Link href="/channels">
            <Button size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Channel
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Validate selectedChannelId is in user's subscriptions
  const validChannelId = selectedChannelId && channelIds.includes(selectedChannelId) 
    ? selectedChannelId 
    : null;

  // Validate selectedCategoryId is one of user's categories (or "uncategorized")
  const isUncategorized = selectedCategoryId === "uncategorized";
  const validCategoryId = selectedCategoryId && (isUncategorized || categories?.some((c) => c.id === selectedCategoryId))
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
    if (isUncategorized) {
      selectedCategory = { id: "uncategorized", name: "Uncategorized" };
    } else {
      const cat = categories?.find((c) => c.id === validCategoryId);
      if (cat) {
        selectedCategory = { id: cat.id, name: cat.name };
      }
    }
  }

  // Determine which channels to fetch videos from
  let feedChannelIds: string[];
  
  if (validChannelId) {
    // Filter by specific channel
    feedChannelIds = [validChannelId];
  } else if (validCategoryId) {
    if (isUncategorized) {
      // Filter by uncategorized - get channels NOT in any category
      const { data: allCategorizedChannels } = await supabase
        .from("channel_category_channels")
        .select("channel_id")
        .eq("user_id", user.id);

      const categorizedChannelIds = new Set(allCategorizedChannels?.map((c) => c.channel_id) || []);
      // Get channels that are subscribed but not in any category
      feedChannelIds = channelIds.filter((id) => !categorizedChannelIds.has(id));
      
      if (feedChannelIds.length === 0) {
        // No uncategorized channels
        return (
          <div>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Inbox className="w-6 h-6" />
                    Uncategorized
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    <span className="flex items-center gap-2">
                      No uncategorized channels
                      <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          <X className="w-3 h-3 mr-1" />
                          Clear filter
                        </Button>
                      </Link>
                    </span>
                  </p>
                </div>
                {categories && categories.length > 0 && (
                  <CategoryFilter categories={categories} selectedCategoryId={validCategoryId} />
                )}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Inbox className="w-12 h-12 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-2">All channels are categorized</h2>
              <p className="text-muted-foreground mb-4">
                All your subscribed channels belong to a category.
              </p>
              <Link href="/channels">
                <Button variant="outline">
                  Manage Channels
                </Button>
              </Link>
            </div>
          </div>
        );
      }
    } else {
      // Filter by category - get channels in this category
      const { data: categoryChannels } = await supabase
        .from("channel_category_channels")
        .select("channel_id")
        .eq("user_id", user.id)
        .eq("category_id", validCategoryId);

      const categoryChannelIds = categoryChannels?.map((c) => c.channel_id) || [];
      // Only include channels that are still subscribed
      feedChannelIds = categoryChannelIds.filter((id) => channelIds.includes(id));
      
      if (feedChannelIds.length === 0) {
        // No channels in this category
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
                      <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          <X className="w-3 h-3 mr-1" />
                          Clear filter
                        </Button>
                      </Link>
                    </span>
                  </p>
                </div>
                {categories && categories.length > 0 && (
                  <CategoryFilter categories={categories} selectedCategoryId={validCategoryId} />
                )}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Tag className="w-12 h-12 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-2">No channels in this category</h2>
              <p className="text-muted-foreground mb-4">
                Add channels to the "{selectedCategory?.name}" category to see videos here.
              </p>
              <Link href="/channels">
                <Button variant="outline">
                  Manage Channels
                </Button>
              </Link>
            </div>
          </div>
        );
      }
    }
  } else {
    // All subscribed channels
    feedChannelIds = channelIds;
  }

  // Get videos from selected channels using RPC
  const { data: videosData } = await supabase.rpc("get_user_feed", {
    p_user_id: user.id,
    p_channel_ids: feedChannelIds,
    p_limit: 21,
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

  // Get watched states
  const videoIds = videos.map((v) => v.video_id);
  const { data: watchedStates } = await supabase
    .from("user_video_state")
    .select("video_id, watched, progress_seconds, completed")
    .eq("user_id", user.id)
    .in("video_id", videoIds);

  const watchedMap = new Map(
    watchedStates?.map((s) => [s.video_id, s]) || []
  );

  // Combine videos with watched state
  const hasMore = videos.length > 20;
  const displayVideos = hasMore ? videos.slice(0, 20) : videos;
  
  const videosWithState = displayVideos.map((video) => ({
    ...video,
    watched: watchedMap.get(video.video_id)?.watched || false,
    progress_seconds: watchedMap.get(video.video_id)?.progress_seconds || 0,
    completed: watchedMap.get(video.video_id)?.completed || false,
  }));

  const nextCursor = hasMore && displayVideos.length 
    ? displayVideos[displayVideos.length - 1].published_at 
    : null;

  // Determine filter display
  const isFiltering = selectedChannel || selectedCategory;
  const filterTitle = selectedChannel 
    ? selectedChannel.title 
    : selectedCategory 
      ? selectedCategory.name 
      : "Your Feed";

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {selectedCategory && (isUncategorized ? <Inbox className="w-6 h-6" /> : <Tag className="w-6 h-6" />)}
              {filterTitle}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isFiltering ? (
                <span className="flex items-center gap-2">
                  {selectedChannel 
                    ? "Showing videos from this channel" 
                    : `Showing videos from ${feedChannelIds.length} channel${feedChannelIds.length !== 1 ? "s" : ""} in this category`}
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      <X className="w-3 h-3 mr-1" />
                      Clear filter
                    </Button>
                  </Link>
                </span>
              ) : (
                <>Latest videos from your {channelIds.length} subscribed channel{channelIds.length !== 1 ? "s" : ""}</>
              )}
            </p>
          </div>
          {categories && categories.length > 0 && (
            <CategoryFilter categories={categories} selectedCategoryId={validCategoryId} />
          )}
        </div>
      </div>

      <VideoFeed
        initialVideos={videosWithState}
        initialHasMore={hasMore}
        initialNextCursor={nextCursor}
        channelId={validChannelId || undefined}
        categoryId={validCategoryId || undefined}
      />
    </div>
  );
}
