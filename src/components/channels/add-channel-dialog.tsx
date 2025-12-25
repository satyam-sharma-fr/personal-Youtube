"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Search, Loader2, Users, ExternalLink, X, Tag, Check } from "lucide-react";
import { addChannel, searchChannels } from "@/app/actions/channels";
import { getUserCategories, createCategory } from "@/app/actions/categories";
import { formatSubscriberCount } from "@/lib/youtube";
import type { YouTubeChannelData } from "@/lib/youtube";
import type { ChannelCategory } from "@/types/database";
import { cn } from "@/lib/utils";

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
  const [categories, setCategories] = useState<ChannelCategory[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const router = useRouter();

  // Load categories when dialog opens
  useEffect(() => {
    if (open) {
      loadCategories();
    } else {
      // Reset state when dialog closes
      setSelectedCategoryIds([]);
      setNewCategoryName("");
      setUrlInput("");
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [open]);

  const loadCategories = async () => {
    const result = await getUserCategories();
    if (result.categories) {
      setCategories(result.categories);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    setIsCreatingCategory(true);
    try {
      const result = await createCategory(newCategoryName.trim());
      if (result.error) {
        toast.error(result.error);
      } else if (result.category) {
        setCategories((prev) => [...prev, result.category!].sort((a, b) => a.name.localeCompare(b.name)));
        setSelectedCategoryIds((prev) => [...prev, result.category!.id]);
        setNewCategoryName("");
        toast.success(`Created category "${result.category.name}"`);
      }
    } catch {
      toast.error("Failed to create category");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAddByUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsLoading(true);
    try {
      const result = await addChannel(urlInput, selectedCategoryIds);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Added ${result.channel?.title || "channel"} to your subscriptions`);
        setUrlInput("");
        setSelectedCategoryIds([]);
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
      const result = await addChannel(channel.channelId, selectedCategoryIds);
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
                  Paste a YouTube channel URL (including /channel/, /@handle, /user/, or /c/), a handle (@username), or a channel ID
                </p>
              </div>

              {/* Category Selection */}
              <CategorySelector
                categories={categories}
                selectedCategoryIds={selectedCategoryIds}
                onToggleCategory={toggleCategory}
                newCategoryName={newCategoryName}
                onNewCategoryNameChange={setNewCategoryName}
                onCreateCategory={handleCreateCategory}
                isCreatingCategory={isCreatingCategory}
              />

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

            {/* Category Selection for Search Tab */}
            <div className="mt-4">
              <CategorySelector
                categories={categories}
                selectedCategoryIds={selectedCategoryIds}
                onToggleCategory={toggleCategory}
                newCategoryName={newCategoryName}
                onNewCategoryNameChange={setNewCategoryName}
                onCreateCategory={handleCreateCategory}
                isCreatingCategory={isCreatingCategory}
              />
            </div>

            <AnimatePresence mode="wait">
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4"
                >
                  <ScrollArea className="h-[250px]">
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

interface CategorySelectorProps {
  categories: ChannelCategory[];
  selectedCategoryIds: string[];
  onToggleCategory: (categoryId: string) => void;
  newCategoryName: string;
  onNewCategoryNameChange: (name: string) => void;
  onCreateCategory: () => void;
  isCreatingCategory: boolean;
}

function CategorySelector({
  categories,
  selectedCategoryIds,
  onToggleCategory,
  newCategoryName,
  onNewCategoryNameChange,
  onCreateCategory,
  isCreatingCategory,
}: CategorySelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Tag className="w-4 h-4" />
        Categories (optional)
      </Label>

      {/* Selected categories */}
      {selectedCategoryIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategoryIds.map((id) => {
            const category = categories.find((c) => c.id === id);
            if (!category) return null;
            return (
              <Badge
                key={id}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/20 transition-colors"
                onClick={() => onToggleCategory(id)}
              >
                {category.name}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            );
          })}
        </div>
      )}

      {/* Available categories */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories
            .filter((c) => !selectedCategoryIds.includes(c.id))
            .map((category) => (
              <Badge
                key={category.id}
                variant="outline"
                className={cn(
                  "cursor-pointer transition-colors hover:bg-primary/10"
                )}
                onClick={() => onToggleCategory(category.id)}
              >
                <Plus className="w-3 h-3 mr-1" />
                {category.name}
              </Badge>
            ))}
        </div>
      )}

      {/* Quick create category */}
      <div className="flex gap-2">
        <Input
          placeholder="Create new category..."
          value={newCategoryName}
          onChange={(e) => onNewCategoryNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onCreateCategory();
            }
          }}
          disabled={isCreatingCategory}
          className="h-8 text-sm"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCreateCategory}
          disabled={isCreatingCategory || !newCategoryName.trim()}
          className="h-8"
        >
          {isCreatingCategory ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
