import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardShell, ChannelsProvider, CategoriesProvider, type SubscribedChannel, type SidebarCategory } from "@/components/dashboard/dashboard-shell";
import { WatchTimeProvider, LimitReachedModal } from "@/components/watch-timer";
import { ensureDefaultCategories } from "@/app/actions/categories";

// Get today's date in YYYY-MM-DD format for a given timezone
function getLocalDate(timezone: string = "UTC"): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile with watch time settings (including timezone)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, daily_watch_limit_minutes, watch_limit_enabled, time_zone")
    .eq("id", user.id)
    .single();

  // Fetch today's watch session using user's local timezone
  const userTimezone = profile?.time_zone || "UTC";
  const today = getLocalDate(userTimezone);
  const { data: watchSession } = await supabase
    .from("daily_watch_sessions")
    .select("watched_seconds")
    .eq("user_id", user.id)
    .eq("date", today)
    .single();

  // Prepare watch time initial data
  const watchTimeData = {
    dailyLimitMinutes: profile?.daily_watch_limit_minutes ?? 60,
    isLimitEnabled: profile?.watch_limit_enabled ?? false,
    todayWatchedSeconds: watchSession?.watched_seconds ?? 0,
  };

  // Fetch subscribed channels for sidebar
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
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Transform to simple channel list
  const channels: SubscribedChannel[] = (subscriptions || [])
    .filter((sub) => sub.youtube_channels)
    .map((sub) => ({
      channel_id: (sub.youtube_channels as unknown as { channel_id: string }).channel_id,
      title: (sub.youtube_channels as unknown as { title: string }).title,
      thumbnail_url: (sub.youtube_channels as unknown as { thumbnail_url: string | null }).thumbnail_url,
    }));

  // Ensure default categories exist for this user (idempotent)
  await ensureDefaultCategories();

  // Fetch user's categories for sidebar (including image_url for home page)
  const { data: categoriesData } = await supabase
    .from("channel_categories")
    .select("id, name, image_url")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  const categories: SidebarCategory[] = (categoriesData || []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    image_url: cat.image_url,
  }));

  return (
    <DashboardShell channels={channels} categories={categories}>
      <ChannelsProvider channels={channels}>
        <CategoriesProvider categories={categories}>
          <WatchTimeProvider initialData={watchTimeData}>
            <div className="min-h-screen bg-background">
              <DashboardNav user={user} profile={profile} />
              <div className="flex">
                <DashboardSidebar channels={channels} categories={categories} />
                <main className="flex-1 ml-0 md:ml-[var(--sidebar-width)] pt-16 transition-[margin] duration-200">
                  <div className="p-6">{children}</div>
                </main>
              </div>
            </div>
            <LimitReachedModal />
          </WatchTimeProvider>
        </CategoriesProvider>
      </ChannelsProvider>
    </DashboardShell>
  );
}
