"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

export interface MarketingChannel {
  channelId: string;
  title: string;
  thumbnailUrl: string;
  subscriberCount?: string;
  customUrl?: string;
}

export interface MarketingVideo {
  videoId: string;
  channelId: string;
  title: string;
  thumbnailUrl: string;
  thumbnailHighUrl?: string;
  publishedAt: string;
  duration?: string;
  viewCount?: string;
  channelTitle?: string;
  channelThumbnail?: string;
}

interface MarketingChannelsContextValue {
  selectedChannels: MarketingChannel[];
  addChannel: (channel: MarketingChannel) => boolean;
  removeChannel: (channelId: string) => void;
  isSelected: (channelId: string) => boolean;
  canAddMore: boolean;
  maxChannels: number;
  clearAll: () => void;
}

const MAX_CHANNELS = 5;

const MarketingChannelsContext = createContext<MarketingChannelsContextValue | null>(null);

export function MarketingChannelsProvider({ children }: { children: ReactNode }) {
  const [selectedChannels, setSelectedChannels] = useState<MarketingChannel[]>([]);

  const addChannel = useCallback((channel: MarketingChannel): boolean => {
    let added = false;
    setSelectedChannels((prev) => {
      if (prev.length >= MAX_CHANNELS) return prev;
      if (prev.some((c) => c.channelId === channel.channelId)) return prev;
      added = true;
      return [...prev, channel];
    });
    return added;
  }, []);

  const removeChannel = useCallback((channelId: string) => {
    setSelectedChannels((prev) => prev.filter((c) => c.channelId !== channelId));
  }, []);

  const isSelected = useCallback(
    (channelId: string) => selectedChannels.some((c) => c.channelId === channelId),
    [selectedChannels]
  );

  const canAddMore = selectedChannels.length < MAX_CHANNELS;

  const clearAll = useCallback(() => {
    setSelectedChannels([]);
  }, []);

  const value = useMemo<MarketingChannelsContextValue>(
    () => ({
      selectedChannels,
      addChannel,
      removeChannel,
      isSelected,
      canAddMore,
      maxChannels: MAX_CHANNELS,
      clearAll,
    }),
    [selectedChannels, addChannel, removeChannel, isSelected, canAddMore, clearAll]
  );

  return (
    <MarketingChannelsContext.Provider value={value}>
      {children}
    </MarketingChannelsContext.Provider>
  );
}

export function useMarketingChannels() {
  const ctx = useContext(MarketingChannelsContext);
  if (!ctx) {
    throw new Error("useMarketingChannels must be used within MarketingChannelsProvider");
  }
  return ctx;
}

