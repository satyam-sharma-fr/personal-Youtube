import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  
  // User's saved channels
  channels: defineTable({
    userId: v.id("users"),
    channelId: v.string(), // YouTube channel ID
    title: v.string(),
    thumbnail: v.string(),
    description: v.optional(v.string()),
    subscriberCount: v.optional(v.string()),
    customUrl: v.optional(v.string()), // @handle
    addedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_channel", ["userId", "channelId"]),

  // Videos marked as watched
  watchedVideos: defineTable({
    userId: v.id("users"),
    videoId: v.string(), // YouTube video ID
    channelId: v.string(),
    watchedAt: v.number(),
    progress: v.optional(v.number()), // Video progress in seconds (for resume)
  })
    .index("by_user", ["userId"])
    .index("by_user_and_video", ["userId", "videoId"]),
});

export default schema;

