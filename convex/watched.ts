import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

// Mark a video as watched
export const markAsWatched = mutation({
  args: {
    videoId: v.string(),
    channelId: v.string(),
    progress: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if already watched
    const existing = await ctx.db
      .query("watchedVideos")
      .withIndex("by_user_and_video", (q) => 
        q.eq("userId", userId).eq("videoId", args.videoId)
      )
      .first();

    if (existing) {
      // Update the watched time and progress
      await ctx.db.patch(existing._id, {
        watchedAt: Date.now(),
        progress: args.progress,
      });
      return existing._id;
    }

    return await ctx.db.insert("watchedVideos", {
      userId,
      videoId: args.videoId,
      channelId: args.channelId,
      watchedAt: Date.now(),
      progress: args.progress,
    });
  },
});

// Update video progress (for resume feature)
export const updateProgress = mutation({
  args: {
    videoId: v.string(),
    channelId: v.string(),
    progress: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("watchedVideos")
      .withIndex("by_user_and_video", (q) => 
        q.eq("userId", userId).eq("videoId", args.videoId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { progress: args.progress });
      return existing._id;
    }

    return await ctx.db.insert("watchedVideos", {
      userId,
      videoId: args.videoId,
      channelId: args.channelId,
      watchedAt: Date.now(),
      progress: args.progress,
    });
  },
});

// Get all watched videos for current user
export const getWatchedVideos = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("watchedVideos")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Check if a specific video is watched
export const isVideoWatched = query({
  args: { videoId: v.string() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return false;

    const watched = await ctx.db
      .query("watchedVideos")
      .withIndex("by_user_and_video", (q) => 
        q.eq("userId", userId).eq("videoId", args.videoId)
      )
      .first();

    return !!watched;
  },
});

// Get watched video IDs (for bulk checking)
export const getWatchedVideoIds = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    const watched = await ctx.db
      .query("watchedVideos")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return watched.map((w) => w.videoId);
  },
});

// Get video progress for resume
export const getVideoProgress = query({
  args: { videoId: v.string() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const watched = await ctx.db
      .query("watchedVideos")
      .withIndex("by_user_and_video", (q) => 
        q.eq("userId", userId).eq("videoId", args.videoId)
      )
      .first();

    return watched?.progress ?? null;
  },
});

// Unmark video as watched
export const unmarkAsWatched = mutation({
  args: { videoId: v.string() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const watched = await ctx.db
      .query("watchedVideos")
      .withIndex("by_user_and_video", (q) => 
        q.eq("userId", userId).eq("videoId", args.videoId)
      )
      .first();

    if (watched) {
      await ctx.db.delete(watched._id);
    }
  },
});

