import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { VideoFeed } from "@/components/videos/video-feed";
import { Button } from "@/components/ui/button";
import { Plus, Tv } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Get user's subscribed channel IDs
  const { data: subscriptions } = await supabase
    .from("channel_subscriptions")
    .select("channel_id")
    .eq("user_id", user.id);

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

  // Get videos from subscribed channels using RPC
  const { data: videosData } = await supabase.rpc("get_user_feed", {
    p_user_id: user.id,
    p_channel_ids: channelIds,
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Your Feed</h1>
        <p className="text-muted-foreground mt-1">
          Latest videos from your {channelIds.length} subscribed channel{channelIds.length !== 1 ? "s" : ""}
        </p>
      </div>

      <VideoFeed
        initialVideos={videosWithState}
        initialHasMore={hasMore}
        initialNextCursor={nextCursor}
      />
    </div>
  );
}

