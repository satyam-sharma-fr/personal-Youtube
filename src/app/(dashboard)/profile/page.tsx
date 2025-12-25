import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Mail, User, Tag, Calendar, Tv } from "lucide-react";
import { WatchTimeSettings, WatchStatsCard } from "@/components/watch-timer";
import { CategoryManager } from "@/components/channels/category-manager";

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

export default async function ProfilePage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

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

  const { count: channelCount } = await supabase
    .from("channel_subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Fetch user's categories
  const { data: categories } = await supabase
    .from("channel_categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Your account and watch preferences</p>
      </div>

      {/* Profile Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Account
          </CardTitle>
          <CardDescription>Your profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "User"} />
              <AvatarFallback className="text-xl bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-xl">{profile?.full_name || "User"}</h3>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Member since
              </p>
              <p className="font-medium">
                {new Date(profile?.created_at || user.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Tv className="w-4 h-4" />
                Channels
              </p>
              <p className="font-medium">{channelCount || 0} subscribed</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Tag className="w-4 h-4" />
                Categories
              </p>
              <p className="font-medium">{categories?.length || 0} created</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Categories
          </CardTitle>
          <CardDescription>
            Organize your channels into categories for focused viewing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                You have <span className="font-medium text-foreground">{categories?.length || 0}</span> categories
              </p>
            </div>
            <CategoryManager categories={categories || []} />
          </div>
          
          {/* Show existing categories */}
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-sm"
                >
                  <Tag className="w-3 h-3 text-muted-foreground" />
                  {category.name}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Watch Time Limits Section */}
      <WatchTimeSettings
        initialEnabled={profile?.watch_limit_enabled ?? false}
        initialLimitMinutes={profile?.daily_watch_limit_minutes ?? 60}
        todayWatchedSeconds={watchSession?.watched_seconds ?? 0}
      />

      {/* Watch Stats Section */}
      <WatchStatsCard />
    </div>
  );
}

