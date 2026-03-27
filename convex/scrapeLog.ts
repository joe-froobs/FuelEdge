import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const log = mutation({
  args: {
    source: v.string(),
    date: v.string(),
    status: v.string(),
    recordCount: v.number(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("scrapeLog", {
      ...args,
      scrapedAt: new Date().toISOString(),
    });
  },
});

export const getRecent = query({
  handler: async (ctx) => {
    const logs = await ctx.db
      .query("scrapeLog")
      .order("desc")
      .take(20);
    return logs;
  },
});

export const getLastScrape = query({
  args: { source: v.string() },
  handler: async (ctx, { source }) => {
    return await ctx.db
      .query("scrapeLog")
      .withIndex("by_source_date", (q) => q.eq("source", source))
      .order("desc")
      .first();
  },
});
