import { NextRequest, NextResponse } from "next/server";
import { fetchAipTgp } from "@/lib/fetchers/aip-tgp";
import { fetchNswFuelCheck } from "@/lib/fetchers/nsw-fuelcheck";
import { fetchWaFuelWatch } from "@/lib/fetchers/wa-fuelwatch";
import { ScrapeResult } from "@/lib/fetchers";

/**
 * POST /api/scrape
 *
 * Triggers data scraping from all sources.
 * In production, this would be called by a Vercel Cron Job daily.
 *
 * Query params:
 *   ?source=aip|nsw|wa|all (default: all)
 *
 * Auth: Requires CRON_SECRET header to prevent unauthorized triggers.
 */
export async function POST(request: NextRequest) {
  // Verify auth
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const source = request.nextUrl.searchParams.get("source") || "all";
  const results: ScrapeResult[] = [];

  // Fetch AIP TGP data
  if (source === "all" || source === "aip") {
    try {
      const records = await fetchAipTgp();
      results.push({
        source: "aip",
        status: "success",
        recordCount: records.length,
      });

      // TODO: Store in Convex once connected
      // await convex.mutation(api.tgpPrices.storeBatch, { prices: records });

      console.log(`AIP: Fetched ${records.length} TGP records`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      results.push({
        source: "aip",
        status: "error",
        recordCount: 0,
        errorMessage: msg,
      });
      console.error("AIP fetch failed:", msg);
    }
  }

  // Fetch NSW FuelCheck data
  if (source === "all" || source === "nsw") {
    const apiKey = process.env.NSW_FUELCHECK_API_KEY;
    const apiSecret = process.env.NSW_FUELCHECK_API_SECRET;

    if (!apiKey || !apiSecret) {
      results.push({
        source: "nsw_fuelcheck",
        status: "error",
        recordCount: 0,
        errorMessage: "NSW_FUELCHECK_API_KEY and NSW_FUELCHECK_API_SECRET not set",
      });
    } else {
      try {
        const records = await fetchNswFuelCheck(apiKey, apiSecret);
        results.push({
          source: "nsw_fuelcheck",
          status: "success",
          recordCount: records.length,
        });

        // TODO: Store in Convex once connected
        // Store in batches of 500 to avoid Convex limits
        // for (let i = 0; i < records.length; i += 500) {
        //   await convex.mutation(api.retailPrices.storeBatch, {
        //     prices: records.slice(i, i + 500),
        //   });
        // }

        console.log(`NSW FuelCheck: Fetched ${records.length} retail records`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        results.push({
          source: "nsw_fuelcheck",
          status: "error",
          recordCount: 0,
          errorMessage: msg,
        });
        console.error("NSW FuelCheck fetch failed:", msg);
      }
    }
  }

  // Fetch WA FuelWatch data
  if (source === "all" || source === "wa") {
    try {
      const records = await fetchWaFuelWatch();
      results.push({
        source: "wa_fuelwatch",
        status: "success",
        recordCount: records.length,
      });

      // TODO: Store in Convex once connected

      console.log(`WA FuelWatch: Fetched ${records.length} retail records`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      results.push({
        source: "wa_fuelwatch",
        status: "error",
        recordCount: 0,
        errorMessage: msg,
      });
      console.error("WA FuelWatch fetch failed:", msg);
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    results,
  });
}

// Also support GET for easy testing in browser
export async function GET(request: NextRequest) {
  return POST(request);
}
