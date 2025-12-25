"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { MoreVertical, Trash2, RefreshCw, ExternalLink, Users, Video, Loader2 } from "lucide-react";
import { removeChannel, refreshChannelVideos } from "@/app/actions/channels";
import { formatSubscriberCount } from "@/lib/youtube";

interface ChannelCardProps {
  subscription: {
    id: string;
    channel_id: string;
    category: string | null;
    created_at: string | null;
    youtube_channels: {
      channel_id: string;
      title: string;
      description: string | null;
      thumbnail_url: string | null;
      subscriber_count: string | null;
      video_count: string | null;
      custom_url: string | null;
    } | null;
  };
  index: number;
}

export function ChannelCard({ subscription, index }: ChannelCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const channel = subscription.youtube_channels;

  if (!channel) return null;

  const handleRemove = async () => {
    if (isRemoving) return;
    
    setIsRemoving(true);
    try {
      const result = await removeChannel(subscription.channel_id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Removed ${channel.title} from your subscriptions`);
        router.refresh();
      }
    } catch {
      toast.error("Failed to remove channel");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      const result = await refreshChannelVideos(subscription.channel_id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Refreshed ${result.count} videos from ${channel.title}`);
        router.refresh();
      }
    } catch {
      toast.error("Failed to refresh videos");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className="group relative overflow-hidden border-border/50 bg-card/50 hover:bg-card hover:border-border transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 rounded-xl flex-shrink-0">
              <AvatarImage src={channel.thumbnail_url || undefined} alt={channel.title} />
              <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-lg">
                {channel.title[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{channel.title}</h3>
                  {channel.custom_url && (
                    <p className="text-sm text-muted-foreground">@{channel.custom_url.replace("@", "")}</p>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleRefresh} disabled={isRefreshing}>
                      {isRefreshing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Refresh Videos
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a
                        href={`https://youtube.com/channel/${channel.channel_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View on YouTube
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleRemove}
                      disabled={isRemoving}
                      className="text-destructive focus:text-destructive"
                    >
                      {isRemoving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Remove Channel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {channel.subscriber_count && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {formatSubscriberCount(channel.subscriber_count)}
                  </span>
                )}
                {channel.video_count && (
                  <span className="flex items-center gap-1">
                    <Video className="w-3.5 h-3.5" />
                    {parseInt(channel.video_count).toLocaleString()} videos
                  </span>
                )}
              </div>

              {channel.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {channel.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

