"use client";

import { useEffect } from "react";
import { useSettingsStore, type Tier } from "@/stores/settingsStore";

interface TierSyncProps {
  tier: Tier;
}

/**
 * Syncs the user's subscription tier from the database to the client-side settings store.
 * This ensures the sidebar and other UI components show the correct tier.
 */
export function TierSync({ tier }: TierSyncProps) {
  const setTier = useSettingsStore((s) => s.setTier);
  const currentTier = useSettingsStore((s) => s.tier);

  useEffect(() => {
    // Only update if the tier has changed to avoid unnecessary re-renders
    if (currentTier !== tier) {
      setTier(tier);
    }
  }, [tier, currentTier, setTier]);

  return null;
}

