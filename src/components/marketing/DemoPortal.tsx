"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Play,
  Plus,
  Search,
  Clock,
  Tv,
  Check,
  ArrowRight,
  RotateCcw,
  Home,
  Filter,
  X,
  Loader2,
  AlertCircle,
  Sparkles,
  MousePointerClick,
} from "lucide-react";
import { fadeUp, staggerContainer } from "./motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useMarketingChannels, type MarketingChannel, type MarketingVideo } from "./MarketingChannelsContext";
import { searchChannelsPublic, getLatestVideosForChannelsPublic } from "@/app/actions/marketing-youtube";
import { formatDuration, formatViewCount } from "@/lib/youtube";

// Helper to format relative time
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
  if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  if (diffWeeks > 0) return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  return "Just now";
}

// Helper to format subscriber count
function formatSubscribers(count: string | number): string {
  const num = typeof count === "string" ? parseInt(count, 10) : count;
  if (isNaN(num)) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

interface VideoWithChannel extends MarketingVideo {
  channelTitle: string;
  channelThumbnail: string;
}

// Mini dashboard component that shows real feed
function MiniDashboard({
  videos,
  isLoading,
}: {
  videos: VideoWithChannel[];
  isLoading: boolean;
}) {
  const { selectedChannels, removeChannel } = useMarketingChannels();
  const [activeTab, setActiveTab] = useState<"feed" | "channels">("feed");
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl overflow-hidden border border-zinc-200 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
            <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
          </div>
          <span className="font-semibold text-zinc-900 text-sm">FocusTube</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-teal-50 border border-teal-100">
          <Clock className="w-3 h-3 text-teal-600" />
          <span className="text-[10px] font-medium text-teal-600">0:00</span>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-zinc-100">
        <button
          onClick={() => setActiveTab("feed")}
          className={cn(
            "flex-1 py-2.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5",
            activeTab === "feed"
              ? "text-red-600 border-b-2 border-red-600 bg-red-50/50"
              : "text-zinc-500 hover:text-zinc-700"
          )}
        >
          <Home className="w-3.5 h-3.5" />
          Feed
        </button>
        <button
          onClick={() => setActiveTab("channels")}
          className={cn(
            "flex-1 py-2.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5",
            activeTab === "channels"
              ? "text-red-600 border-b-2 border-red-600 bg-red-50/50"
              : "text-zinc-500 hover:text-zinc-700"
          )}
        >
          <Tv className="w-3.5 h-3.5" />
          Channels ({selectedChannels.length})
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === "feed" ? (
            <motion.div
              key="feed"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="p-3"
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Loader2 className="w-8 h-8 text-red-500 animate-spin mb-3" />
                  <p className="text-sm text-zinc-500">Loading videos...</p>
                </div>
              ) : videos.length > 0 ? (
                <div className="space-y-3">
                  {/* Filter indicator */}
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Filter className="w-3 h-3" />
                    <span>
                      Showing videos from {selectedChannels.length} channel
                      {selectedChannels.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Video list */}
                  {videos.map((video, i) => (
                    <motion.div
                      key={video.videoId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: shouldReduceMotion ? 0 : i * 0.05 }}
                      className="flex gap-2.5 p-2 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer group"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/320x180?text=Video";
                          }}
                        />
                        {video.duration && (
                          <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-[9px] rounded font-medium">
                            {formatDuration(video.duration)}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 py-0.5">
                        <h4 className="text-[11px] font-medium text-zinc-900 line-clamp-2 leading-tight mb-1 group-hover:text-red-600 transition-colors">
                          {video.title}
                        </h4>
                        <div className="flex items-center gap-1.5">
                          <img
                            src={video.channelThumbnail}
                            alt={video.channelTitle}
                            className="w-4 h-4 rounded-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                video.channelTitle
                              )}&size=16&background=dc2626&color=fff`;
                            }}
                          />
                          <span className="text-[10px] text-zinc-500 truncate">
                            {video.channelTitle}
                          </span>
                        </div>
                        <p className="text-[9px] text-zinc-400 mt-0.5">
                          {video.viewCount ? formatViewCount(video.viewCount) : ""}{" "}
                          {video.viewCount && video.publishedAt ? "• " : ""}
                          {video.publishedAt ? formatRelativeTime(video.publishedAt) : ""}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
                    <Tv className="w-6 h-6 text-zinc-400" />
                  </div>
                  <p className="text-sm text-zinc-500">No channels added yet</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Search and add channels to see your feed
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="channels"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="p-3"
            >
              {selectedChannels.length > 0 ? (
                <div className="space-y-2">
                  {selectedChannels.map((channel, i) => (
                    <motion.div
                      key={channel.channelId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: shouldReduceMotion ? 0 : i * 0.05 }}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-teal-50/50 border border-teal-100"
                    >
                      <img
                        src={channel.thumbnailUrl}
                        alt={channel.title}
                        className="w-9 h-9 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            channel.title
                          )}&background=0d9488&color=fff`;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-zinc-900">
                          {channel.title}
                        </div>
                        {channel.subscriberCount && (
                          <div className="text-[10px] text-zinc-500">
                            {formatSubscribers(channel.subscriberCount)} subscribers
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeChannel(channel.channelId)}
                        className="w-6 h-6 rounded-full bg-zinc-100 hover:bg-red-100 flex items-center justify-center transition-colors group"
                      >
                        <X className="w-3 h-3 text-zinc-400 group-hover:text-red-500" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
                    <Plus className="w-6 h-6 text-zinc-400" />
                  </div>
                  <p className="text-sm text-zinc-500">No channels yet</p>
                  <p className="text-xs text-zinc-400 mt-1">Add your favorite channels</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom status */}
      {selectedChannels.length > 0 && (
        <div className="px-4 py-2.5 border-t border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center justify-center gap-2 text-[10px] text-teal-600">
            <Check className="w-3 h-3" />
            <span className="font-medium">No recommendations • No distractions</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function DemoPortal() {
  const {
    selectedChannels,
    addChannel,
    removeChannel,
    isSelected,
    canAddMore,
    maxChannels,
    clearAll,
  } = useMarketingChannels();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MarketingChannel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [videos, setVideos] = useState<VideoWithChannel[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const result = await searchChannelsPublic(searchQuery);
        if (result.channels) {
          setSearchResults(
            result.channels.map((ch) => ({
              channelId: ch.channelId,
              title: ch.title,
              thumbnailUrl: ch.thumbnailUrl,
              subscriberCount: ch.subscriberCount,
              customUrl: ch.customUrl,
            }))
          );
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch videos when selected channels change
  useEffect(() => {
    if (selectedChannels.length === 0) {
      setVideos([]);
      return;
    }

    const fetchVideos = async () => {
      setIsLoadingVideos(true);
      try {
        const channelIds = selectedChannels.map((c) => c.channelId);
        const result = await getLatestVideosForChannelsPublic(channelIds, 3);

        if (result.videosByChannel) {
          // Flatten and enrich videos with channel info
          const allVideos: VideoWithChannel[] = [];

          for (const channel of selectedChannels) {
            const channelVideos = result.videosByChannel[channel.channelId] || [];
            for (const video of channelVideos) {
              allVideos.push({
                videoId: video.videoId,
                channelId: video.channelId,
                title: video.title,
                thumbnailUrl: video.thumbnailUrl,
                thumbnailHighUrl: video.thumbnailHighUrl,
                publishedAt: video.publishedAt,
                duration: video.duration,
                viewCount: video.viewCount,
                channelTitle: channel.title,
                channelThumbnail: channel.thumbnailUrl,
              });
            }
          }

          // Sort by published date (newest first)
          allVideos.sort(
            (a, b) =>
              new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          );

          setVideos(allVideos);
        }
      } catch {
        setVideos([]);
      } finally {
        setIsLoadingVideos(false);
      }
    };

    fetchVideos();
  }, [selectedChannels]);

  const handleAddChannel = useCallback(
    (channel: MarketingChannel) => {
      addChannel(channel);
    },
    [addChannel]
  );

  // Filter out already selected channels from search results
  const filteredResults = searchResults.filter((ch) => !isSelected(ch.channelId));

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-b from-white to-zinc-50">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <motion.div
          className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(220, 38, 38, 0.05) 0%, transparent 60%)",
            filter: "blur(80px)",
          }}
          animate={
            shouldReduceMotion
              ? {}
              : {
                  scale: [1, 1.1, 1],
                }
          }
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(13, 148, 136, 0.05) 0%, transparent 60%)",
            filter: "blur(80px)",
          }}
          animate={
            shouldReduceMotion
              ? {}
              : {
                  scale: [1, 1.15, 1],
                }
          }
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-6xl mx-auto"
        >
          {/* Section header */}
          <motion.div variants={fadeUp} className="text-center mb-12">
            <span className="inline-block text-sm font-medium text-red-600 mb-3 tracking-wider uppercase">
              Interactive Demo
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-semibold mb-4 text-zinc-900">
              Try it yourself.
            </h2>
            <p className="text-zinc-600 text-lg max-w-xl mx-auto">
              Search and add channels on the left, see your curated feed on the right.
              No sign-up required.
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left: Channel picker */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-lg overflow-hidden">
                <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                  <h3 className="font-semibold text-zinc-900 flex items-center gap-2 mb-3">
                    <Plus className="w-5 h-5 text-red-600" />
                    Add Channels
                    {selectedChannels.length === 0 && (
                      <motion.span
                        className="ml-auto text-xs font-normal text-red-500 flex items-center gap-1"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles className="w-3 h-3" />
                        Start here
                      </motion.span>
                    )}
                  </h3>
                  {/* Search with animated border when empty */}
                  <div className="relative">
                    {/* Pulsing border effect when no channels */}
                    {selectedChannels.length === 0 && !searchQuery && (
                      <motion.div
                        className="absolute -inset-1 rounded-xl bg-gradient-to-r from-red-500 via-orange-500 to-red-500 opacity-50"
                        animate={{
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        style={{ filter: "blur(4px)" }}
                      />
                    )}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 z-10" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search YouTube channels..."
                        className={cn(
                          "w-full h-10 pl-10 pr-10 rounded-xl bg-white border text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all relative z-10",
                          selectedChannels.length === 0 && !searchQuery
                            ? "border-red-300 shadow-sm"
                            : "border-zinc-200"
                        )}
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 animate-spin z-10" />
                      )}
                      {!isSearching && searchQuery && (
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setSearchResults([]);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
                  {/* Search results */}
                  {filteredResults.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <p className="text-xs text-zinc-500 font-medium">Search results</p>
                      {filteredResults.slice(0, 5).map((channel, i) => (
                        <motion.div
                          key={channel.channelId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: shouldReduceMotion ? 0 : i * 0.05 }}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200",
                            "bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-sm",
                            !canAddMore && "opacity-50 cursor-not-allowed"
                          )}
                          onClick={() => canAddMore && handleAddChannel(channel)}
                        >
                          <img
                            src={channel.thumbnailUrl}
                            alt={channel.title}
                            className="w-11 h-11 rounded-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                channel.title
                              )}&background=dc2626&color=fff`;
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-zinc-900">
                              {channel.title}
                            </div>
                            {channel.subscriberCount && (
                              <div className="text-xs text-zinc-500">
                                {formatSubscribers(channel.subscriberCount)} subscribers
                              </div>
                            )}
                          </div>
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                              "bg-zinc-100 text-zinc-400 hover:bg-red-100 hover:text-red-500"
                            )}
                          >
                            <Plus className="w-4 h-4" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* No results message */}
                  {searchQuery.length >= 2 &&
                    !isSearching &&
                    searchResults.length === 0 && (
                      <div className="text-center py-8 text-zinc-500">
                        <p className="text-sm">No channels found</p>
                        <p className="text-xs mt-1">Try a different search term</p>
                      </div>
                    )}

                  {/* Selected channels */}
                  {selectedChannels.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-500 font-medium">
                        Selected channels ({selectedChannels.length}/{maxChannels})
                      </p>
                      {selectedChannels.map((channel, i) => (
                        <motion.div
                          key={channel.channelId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: shouldReduceMotion ? 0 : i * 0.05 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-teal-50 border-2 border-teal-300 shadow-sm"
                        >
                          <img
                            src={channel.thumbnailUrl}
                            alt={channel.title}
                            className="w-11 h-11 rounded-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                channel.title
                              )}&background=0d9488&color=fff`;
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-zinc-900">
                              {channel.title}
                            </div>
                            {channel.subscriberCount && (
                              <div className="text-xs text-zinc-500">
                                {formatSubscribers(channel.subscriberCount)} subscribers
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeChannel(channel.channelId)}
                            className="w-8 h-8 rounded-full bg-teal-500 text-white hover:bg-red-500 flex items-center justify-center transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Empty state with visual prompt */}
                  {selectedChannels.length === 0 && searchResults.length === 0 && (
                    <div className="text-center py-6">
                      {/* Search icon */}
                      <motion.div
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mx-auto shadow-lg shadow-red-500/30 mb-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Search className="w-7 h-7 text-white" />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <p className="text-sm font-medium text-zinc-700 mb-1">
                          Start by searching for channels
                        </p>
                        <p className="text-xs text-zinc-400 mb-4">
                          Add up to {maxChannels} of your favorite YouTube channels
                        </p>
                      </motion.div>

                      {/* Try these suggestions */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-2"
                      >
                        <p className="text-xs text-zinc-400 flex items-center justify-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Try searching for:
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {["MKBHD", "Fireship", "Veritasium"].map((suggestion) => (
                            <button
                              key={suggestion}
                              onClick={() => setSearchQuery(suggestion)}
                              className="px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-red-50 border border-zinc-200 hover:border-red-200 text-xs font-medium text-zinc-600 hover:text-red-600 transition-all flex items-center gap-1.5"
                            >
                              <MousePointerClick className="w-3 h-3" />
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </motion.div>

                      {/* Arrow pointing to search */}
                      <motion.div
                        className="mt-4 flex justify-center"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <div className="flex items-center gap-1 text-xs text-red-500 font-medium">
                          <ArrowRight className="w-4 h-4 rotate-[-90deg]" />
                          <span>Use the search box above</span>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* Max channels warning */}
                  {!canAddMore && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 mt-4">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Max {maxChannels} channels reached
                      </span>
                    </div>
                  )}
                </div>

                {/* Status bar */}
                <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">
                      {selectedChannels.length} channel
                      {selectedChannels.length !== 1 ? "s" : ""} selected
                    </span>
                    {selectedChannels.length > 0 && (
                      <button
                        onClick={clearAll}
                        className="text-zinc-400 hover:text-red-500 flex items-center gap-1 text-xs transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Mini dashboard preview */}
              <div className="h-[520px]">
                <MiniDashboard videos={videos} isLoading={isLoadingVideos} />
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div variants={fadeUp} className="text-center mt-12">
            <p className="text-sm text-zinc-500 mb-4">
              Like what you see? Create your account to save your channels.
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 rounded-xl"
              >
                Start for Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
