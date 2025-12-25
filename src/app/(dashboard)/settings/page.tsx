import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Crown, CreditCard, Settings as SettingsIcon, Bell, Palette, Shield } from "lucide-react";
import { HomeDestinationSetting } from "@/components/settings/home-destination-setting";

const tiers = {
  free: {
    name: "Free",
    price: "$0",
    channels: 5,
    features: ["Up to 5 channels", "Basic feed", "Watch history (7 days)"],
  },
  pro: {
    name: "Pro",
    price: "$9/month",
    channels: 25,
    features: [
      "Up to 25 channels",
      "Channel categories",
      "Watch history (30 days)",
      "Resume playback",
      "Video search",
    ],
  },
  unlimited: {
    name: "Unlimited",
    price: "$19/month",
    channels: Infinity,
    features: [
      "Unlimited channels",
      "Everything in Pro",
      "Forever watch history",
      "Export channel list",
      "Priority support",
    ],
  },
};

export default async function SettingsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { count: channelCount } = await supabase
    .from("channel_subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const currentTier = (profile?.subscription_tier || "free") as keyof typeof tiers;
  const tierInfo = tiers[currentTier];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon className="w-6 h-6" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">App preferences and subscription</p>
      </div>

      {/* Quick link to Profile */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Looking for your profile?</h3>
              <p className="text-sm text-muted-foreground">
                Manage categories, watch limits, and view stats on your profile page
              </p>
            </div>
            <Link href="/profile">
              <Button variant="default" size="sm">
                Go to Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Home Button Destination */}
      <HomeDestinationSetting />

      {/* App Preferences (placeholder for future settings) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">System preference (dark mode)</p>
            </div>
            <Badge variant="secondary">Coming soon</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Notifications (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>Manage notification preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-muted-foreground">Get notified about new videos</p>
            </div>
            <Badge variant="secondary">Coming soon</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Subscription
          </CardTitle>
          <CardDescription>Your current plan and usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{tierInfo.name} Plan</h3>
                  <Badge variant="secondary">{tierInfo.price}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {channelCount || 0} of {tierInfo.channels === Infinity ? "unlimited" : tierInfo.channels} channels used
                </p>
              </div>
            </div>
            {currentTier === "free" && (
              <Button>Upgrade</Button>
            )}
          </div>

          <div>
            <h4 className="font-medium mb-3">Your plan includes:</h4>
            <ul className="space-y-2">
              {tierInfo.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-accent" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Cards */}
      {currentTier === "free" && (
        <div className="grid md:grid-cols-2 gap-6">
          {(["pro", "unlimited"] as const).map((tier) => (
            <Card key={tier} className={tier === "pro" ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{tiers[tier].name}</CardTitle>
                  <Badge variant={tier === "pro" ? "default" : "secondary"}>
                    {tiers[tier].price}
                  </Badge>
                </div>
                <CardDescription>
                  {tier === "pro" ? "Most popular for focused viewers" : "No limits, ever"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {tiers[tier].features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={tier === "pro" ? "default" : "outline"}>
                  Upgrade to {tiers[tier].name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Privacy & Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Data
          </CardTitle>
          <CardDescription>Manage your data and privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
            <div>
              <p className="font-medium">Export Data</p>
              <p className="text-sm text-muted-foreground">Download all your data</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Export
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/5 border border-red-500/20">
            <div>
              <p className="font-medium text-red-600 dark:text-red-400">Delete Account</p>
              <p className="text-sm text-muted-foreground">Permanently delete your account and data</p>
            </div>
            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950" disabled>
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="pt-6">
          <p className="text-center text-sm text-muted-foreground">
            🚧 Stripe integration coming soon. All features available during beta.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
