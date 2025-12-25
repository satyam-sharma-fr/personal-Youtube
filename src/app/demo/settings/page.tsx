import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Crown, CreditCard, Timer, Clock, ArrowRight, Eye, Lock } from "lucide-react";

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

export default function DemoSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Eye className="w-6 h-6 text-accent" />
          Demo Settings Preview
        </h1>
        <p className="text-muted-foreground mt-1">
          This is what the settings page looks like. Sign up to customize your experience!
        </p>
      </div>

      {/* Demo Notice */}
      <Card className="border-accent/50 bg-accent/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Demo Mode Active</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Settings are read-only in demo mode. Create an account to personalize your FocusTube experience.
              </p>
              <Link href="/signup">
                <Button size="sm">
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Watch Time Limits Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            Watch Time Limits
          </CardTitle>
          <CardDescription>
            Set a daily limit to help you stay focused and avoid endless scrolling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toggle preview */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="font-medium">Daily Watch Limit</p>
                <p className="text-sm text-muted-foreground">
                  Tracking your watch time
                </p>
              </div>
            </div>
            <div className="relative w-14 h-8 rounded-full bg-emerald-500 cursor-not-allowed opacity-70">
              <span className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow translate-x-6" />
            </div>
          </div>

          {/* Duration preview */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Daily Limit Duration</p>
            <div className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-background/50">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>1 hour</span>
              <Badge variant="secondary" className="ml-auto text-xs">Demo</Badge>
            </div>
          </div>

          {/* Progress preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Today's watch time</span>
              <span className="font-medium">23:45 / 1:00:00</span>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-emerald-500"
                style={{ width: "40%" }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              36:15 remaining today
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Subscription Plans
          </CardTitle>
          <CardDescription>Choose the plan that fits your needs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current plan preview */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Free Plan</h3>
                  <Badge variant="secondary">$0</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  5 channels • Basic features
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Plan comparison */}
          <div className="grid md:grid-cols-3 gap-4">
            {(["free", "pro", "unlimited"] as const).map((tier) => (
              <div
                key={tier}
                className={`p-4 rounded-xl border ${
                  tier === "pro" ? "border-primary bg-primary/5" : "border-border/50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{tiers[tier].name}</h4>
                  <Badge variant={tier === "pro" ? "default" : "secondary"}>
                    {tiers[tier].price}
                  </Badge>
                </div>
                <ul className="space-y-2">
                  {tiers[tier].features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-border/50 text-center">
        <h3 className="text-lg font-semibold mb-2">Ready to take control?</h3>
        <p className="text-muted-foreground mb-4">
          Create your free account to customize settings and start your focused YouTube journey.
        </p>
        <Link href="/signup">
          <Button size="lg">
            Get Started Free
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

