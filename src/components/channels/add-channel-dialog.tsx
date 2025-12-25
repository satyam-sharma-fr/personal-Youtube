"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Loader2, Users, ExternalLink } from "lucide-react";
import { addChannel, searchChannels } from "@/app/actions/channels";
import { formatSubscriberCount } from "@/lib/youtube";
import type { YouTubeChannelData } from "@/lib/youtube";

interface AddChannelDialogProps {
  children?: React.ReactNode;
}

export function AddChannelDialog({ children }: AddChannelDialogProps) {
  const [open, setOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<YouTubeChannelData[]>([]);
  const router = useRouter();

  const handleAddByUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsLoading(true);
    try {
      const result = await addChannel(urlInput);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Added ${result.channel?.title || "channel"} to your subscriptions`);
        setUrlInput("");
        setOpen(false);
        router.refresh();
      }
    } catch {
      toast.error("Failed to add channel");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const result = await searchChannels(searchQuery);
      if (result.error) {
        toast.error(result.error);
      } else {
        setSearchResults(result.channels || []);
      }
    } catch {
      toast.error("Failed to search channels");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFromSearch = async (channel: YouTubeChannelData) => {
    setIsLoading(true);
    try {
      const result = await addChannel(channel.channelId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Added ${channel.title} to your subscriptions`);
        setSearchResults((prev) => prev.filter((c) => c.channelId !== channel.channelId));
        router.refresh();
      }
    } catch {
      toast.error("Failed to add channel");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Channel
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Channel</DialogTitle>
          <DialogDescription>
            Add a YouTube channel to your subscriptions
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="url" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">By URL</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="mt-4">
            <form onSubmit={handleAddByUrl} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Channel URL or Handle</Label>
                <Input
                  id="url"
                  placeholder="youtube.com/@channel or @handle"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Paste a YouTube channel URL, handle (@username), or channel ID
                </p>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading || !urlInput.trim()}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add Channel
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="search" className="mt-4">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Channels</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    placeholder="Search for channels..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isSearching}
                  />
                  <Button type="submit" variant="secondary" disabled={isSearching || !searchQuery.trim()}>
                    {isSearching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </form>

            <AnimatePresence mode="wait">
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4"
                >
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2 pr-4">
                      {searchResults.map((channel, index) => (
                        <motion.div
                          key={channel.channelId}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/10 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarImage src={channel.thumbnailUrl} alt={channel.title} />
                              <AvatarFallback>{channel.title[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{channel.title}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                {formatSubscriberCount(channel.subscriberCount)} subscribers
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <a
                              href={`https://youtube.com/channel/${channel.channelId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <Button
                              size="sm"
                              onClick={() => handleAddFromSearch(channel)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Plus className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

