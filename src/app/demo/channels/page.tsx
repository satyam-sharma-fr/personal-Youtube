import Link from "next/link";
import { createAdminClient, DEMO_USER_ID, MOCK_DEMO_CHANNELS, MOCK_DEMO_CATEGORIES } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tv, Users, Video, ArrowRight, Eye } from "lucide-react";

function formatCount(count: string | null): string {
  if (!count) return "N/A";
  const num = parseInt(count, 10);
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default async function DemoChannelsPage() {
  const supabase = createAdminClient();

  let channels: {
    channel_id: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    subscriber_count: string | null;
    video_count: string | null;
    custom_url: string | null;
    categories: string[];
  }[];

  if (!supabase) {
    // Use mock data when admin client isn't configured
    channels = MOCK_DEMO_CHANNELS.map((ch, i) => ({
      ...ch,
      categories: i < 2 ? [MOCK_DEMO_CATEGORIES[0].name] : [MOCK_DEMO_CATEGORIES[1].name],
    }));
  } else {
    // Get demo user's subscribed channels with full channel info
    const { data: channelsData } = await supabase.rpc("get_user_channels", {
      p_user_id: DEMO_USER_ID,
    });

    // Get demo user's categories
    const { data: categories } = await supabase
      .from("channel_categories")
      .select("*")
      .eq("user_id", DEMO_USER_ID)
      .order("name", { ascending: true });

    // Get channel-category assignments
    const { data: channelCategoryAssignments } = await supabase
      .from("channel_category_channels")
      .select("channel_id, category_id")
      .eq("user_id", DEMO_USER_ID);

    // Build a map of channel_id -> category names
    const channelCategoriesMap = new Map<string, string[]>();
    for (const assignment of channelCategoryAssignments || []) {
      const cat = categories?.find((c) => c.id === assignment.category_id);
      if (cat) {
        const existing = channelCategoriesMap.get(assignment.channel_id) || [];
        channelCategoriesMap.set(assignment.channel_id, [...existing, cat.name]);
      }
    }

    channels = channelsData?.map((ch) => ({
      channel_id: ch.channel_id,
      title: ch.title,
      description: ch.description,
      thumbnail_url: ch.thumbnail_url,
      subscriber_count: ch.subscriber_count,
      video_count: ch.video_count,
      custom_url: ch.custom_url,
      categories: channelCategoriesMap.get(ch.channel_id) || [],
    })) || [];

    // Fall back to mock data if no channels in DB
    if (channels.length === 0) {
      channels = MOCK_DEMO_CHANNELS.map((ch, i) => ({
        ...ch,
        categories: i < 2 ? [MOCK_DEMO_CATEGORIES[0].name] : [MOCK_DEMO_CATEGORIES[1].name],
      }));
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Eye className="w-6 h-6 text-accent" />
            Demo Channels
          </h1>
          <p className="text-muted-foreground mt-1">
            {channels.length} curated channel{channels.length !== 1 ? "s" : ""} in this demo
          </p>
        </div>
        <Link href="/signup">
          <Button>
            Add Your Own Channels
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Channels Grid */}
      {channels.length > 0 ? (
        <div className="grid gap-4">
          {channels.map((channel, index) => (
            <Card 
              key={channel.channel_id}
              className="overflow-hidden hover:border-primary/30 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Link href={`/demo?channel=${channel.channel_id}`}>
                    <Avatar className="h-16 w-16 rounded-xl cursor-pointer hover:opacity-80 transition-opacity">
                      <AvatarImage src={channel.thumbnail_url || undefined} alt={channel.title} />
                      <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-xl">
                        {channel.title?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link href={`/demo?channel=${channel.channel_id}`}>
                          <h3 className="font-semibold text-lg hover:text-primary transition-colors cursor-pointer">
                            {channel.title}
                          </h3>
                        </Link>
                        {channel.custom_url && (
                          <p className="text-sm text-muted-foreground">
                            {channel.custom_url}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="bg-accent/20 text-accent">
                        Demo
                      </Badge>
                    </div>

                    {channel.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {channel.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-3">
                      {channel.subscriber_count && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{formatCount(channel.subscriber_count)} subscribers</span>
                        </div>
                      )}
                      {channel.video_count && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Video className="w-4 h-4" />
                          <span>{formatCount(channel.video_count)} videos</span>
                        </div>
                      )}
                    </div>

                    {/* Categories */}
                    {channel.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {channel.categories.map((cat) => (
                          <Badge key={cat} variant="outline" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Tv className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No demo channels</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            The demo account doesn't have any channels set up yet.
          </p>
          <Link href="/signup">
            <Button>Create Your Own Account</Button>
          </Link>
        </div>
      )}

      {/* CTA at bottom */}
      {channels.length > 0 && (
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-border/50 text-center">
          <h3 className="text-lg font-semibold mb-2">Like what you see?</h3>
          <p className="text-muted-foreground mb-4">
            Create your own account to add your favorite channels and build a personalized feed.
          </p>
          <Link href="/signup">
            <Button size="lg">
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

