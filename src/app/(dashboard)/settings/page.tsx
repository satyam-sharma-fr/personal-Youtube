import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Check, Crown, CreditCard, Mail, User } from "lucide-react";

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
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and subscription</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "User"} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{profile?.full_name || "User"}</h3>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Member since</p>
              <p className="font-medium">
                {new Date(profile?.created_at || user.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Channels subscribed</p>
              <p className="font-medium">{channelCount || 0}</p>
            </div>
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

