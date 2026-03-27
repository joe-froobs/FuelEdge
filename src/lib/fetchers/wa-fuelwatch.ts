/**
 * WA FuelWatch RSS Fetcher
 *
 * Fetches daily retail fuel prices from Western Australia via the FuelWatch RSS feed.
 *
 * Source: https://www.fuelwatch.wa.gov.au/fuelwatch/fuelWatchRSS
 * Format: RSS 2.0 (XML)
 * Auth: None (public)
 * Coverage: Western Australia
 * Historical: RSS is current day only. Historical data at data.gov.au.
 *
 * Product codes: 1=ULP, 2=PULP, 4=Diesel, 5=LPG, 6=98 RON, 11=Brand Diesel
 */

import { XMLParser } from "fast-xml-parser";

export interface WaRetailPrice {
  date: string;
  stationName: string;
  brand: string;
  address: string;
  suburb: string;
  state: "WA";
  postcode: string;
  lat: number;
  lng: number;
  fuelType: string;
  priceCpl: number;
  source: "wa_fuelwatch";
}

const PRODUCT_CODES: { code: number; fuelType: string }[] = [
  { code: 1, fuelType: "ULP" },
  { code: 2, fuelType: "PULP 95" },
  { code: 4, fuelType: "Diesel" },
  { code: 6, fuelType: "PULP 98" },
];

const RSS_BASE = "https://www.fuelwatch.wa.gov.au/fuelwatch/fuelWatchRSS";

export async function fetchWaFuelWatch(): Promise<WaRetailPrice[]> {
  const allRecords: WaRetailPrice[] = [];

  for (const { code, fuelType } of PRODUCT_CODES) {
    try {
      const records = await fetchProductFeed(code, fuelType);
      allRecords.push(...records);
      // Small delay between requests to be respectful
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`FuelWatch fetch failed for product ${code}:`, error);
    }
  }

  return allRecords;
}

async function fetchProductFeed(
  productCode: number,
  fuelType: string
): Promise<WaRetailPrice[]> {
  const url = `${RSS_BASE}?Product=${productCode}`;
  console.log(`Fetching WA FuelWatch: ${url}`);

  const response = await fetch(url, {
    headers: {
      "User-Agent": "FuelEdge/1.0 (fuel price aggregator)",
    },
  });

  if (!response.ok) {
    throw new Error(`FuelWatch RSS returned ${response.status}`);
  }

  const xml = await response.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });
  const parsed = parser.parse(xml);

  const channel = parsed?.rss?.channel;
  if (!channel) {
    console.warn(`No channel in FuelWatch RSS for product ${productCode}`);
    return [];
  }

  let items = channel.item;
  if (!items) return [];
  if (!Array.isArray(items)) items = [items];

  const records: WaRetailPrice[] = [];

  for (const item of items) {
    const price = parseFloat(item.price);
    if (isNaN(price) || price <= 0) continue;

    records.push({
      date: item.date || new Date().toISOString().split("T")[0],
      stationName: item["trading-name"] || item.title?.split(":")[1]?.trim() || "Unknown",
      brand: item.brand || "Unknown",
      address: item.address || "",
      suburb: item.location || "",
      state: "WA",
      postcode: "",
      lat: parseFloat(item.latitude) || 0,
      lng: parseFloat(item.longitude) || 0,
      fuelType,
      priceCpl: price,
      source: "wa_fuelwatch",
    });
  }

  return records;
}
