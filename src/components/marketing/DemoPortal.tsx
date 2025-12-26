"use client";

import { useState, useCallback } from "react";
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
  ChevronRight,
  RotateCcw,
  Home,
  Filter,
  X,
} from "lucide-react";
import { fadeUp, staggerContainer, zenEase } from "./motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Real YouTube channels with actual data
const demoChannels = [
  { 
    id: "1", 
    name: "MKBHD", 
    category: "Tech", 
    avatar: "https://yt3.googleusercontent.com/lkH37D712tiyphLsBkT8CRLSLCLMOeSLKyxdY6mfSdWB7sJBxwfnYc_VNQBqQ6-2TkM3Nj5Hpg=s176-c-k-c0x00ffffff-no-rj",
    subscribers: "18.9M",
  },
  { 
    id: "2", 
    name: "3Blue1Brown", 
    category: "Education", 
    avatar: "https://yt3.googleusercontent.com/ytc/AIdro_nFzgcTrxulXeYVmDXRAblMhvQ-MjI1aTXU3kqwQS5a=s176-c-k-c0x00ffffff-no-rj",
    subscribers: "6.2M",
  },
  { 
    id: "3", 
    name: "Veritasium", 
    category: "Science", 
    avatar: "https://yt3.googleusercontent.com/ytc/AIdro_kED97yk3MKP6Abzc5u9pnNBWH8pKzYh-36EJNWBLpvhg=s176-c-k-c0x00ffffff-no-rj",
    subscribers: "15.4M",
  },
  { 
    id: "4", 
    name: "Fireship", 
    category: "Tech", 
    avatar: "https://yt3.googleusercontent.com/ytc/AIdro_k_D9hKDXhJDNf1tSNJoXMTT8-OVx3jHfsmFnQOBA=s176-c-k-c0x00ffffff-no-rj",
    subscribers: "3.1M",
  },
];

// Sample videos matching the channels
const demoVideos = [
  {
    id: "1",
    channelId: "1",
    title: "The BEST Smartphones of 2024!",
    channel: "MKBHD",
    channelAvatar: demoChannels[0].avatar,
    duration: "18:45",
    thumbnail: "https://i.ytimg.com/vi/XuSz4YQYGEQ/maxresdefault.jpg",
    views: "4.2M",
    time: "2 days ago",
  },
  {
    id: "2",
    channelId: "2",
    title: "But what is a neural network?",
    channel: "3Blue1Brown",
    channelAvatar: demoChannels[1].avatar,
    duration: "19:13",
    thumbnail: "https://i.ytimg.com/vi/aircAruvnKk/maxresdefault.jpg",
    views: "18M",
    time: "2 years ago",
  },
  {
    id: "3",
    channelId: "3",
    title: "The Bizarre Behavior of Rotating Bodies",
    channel: "Veritasium",
    channelAvatar: demoChannels[2].avatar,
    duration: "15:42",
    thumbnail: "https://i.ytimg.com/vi/OcE7_nLX5W0/maxresdefault.jpg",
    views: "12M",
    time: "1 month ago",
  },
  {
    id: "4",
    channelId: "4",
    title: "100 Seconds of Code - React",
    channel: "Fireship",
    channelAvatar: demoChannels[3].avatar,
    duration: "2:27",
    thumbnail: "https://i.ytimg.com/vi/Tn6-PIqc4UM/maxresdefault.jpg",
    views: "2.1M",
    time: "1 year ago",
  },
  {
    id: "5",
    channelId: "1",
    title: "Galaxy S24 Ultra Review: 100X Better!",
    channel: "MKBHD",
    channelAvatar: demoChannels[0].avatar,
    duration: "14:22",
    thumbnail: "https://i.ytimg.com/vi/6xDAFWALQiY/maxresdefault.jpg",
    views: "5.1M",
    time: "1 week ago",
  },
  {
    id: "6",
    channelId: "2",
    title: "Visualizing quaternions",
    channel: "3Blue1Brown",
    channelAvatar: demoChannels[1].avatar,
    duration: "31:51",
    thumbnail: "https://i.ytimg.com/vi/d4EgbgTm0Bg/maxresdefault.jpg",
    views: "8.2M",
    time: "4 years ago",
  },
];

