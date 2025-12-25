"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { ChannelCard } from "@/components/channel-card";
import { AddChannelDialog } from "@/components/add-channel-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users, Film } from "lucide-react";

export default function ChannelsPage() {
  const channels = useQuery(api.channels.getUserChannels);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredChannels = channels?.filter((channel) =>
    channel.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold">Your Channels</h1>
            <p className="text-muted-foreground">
              Manage your subscribed channels
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Channel
          </Button>
        </motion.div>

        {/* Stats */}
        {channels && channels.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-card border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{channels.length}</p>
                  <p className="text-sm text-muted-foreground">Channels</p>
                </div>
              </div>
            </div>
            <div className="bg-card border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                  <Film className="w-5 h-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-2xl font-bold">∞</p>
                  <p className="text-sm text-muted-foreground">Videos</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search */}
        {channels && channels.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </motion.div>
        )}

        {/* Loading state */}
        {channels === undefined && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border rounded-xl p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {channels && channels.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Users className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No channels yet</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Start by adding your favorite YouTube channels. Your feed will only show videos from channels you add.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Add Your First Channel
            </Button>
          </motion.div>
        )}

        {/* Channels grid */}
        {filteredChannels && filteredChannels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredChannels.map((channel, index) => (
                <motion.div
                  key={channel._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ChannelCard channel={channel} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* No results */}
        {filteredChannels && filteredChannels.length === 0 && searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">
              No channels found matching &quot;{searchQuery}&quot;
            </p>
          </motion.div>
        )}
      </main>

      <AddChannelDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />
    </div>
  );
}

