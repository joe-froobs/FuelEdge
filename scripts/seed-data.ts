/**
 * Seed script: Fetches real data from AIP and WA FuelWatch,
 * then stores it in Convex.
 *
 * Run with: npx tsx scripts/seed-data.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { fetchAipTgp } from "../src/lib/fetchers/aip-tgp";
import { fetchWaFuelWatch } from "../src/lib/fetchers/wa-fuelwatch";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
  console.error("NEXT_PUBLIC_CONVEX_URL not found in .env.local");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function seedAipData() {
  console.log("Fetching AIP TGP data...");
  const records = await fetchAipTgp();
  console.log(`Total AIP records: ${records.length}`);

  // Store last 90 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  const recent = records.filter((r) => r.date >= cutoffStr);
  console.log(`Storing ${recent.length} records from last 90 days...`);

  // Store in batches
  const batchSize = 100;
  for (let i = 0; i < recent.length; i += batchSize) {
    const batch = recent.slice(i, i + batchSize);
    await client.mutation(api.tgpPrices.storeBatch, { prices: batch });
    process.stdout.write(`\r  Stored ${Math.min(i + batchSize, recent.length)}/${recent.length}`);
  }
  console.log("\n  AIP data loaded.");

  await client.mutation(api.scrapeLog.log, {
    source: "aip",
    date: new Date().toISOString().split("T")[0],
    status: "success",
    recordCount: recent.length,
  });
}

async function seedWaData() {
  console.log("Fetching WA FuelWatch data...");
  const records = await fetchWaFuelWatch();
  console.log(`Total WA records: ${records.length}`);

  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await client.mutation(api.retailPrices.storeBatch, { prices: batch });
    process.stdout.write(`\r  Stored ${Math.min(i + batchSize, records.length)}/${records.length}`);
  }
  console.log("\n  WA FuelWatch data loaded.");

  await client.mutation(api.scrapeLog.log, {
    source: "wa_fuelwatch",
    date: new Date().toISOString().split("T")[0],
    status: "success",
    recordCount: records.length,
  });
}

async function main() {
  console.log("=== FuelEdge Data Seed ===");
  console.log(`Convex URL: ${CONVEX_URL}`);
  console.log("");

  await seedAipData();
  console.log("");
  await seedWaData();

  console.log("\nDone! Check your Convex dashboard to verify.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
