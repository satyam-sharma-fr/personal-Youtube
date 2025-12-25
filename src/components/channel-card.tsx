"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Users, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ChannelCardProps {
  channel: {
    _id: Id<"channels">;
    channelId: string;
    title: string;
    thumbnail: string;
    description?: string;
    subscriberCount?: string;
    customUrl?: string;
  };
}

export function ChannelCard({ channel }: ChannelCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const removeChannel = useMutation(api.channels.removeChannel);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await removeChannel({ id: channel._id });
      toast.success(`Removed ${channel.title}`);
    } catch (error) {
      toast.error("Failed to remove channel");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const openYouTube = () => {
    const url = channel.customUrl 
      ? `https://youtube.com/${channel.customUrl}`
      : `https://youtube.com/channel/${channel.channelId}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -4 }}
        className="group relative bg-card border rounded-xl p-4 hover:border-primary/50 transition-all"
      >
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 border-2 border-background shadow-md">
            <AvatarImage src={channel.thumbnail} alt={channel.title} />
            <AvatarFallback className="text-lg font-semibold">
              {channel.title.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
              {channel.title}
            </h3>
            {channel.customUrl && (
              <p className="text-sm text-muted-foreground">{channel.customUrl}</p>
            )}
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span>{channel.subscriberCount || "N/A"} subscribers</span>
            </div>
            {channel.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                {channel.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={openYouTube}
          >
            <ExternalLink className="w-4 h-4" />
            View on YouTube
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Channel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{channel.title}</strong> from your feed? 
              Videos from this channel will no longer appear in your feed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

