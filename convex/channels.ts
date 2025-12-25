import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

// Get all channels for the current user
export const getUserChannels = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("channels")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Add a new channel
export const addChannel = mutation({
  args: {
    channelId: v.string(),
    title: v.string(),
    thumbnail: v.string(),
    description: v.optional(v.string()),
    subscriberCount: v.optional(v.string()),
    customUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if channel already exists for this user
    const existing = await ctx.db
      .query("channels")
      .withIndex("by_user_and_channel", (q) => 
        q.eq("userId", userId).eq("channelId", args.channelId)
      )
      .first();

    if (existing) {
      throw new Error("Channel already added");
    }

    return await ctx.db.insert("channels", {
      userId,
      channelId: args.channelId,
      title: args.title,
      thumbnail: args.thumbnail,
      description: args.description,
      subscriberCount: args.subscriberCount,
      customUrl: args.customUrl,
      addedAt: Date.now(),
    });
  },
});

// Remove a channel
export const removeChannel = mutation({
  args: { id: v.id("channels") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const channel = await ctx.db.get(args.id);
    if (!channel || channel.userId !== userId) {
      throw new Error("Channel not found or unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});

// Get channel count for user
export const getChannelCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return 0;
    
    const channels = await ctx.db
      .query("channels")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    return channels.length;
  },
});

