"use client";

import {
  Header,
  HeroGlass,
  DemoPortal,
  FeatureRunway,
  BeforeAfterRefraction,
  PrinciplesPrismCards,
  PricingTiers,
  SocialProof,
  WaitlistForm,
  FAQ,
  Footer,
  MarketingChannelsProvider,
} from "@/components/marketing";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Global noise overlay for texture */}
      <div className="fixed inset-0 bg-noise pointer-events-none z-50" />
      
      {/* Grid pattern subtle background */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      {/* Main content */}
      <Header />
      <main>
        <HeroGlass />
        {/* Wrap sections that share channel selection state */}
        <MarketingChannelsProvider>
          <DemoPortal />
          <FeatureRunway />
          <BeforeAfterRefraction />
        </MarketingChannelsProvider>
        <PrinciplesPrismCards />
        <PricingTiers />
        <SocialProof />
        <WaitlistForm />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
