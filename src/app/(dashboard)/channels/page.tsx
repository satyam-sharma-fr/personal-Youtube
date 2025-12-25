import { createClient } from "@/lib/supabase/server";
import { AddChannelDialog } from "@/components/channels/add-channel-dialog";
import { ChannelCard } from "@/components/channels/channel-card";
import { CategoryManager } from "@/components/channels/category-manager";
import { Button } from "@/components/ui/button";
import { Tv, Plus } from "lucide-react";

export default async function ChannelsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Get user's profile for subscription tier
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  // Get user's subscribed channels using RPC function
  const { data: channelsData } = await supabase.rpc("get_user_channels", {
    p_user_id: user.id,
  });

  // Get user's categories
  const { data: categories } = await supabase
    .from("channel_categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  // Get channel-category assignments
  const { data: channelCategoryAssignments } = await supabase
    .from("channel_category_channels")
    .select("channel_id, category_id")
    .eq("user_id", user.id);

  // Build a map of channel_id -> category_ids[]
  const channelCategoriesMap = new Map<string, string[]>();
  for (const assignment of channelCategoryAssignments || []) {
    const existing = channelCategoriesMap.get(assignment.channel_id) || [];
    channelCategoriesMap.set(assignment.channel_id, [...existing, assignment.category_id]);
  }

  // Transform the data to match the expected format
  const subscriptions = channelsData?.map((ch) => ({
    id: ch.id,
    channel_id: ch.channel_id,
    category: ch.category,
    created_at: ch.created_at,
    categoryIds: channelCategoriesMap.get(ch.channel_id) || [],
    youtube_channels: ch.title ? {
      channel_id: ch.channel_id,
      title: ch.title,
      description: ch.description,
      thumbnail_url: ch.thumbnail_url,
      subscriber_count: ch.subscriber_count,
      video_count: ch.video_count,
      custom_url: ch.custom_url,
    } : null,
  })) || [];

  const limits = { free: 5, pro: 25, unlimited: Infinity };
  const tier = (profile?.subscription_tier || "free") as keyof typeof limits;
  const limit = limits[tier];
  const channelCount = subscriptions?.length || 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Your Channels</h1>
          <p className="text-muted-foreground mt-1">
            {channelCount} of {limit === Infinity ? "unlimited" : limit} channels
            {tier === "free" && channelCount >= limit && (
              <span className="text-primary ml-2">• Upgrade to add more</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CategoryManager categories={categories || []} />
          <AddChannelDialog>
            <Button disabled={channelCount >= limit && tier === "free"}>
              <Plus className="w-4 h-4 mr-2" />
              Add Channel
            </Button>
          </AddChannelDialog>
        </div>
      </div>

      {/* Channels Grid */}
      {subscriptions && subscriptions.length > 0 ? (
        <div className="grid gap-4">
          {subscriptions.map((subscription, index) => (
            <ChannelCard 
              key={subscription.id} 
              subscription={subscription}
              categories={categories || []}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Tv className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No channels yet</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Add your first channel to start building your distraction-free feed.
          </p>
          <AddChannelDialog>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Channel
            </Button>
          </AddChannelDialog>
        </div>
      )}
    </div>
  );
}
