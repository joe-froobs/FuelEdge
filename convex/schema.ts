import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Wholesale Terminal Gate Prices (from AIP)
  terminalGatePrices: defineTable({
    date: v.string(), // YYYY-MM-DD
    supplier: v.string(), // "Ampol" | "BP" | "Viva Energy" | "ExxonMobil"
    terminal: v.string(), // "Sydney" | "Melbourne" | etc.
    fuelType: v.string(), // "ULP" | "Diesel"
    priceCpl: v.number(), // cents per litre
    source: v.string(), // "aip"
  })
    .index("by_date", ["date"])
    .index("by_date_terminal_fuel", ["date", "terminal", "fuelType"])
    .index("by_supplier_terminal_fuel", ["supplier", "terminal", "fuelType"]),

  // Retail prices (from NSW FuelCheck, WA FuelWatch, QLD)
  retailPrices: defineTable({
    date: v.string(), // YYYY-MM-DD
    stationName: v.string(),
    brand: v.string(),
    address: v.string(),
    suburb: v.string(),
    state: v.string(), // "NSW" | "WA" | "QLD" | "TAS"
    postcode: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    fuelType: v.string(),
    priceCpl: v.number(),
    source: v.string(), // "nsw_fuelcheck" | "wa_fuelwatch" | "qld"
  })
    .index("by_date_state", ["date", "state"])
    .index("by_date_state_fuel", ["date", "state", "fuelType"])
    .index("by_suburb", ["suburb", "fuelType"]),

  // Scrape log to track when we last fetched each source
  scrapeLog: defineTable({
    source: v.string(),
    date: v.string(),
    status: v.string(), // "success" | "error"
    recordCount: v.number(),
    errorMessage: v.optional(v.string()),
    scrapedAt: v.string(), // ISO timestamp
  }).index("by_source_date", ["source", "date"]),
});
