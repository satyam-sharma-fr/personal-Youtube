import { Suspense } from "react";
import { DemoProvider } from "@/components/demo/demo-context";
import { DemoBanner } from "@/components/demo/demo-banner";
import { DemoNav } from "@/components/demo/demo-nav";
import { DemoSidebar } from "@/components/demo/demo-sidebar";
import { createAdminClient, DEMO_USER_ID, MOCK_DEMO_CHANNELS, MOCK_DEMO_CATEGORIES } from "@/lib/supabase/admin";
import type { SubscribedChannel, SidebarCategory } from "@/components/dashboard/dashboard-shell";

export const metadata = {
  title: "Demo | FocusTube",
  description: "Experience FocusTube with curated channels - no signup required",
};

export default async function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createAdminClient();

  let channels: SubscribedChannel[];
  let categories: SidebarCategory[];

  if (supabase) {
    // Fetch demo user's subscribed channels from database
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
      .eq("user_id", DEMO_USER_ID)
      .order("created_at", { ascending: false });

    // Transform to simple channel list
    channels = (subscriptions || [])
      .filter((sub) => sub.youtube_channels)
      .map((sub) => ({
        channel_id: (sub.youtube_channels as unknown as { channel_id: string }).channel_id,
        title: (sub.youtube_channels as unknown as { title: string }).title,
        thumbnail_url: (sub.youtube_channels as unknown as { thumbnail_url: string | null }).thumbnail_url,
      }));

    // Fetch demo user's categories
    const { data: categoriesData } = await supabase
      .from("channel_categories")
      .select("id, name")
      .eq("user_id", DEMO_USER_ID)
      .order("name", { ascending: true });

    categories = (categoriesData || []).map((cat) => ({
      id: cat.id,
      name: cat.name,
    }));

    // If no channels found in DB, fall back to mock data
    if (channels.length === 0) {
      channels = MOCK_DEMO_CHANNELS.map((ch) => ({
        channel_id: ch.channel_id,
        title: ch.title,
        thumbnail_url: ch.thumbnail_url,
      }));
      categories = MOCK_DEMO_CATEGORIES;
    }
  } else {
    // Use mock data when admin client is not configured
    channels = MOCK_DEMO_CHANNELS.map((ch) => ({
      channel_id: ch.channel_id,
      title: ch.title,
      thumbnail_url: ch.thumbnail_url,
    }));
    categories = MOCK_DEMO_CATEGORIES;
  }

  return (
    <DemoProvider demoUserId={DEMO_USER_ID}>
      <div className="min-h-screen bg-background">
        <DemoBanner />
        <DemoNav />
        <div className="flex">
          <Suspense fallback={<div className="hidden md:block w-64 border-r border-border/50 bg-sidebar" />}>
            <DemoSidebar channels={channels} categories={categories} />
          </Suspense>
          <main className="flex-1 ml-0 md:ml-64 pt-24 transition-[margin] duration-200">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </DemoProvider>
  );
}

