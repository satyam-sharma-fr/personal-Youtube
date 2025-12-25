"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Link2, Loader2, Plus, Check, Users } from "lucide-react";
import { toast } from "sonner";
import { 
  parseChannelInput, 
  getChannelById, 
  getChannelByHandle, 
  searchChannels,
  type Channel 
} from "@/lib/youtube";

interface AddChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddChannelDialog({ open, onOpenChange }: AddChannelDialogProps) {
  const [urlInput, setUrlInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Channel[]>([]);
  const [previewChannel, setPreviewChannel] = useState<Channel | null>(null);
  const [addingChannelId, setAddingChannelId] = useState<string | null>(null);

  const addChannel = useMutation(api.channels.addChannel);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsLoading(true);
    setPreviewChannel(null);

    try {
      const parsed = parseChannelInput(urlInput);
      let channel: Channel | null = null;

      if (parsed.type === "id") {
        channel = await getChannelById(parsed.value);
      } else if (parsed.type === "handle") {
        channel = await getChannelByHandle(parsed.value);
      } else {
        // Treat as search
        const results = await searchChannels(parsed.value, 5);
        if (results.length > 0) {
          setSearchResults(results);
        } else {
          toast.error("No channels found");
        }
        setIsLoading(false);
        return;
      }

      if (channel) {
        setPreviewChannel(channel);
      } else {
        toast.error("Channel not found");
      }
    } catch (error) {
      console.error("Error fetching channel:", error);
      toast.error("Failed to fetch channel info");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setSearchResults([]);

    try {
      const results = await searchChannels(searchQuery, 10);
      setSearchResults(results);
      if (results.length === 0) {
        toast.info("No channels found for your search");
      }
    } catch (error) {
      console.error("Error searching channels:", error);
      toast.error("Failed to search channels");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddChannel = async (channel: Channel) => {
    setAddingChannelId(channel.id);

    try {
      await addChannel({
        channelId: channel.id,
        title: channel.title,
        thumbnail: channel.thumbnail,
        description: channel.description,
        subscriberCount: channel.subscriberCount,
        customUrl: channel.customUrl,
      });
      toast.success(`Added ${channel.title}!`);
      
      // Reset and close
      setUrlInput("");
      setSearchQuery("");
      setPreviewChannel(null);
      setSearchResults([]);
      onOpenChange(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add channel";
      if (errorMessage.includes("already added")) {
        toast.error("You've already added this channel");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setAddingChannelId(null);
    }
  };

  const resetState = () => {
    setUrlInput("");
    setSearchQuery("");
    setPreviewChannel(null);
    setSearchResults([]);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetState();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add Channel
          </DialogTitle>
          <DialogDescription>
            Add a YouTube channel to your feed by URL or search.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="gap-2">
              <Link2 className="w-4 h-4" />
              URL / Handle
            </TabsTrigger>
            <TabsTrigger value="search" className="gap-2">
              <Search className="w-4 h-4" />
              Search
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4 mt-4">
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Channel URL or Handle</Label>
                <Input
                  id="url"
                  placeholder="youtube.com/@mkbhd or @mkbhd"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Paste a YouTube channel URL, handle (@username), or channel ID
                </p>
              </div>
              <Button type="submit" disabled={isLoading || !urlInput.trim()} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Find Channel
                  </>
                )}
              </Button>
            </form>

            {/* Preview Channel */}
            <AnimatePresence>
              {previewChannel && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <ChannelCard 
                    channel={previewChannel} 
                    onAdd={handleAddChannel}
                    isAdding={addingChannelId === previewChannel.id}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="search" className="space-y-4 mt-4">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Channels</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    placeholder="Search for channels..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading || !searchQuery.trim()}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </form>

            {/* Search Results */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))
              ) : (
                <AnimatePresence>
                  {searchResults.map((channel, index) => (
                    <motion.div
                      key={channel.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ChannelCard 
                        channel={channel} 
                        onAdd={handleAddChannel}
                        isAdding={addingChannelId === channel.id}
                        compact
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface ChannelCardProps {
  channel: Channel;
  onAdd: (channel: Channel) => void;
  isAdding: boolean;
  compact?: boolean;
}

function ChannelCard({ channel, onAdd, isAdding, compact }: ChannelCardProps) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${compact ? "" : "p-4"}`}>
      <Avatar className={compact ? "w-12 h-12" : "w-16 h-16"}>
        <AvatarImage src={channel.thumbnail} alt={channel.title} />
        <AvatarFallback>{channel.title.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{channel.title}</h4>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-3 h-3" />
          <span>{channel.subscriberCount} subscribers</span>
        </div>
        {!compact && channel.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {channel.description}
          </p>
        )}
      </div>
      <Button 
        size={compact ? "sm" : "default"}
        onClick={() => onAdd(channel)}
        disabled={isAdding}
      >
        {isAdding ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </>
        )}
      </Button>
    </div>
  );
}

