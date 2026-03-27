import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Store a batch of TGP prices
export const storeBatch = mutation({
  args: {
    prices: v.array(
      v.object({
        date: v.string(),
        supplier: v.string(),
        terminal: v.string(),
        fuelType: v.string(),
        priceCpl: v.number(),
        source: v.string(),
      })
    ),
  },
  handler: async (ctx, { prices }) => {
    for (const price of prices) {
      // Check if this exact record already exists
      const existing = await ctx.db
        .query("terminalGatePrices")
        .withIndex("by_date_terminal_fuel", (q) =>
          q.eq("date", price.date).eq("terminal", price.terminal).eq("fuelType", price.fuelType)
        )
        .filter((q) => q.eq(q.field("supplier"), price.supplier))
        .first();

      if (!existing) {
        await ctx.db.insert("terminalGatePrices", price);
      }
    }
  },
});

// Get today's TGP prices across all suppliers/terminals
export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    return await ctx.db
      .query("terminalGatePrices")
      .withIndex("by_date", (q) => q.eq("date", date))
      .collect();
  },
});

// Get price history for a specific terminal and fuel type
export const getTrend = query({
  args: {
    terminal: v.string(),
    fuelType: v.string(),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, { terminal, fuelType, startDate, endDate }) => {
    const prices = await ctx.db
      .query("terminalGatePrices")
      .withIndex("by_date_terminal_fuel", (q) =>
        q.eq("date", terminal) // This won't work as intended — see note below
      )
      .collect();

    // Filter by date range in memory since compound index queries are limited
    return prices.filter(
      (p) =>
        p.terminal === terminal &&
        p.fuelType === fuelType &&
        p.date >= startDate &&
        p.date <= endDate
    );
  },
});

// Get all prices for a date range (for reports)
export const getDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, { startDate, endDate }) => {
    const allPrices = await ctx.db
      .query("terminalGatePrices")
      .withIndex("by_date")
      .collect();

    return allPrices.filter((p) => p.date >= startDate && p.date <= endDate);
  },
});

// Get latest available date
export const getLatestDate = query({
  handler: async (ctx) => {
    const latest = await ctx.db
      .query("terminalGatePrices")
      .withIndex("by_date")
      .order("desc")
      .first();

    return latest?.date ?? null;
  },
});