// Mini dashboard component that mimics the real app
function MiniDashboard({ 
  addedChannels, 
  onRemoveChannel 
}: { 
  addedChannels: string[];
  onRemoveChannel: (id: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"feed" | "channels">("feed");
  const shouldReduceMotion = useReducedMotion();

  const filteredVideos = demoVideos.filter(video => 
    addedChannels.includes(video.channelId)
  );

  const addedChannelData = demoChannels.filter(ch => 
    addedChannels.includes(ch.id)
  );

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
          Channels ({addedChannels.length})
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
              {filteredVideos.length > 0 ? (
                <div className="space-y-3">
                  {/* Filter indicator */}
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Filter className="w-3 h-3" />
                    <span>Showing videos from {addedChannels.length} channel{addedChannels.length !== 1 ? "s" : ""}</span>
                  </div>
                  
                  {/* Video list */}
                  {filteredVideos.map((video, i) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: shouldReduceMotion ? 0 : i * 0.05 }}
                      className="flex gap-2.5 p-2 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer group"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-[9px] rounded font-medium">
                          {video.duration}
                        </span>
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0 py-0.5">
                        <h4 className="text-[11px] font-medium text-zinc-900 line-clamp-2 leading-tight mb-1 group-hover:text-red-600 transition-colors">
                          {video.title}
                        </h4>
                        <div className="flex items-center gap-1.5">
                          <img 
                            src={video.channelAvatar} 
                            alt={video.channel}
                            className="w-4 h-4 rounded-full"
                          />
                          <span className="text-[10px] text-zinc-500 truncate">{video.channel}</span>
                        </div>
                        <p className="text-[9px] text-zinc-400 mt-0.5">
                          {video.views} • {video.time}
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
                  <p className="text-xs text-zinc-400 mt-1">Add channels to see your feed</p>
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
              {addedChannelData.length > 0 ? (
                <div className="space-y-2">
                  {addedChannelData.map((channel, i) => (
                    <motion.div
                      key={channel.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: shouldReduceMotion ? 0 : i * 0.05 }}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-teal-50/50 border border-teal-100"
                    >
                      <img 
                        src={channel.avatar} 
                        alt={channel.name}
                        className="w-9 h-9 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-zinc-900">{channel.name}</div>
                        <div className="text-[10px] text-zinc-500">{channel.subscribers} subscribers</div>
                      </div>
                      <button
                        onClick={() => onRemoveChannel(channel.id)}
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
      {addedChannels.length > 0 && (
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
  const [addedChannels, setAddedChannels] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const shouldReduceMotion = useReducedMotion();

  const handleAddChannel = useCallback((id: string) => {
    setAddedChannels((prev) =>
      prev.includes(id) ? prev : [...prev, id]
    );
  }, []);

  const handleRemoveChannel = useCallback((id: string) => {
    setAddedChannels((prev) => prev.filter((c) => c !== id));
  }, []);

  const filteredChannels = demoChannels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-b from-white to-zinc-50">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <motion.div
          className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(220, 38, 38, 0.05) 0%, transparent 60%)",
            filter: "blur(80px)",
          }}
          animate={shouldReduceMotion ? {} : {
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(13, 148, 136, 0.05) 0%, transparent 60%)",
            filter: "blur(80px)",
          }}
          animate={shouldReduceMotion ? {} : {
            scale: [1, 1.15, 1],
          }}
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
              Add channels on the left, see your curated feed on the right. No sign-up required.
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
                  </h3>
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search channels..."
                      className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                    />
                  </div>
                </div>

                <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
                  {filteredChannels.map((channel, i) => {
                    const isAdded = addedChannels.includes(channel.id);
                    return (
                      <motion.div
                        key={channel.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: shouldReduceMotion ? 0 : i * 0.05 }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200",
                          isAdded
                            ? "bg-teal-50 border-2 border-teal-300 shadow-sm"
                            : "bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
                        )}
                        onClick={() => isAdded ? handleRemoveChannel(channel.id) : handleAddChannel(channel.id)}
                      >
                        <img 
                          src={channel.avatar} 
                          alt={channel.name}
                          className="w-11 h-11 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-zinc-900">{channel.name}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500">{channel.subscribers}</span>
                            <span className="text-zinc-300">•</span>
                            <span className="text-xs text-zinc-400">{channel.category}</span>
                          </div>
                        </div>
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                          isAdded 
                            ? "bg-teal-500 text-white" 
                            : "bg-zinc-100 text-zinc-400 hover:bg-red-100 hover:text-red-500"
                        )}>
                          {isAdded ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Status bar */}
                <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">
                      {addedChannels.length} channel{addedChannels.length !== 1 ? "s" : ""} selected
                    </span>
                    {addedChannels.length > 0 && (
                      <button
                        onClick={() => setAddedChannels([])}
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
                <MiniDashboard 
                  addedChannels={addedChannels} 
                  onRemoveChannel={handleRemoveChannel}
                />
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
