import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Bell, Palette, Shield } from "lucide-react";
import { HomeDestinationSetting } from "@/components/settings/home-destination-setting";
import { BillingSection } from "@/components/settings/billing-section";
import { DeleteAccountDialog } from "@/components/settings/delete-account-dialog";

interface SettingsPageProps {
  searchParams: Promise<{ billing?: string }>;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const supabase = await createClient();
  const params = await searchParams;
  
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

  const currentTier = (profile?.subscription_tier || "free") as "free" | "pro" | "unlimited";
  const subscriptionStatus = profile?.subscription_status || null;
  const hasActiveSubscription = !!profile?.dodo_subscription_id && subscriptionStatus === "active";
  const showSuccessMessage = params.billing === "success";

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

      {/* Billing Section - Client Component */}
      <BillingSection
        currentTier={currentTier}
        subscriptionStatus={subscriptionStatus}
        channelCount={channelCount || 0}
        hasActiveSubscription={hasActiveSubscription}
        showSuccessMessage={showSuccessMessage}
      />

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
            <DeleteAccountDialog />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
