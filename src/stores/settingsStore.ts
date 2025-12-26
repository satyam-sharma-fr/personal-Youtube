"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Tier = "free" | "pro" | "unlimited";

interface SettingsState {
  tier: Tier;
  dailyLimit: number; // in minutes
  watchedToday: number; // in minutes
  theme: "light" | "dark" | "system";
  notifications: boolean;
  autoplay: boolean;
  
  // Actions
  setTier: (tier: Tier) => void;
  setDailyLimit: (limit: number) => void;
  addWatchTime: (minutes: number) => void;
  resetDailyWatch: () => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setNotifications: (enabled: boolean) => void;
  setAutoplay: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Default values
      tier: "free",
      dailyLimit: 60, // 1 hour
      watchedToday: 0,
      theme: "light",
      notifications: true,
      autoplay: false,

      // Actions
      setTier: (tier) => set({ tier }),
      setDailyLimit: (dailyLimit) => set({ dailyLimit }),
      addWatchTime: (minutes) =>
        set((state) => ({ watchedToday: state.watchedToday + minutes })),
      resetDailyWatch: () => set({ watchedToday: 0 }),
      setTheme: (theme) => set({ theme }),
      setNotifications: (notifications) => set({ notifications }),
      setAutoplay: (autoplay) => set({ autoplay }),
    }),
    {
      name: "focustube-settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tier: state.tier,
        dailyLimit: state.dailyLimit,
        theme: state.theme,
        notifications: state.notifications,
        autoplay: state.autoplay,
      }),
    }
  )
);

// Tier limits
export const tierLimits: Record<Tier, {
  maxChannels: number;
  categories: boolean;
  watchHistory: number; // days
  resumePlayback: boolean;
  videoSearch: boolean;
  watchLimits: boolean;
  exportChannels: boolean;
}> = {
  free: {
    maxChannels: 5,
    categories: false,
    watchHistory: 7,
    resumePlayback: false,
    videoSearch: false,
    watchLimits: false,
    exportChannels: false,
  },
  pro: {
    maxChannels: 25,
    categories: true,
    watchHistory: 30,
    resumePlayback: true,
    videoSearch: true,
    watchLimits: true,
    exportChannels: false,
  },
  unlimited: {
    maxChannels: Infinity,
    categories: true,
    watchHistory: Infinity,
    resumePlayback: true,
    videoSearch: true,
    watchLimits: true,
    exportChannels: true,
  },
};

