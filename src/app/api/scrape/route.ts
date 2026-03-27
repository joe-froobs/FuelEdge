import { NextRequest, NextResponse } from "next/server";
import { fetchAipTgp } from "@/lib/fetchers/aip-tgp";
import { fetchWaFuelWatch } from "@/lib/fetchers/wa-fuelwatch";
import { ScrapeResult } from "@/lib/fetchers";
import { getConvexClient } from "@/lib/convex-client";
import { api } from "../../../../convex/_generated/api";

/**
 * POST /api/scrape
 *
 * Triggers data scraping from all sources and stores in Convex.
 * Called daily by Vercel Cron Job (10pm AEST / 12pm UTC).
 *
 * Query params:
 *   ?source=aip|wa|all (default: all)
 *   ?store=true|false (default: true) — whether to store in Convex
 *
 * Auth: Requires CRON_SECRET header in production.
 */
export async function POST(request: NextRequest) {
  // Verify auth in production
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const source = request.nextUrl.searchParams.get("source") || "all";
  const shouldStore = request.nextUrl.searchParams.get("store") !== "false";
  const results: ScrapeResult[] = [];
  const convex = shouldStore ? getConvexClient() : null;

  // Fetch AIP TGP data (wholesale prices)
  if (source === "all" || source === "aip") {
    try {
      const records = await fetchAipTgp();

      // Only store last 90 days to avoid overwhelming Convex on first run
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);
      const cutoff = cutoffDate.toISOString().split("T")[0];
      const recentRecords = records.filter((r) => r.date >= cutoff);

      if (convex && recentRecords.length > 0) {
        // Store in batches of 200 to stay within Convex limits
        for (let i = 0; i < recentRecords.length; i += 200) {
          const batch = recentRecords.slice(i, i + 200);
          await convex.mutation(api.tgpPrices.storeBatch, { prices: batch });
        }

        await convex.mutation(api.scrapeLog.log, {
          source: "aip",
          date: new Date().toISOString().split("T")[0],
          status: "success",
          recordCount: recentRecords.length,
        });
      }

      results.push({
        source: "aip",
        status: "success",
        recordCount: recentRecords.length,
      });
      console.log(`AIP: Fetched ${records.length} total, stored ${recentRecords.length} recent TGP records`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      results.push({ source: "aip", status: "error", recordCount: 0, errorMessage: msg });

      if (convex) {
        await convex.mutation(api.scrapeLog.log, {
          source: "aip",
          date: new Date().toISOString().split("T")[0],
          status: "error",
          recordCount: 0,
          errorMessage: msg,
        });
      }
      console.error("AIP fetch failed:", msg);
    }
  }

  // Fetch WA FuelWatch data (retail prices)
  if (source === "all" || source === "wa") {
    try {
      const records = await fetchWaFuelWatch();

      if (convex && records.length > 0) {
        for (let i = 0; i < records.length; i += 200) {
          const batch = records.slice(i, i + 200);
          await convex.mutation(api.retailPrices.storeBatch, { prices: batch });
        }

        await convex.mutation(api.scrapeLog.log, {
          source: "wa_fuelwatch",
          date: new Date().toISOString().split("T")[0],
          status: "success",
          recordCount: records.length,
        });
      }

      results.push({ source: "wa_fuelwatch", status: "success", recordCount: records.length });
      console.log(`WA FuelWatch: Fetched and stored ${records.length} retail records`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      results.push({ source: "wa_fuelwatch", status: "error", recordCount: 0, errorMessage: msg });

      if (convex) {
        await convex.mutation(api.scrapeLog.log, {
          source: "wa_fuelwatch",
          date: new Date().toISOString().split("T")[0],
          status: "error",
          recordCount: 0,
          errorMessage: msg,
        });
      }
      console.error("WA FuelWatch fetch failed:", msg);
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    stored: shouldStore,
    results,
  });
}

// Support GET for easy testing
export async function GET(request: NextRequest) {
  return POST(request);
}
