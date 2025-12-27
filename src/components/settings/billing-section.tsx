"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Crown, CreditCard, Loader2, ExternalLink } from "lucide-react";
import { TIERS, TierID } from "@/lib/billing";

// Use shared tier config for pricing, with a slightly different feature subset for billing UI
const tiers: Record<TierID, { name: string; price: string; channels: number; features: string[] }> = {
  free: {
    name: TIERS.free.name,
    price: TIERS.free.price,
    channels: TIERS.free.channels,
    features: ["Up to 5 channels", "Basic feed", "Watch history (7 days)"],
  },
  pro: {
    name: TIERS.pro.name,
    price: TIERS.pro.price,
    channels: TIERS.pro.channels,
    features: [
      "Up to 25 channels",
      "Channel categories",
      "Watch history (30 days)",
      "Resume playback",
      "Video search",
      "7-day free trial",
    ],
  },
  unlimited: {
    name: TIERS.unlimited.name,
    price: TIERS.unlimited.price,
    channels: TIERS.unlimited.channels,
    features: [
      "Unlimited channels",
      "Everything in Pro",
      "Forever watch history",
      "Export channel list",
      "Priority support",
      "7-day free trial",
    ],
  },
};

interface BillingSectionProps {
  currentTier: "free" | "pro" | "unlimited";
  subscriptionStatus: string | null;
  channelCount: number;
  hasActiveSubscription: boolean;
  showSuccessMessage?: boolean;
}

export function BillingSection({
  currentTier,
  subscriptionStatus,
  channelCount,
  hasActiveSubscription,
  showSuccessMessage,
}: BillingSectionProps) {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tierInfo = tiers[currentTier];

  const handleUpgrade = async (tier: "pro" | "unlimited") => {
    setLoadingTier(tier);
    setError(null);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Dodo checkout
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoadingTier(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    setError(null);

    try {
      const response = await fetch("/api/billing/customer-portal");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to open customer portal");
      }

      // Redirect to customer portal
      if (data.portal_url) {
        window.location.href = data.portal_url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoadingPortal(false);
    }
  };

  return (
    <>
      {/* Success Message */}
      {showSuccessMessage && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-700 dark:text-green-400">
                  Payment successful!
                </p>
                <p className="text-sm text-muted-foreground">
                  Your subscription is now active. Enjoy your new features!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-red-500/50 bg-red-500/5">
          <CardContent className="pt-6">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Current Subscription */}
      <Card id="billing">
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
                  {subscriptionStatus && subscriptionStatus !== "active" && (
                    <Badge 
                      variant={subscriptionStatus === "trialing" ? "outline" : "destructive"} 
                      className={subscriptionStatus === "trialing" 
                        ? "border-amber-500 text-amber-600 bg-amber-50" 
                        : "capitalize"
                      }
                    >
                      {subscriptionStatus === "trialing" ? "Trial Active" : subscriptionStatus}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {channelCount || 0} of{" "}
                  {tierInfo.channels === Infinity ? "unlimited" : tierInfo.channels} channels used
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasActiveSubscription && (
                <Button
                  variant="outline"
                  onClick={handleManageSubscription}
                  disabled={loadingPortal}
                >
                  {loadingPortal ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  Manage
                </Button>
              )}
              {currentTier === "free" && (
                <Button onClick={() => handleUpgrade("pro")} disabled={!!loadingTier}>
                  {loadingTier === "pro" && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Upgrade
                </Button>
              )}
            </div>
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
                <Button
                  className="w-full"
                  variant={tier === "pro" ? "default" : "outline"}
                  onClick={() => handleUpgrade(tier)}
                  disabled={!!loadingTier}
                >
                  {loadingTier === tier && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Upgrade to {tiers[tier].name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Plan change for paid users */}
      {currentTier === "pro" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{tiers.unlimited.name}</CardTitle>
              <Badge variant="secondary">{tiers.unlimited.price}</Badge>
            </div>
            <CardDescription>Upgrade to remove all limits</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              {tiers.unlimited.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-accent" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => handleUpgrade("unlimited")}
              disabled={!!loadingTier}
            >
              {loadingTier === "unlimited" && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Upgrade to Unlimited
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}

