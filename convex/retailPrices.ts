import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const storeBatch = mutation({
  args: {
    prices: v.array(
      v.object({
        date: v.string(),
        stationName: v.string(),
        brand: v.string(),
        address: v.string(),
        suburb: v.string(),
        state: v.string(),
        postcode: v.optional(v.string()),
        lat: v.optional(v.number()),
        lng: v.optional(v.number()),
        fuelType: v.string(),
        priceCpl: v.number(),
        source: v.string(),
      })
    ),
  },
  handler: async (ctx, { prices }) => {
    // Store in batches — retail data can be large
    for (const price of prices) {
      await ctx.db.insert("retailPrices", price);
    }
  },
});

// Get retail prices for a date and state
export const getByDateState = query({
  args: {
    date: v.string(),
    state: v.string(),
    fuelType: v.optional(v.string()),
  },
  handler: async (ctx, { date, state, fuelType }) => {
    let q = ctx.db
      .query("retailPrices")
      .withIndex("by_date_state", (idx) => idx.eq("date", date).eq("state", state));

    const results = await q.collect();

    if (fuelType) {
      return results.filter((r) => r.fuelType === fuelType);
    }
    return results;
  },
});

// Get average retail price by state and fuel type for a date
export const getAverages = query({
  args: {
    date: v.string(),
    fuelType: v.string(),
  },
  handler: async (ctx, { date, fuelType }) => {
    const all = await ctx.db
      .query("retailPrices")
      .withIndex("by_date_state")
      .collect();

    const filtered = all.filter(
      (p) => p.date === date && p.fuelType === fuelType
    );

    // Group by state and average
    const byState: Record<string, { total: number; count: number }> = {};
    for (const p of filtered) {
      if (!byState[p.state]) byState[p.state] = { total: 0, count: 0 };
      byState[p.state].total += p.priceCpl;
      byState[p.state].count += 1;
    }

    return Object.entries(byState).map(([state, { total, count }]) => ({
      state,
      avgPriceCpl: Math.round((total / count) * 10) / 10,
      stationCount: count,
    }));
  },
});
