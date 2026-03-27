/**
 * NSW FuelCheck API Fetcher
 *
 * Fetches real-time retail fuel prices from 2,500+ service stations in NSW + Tasmania.
 *
 * Source: https://api.nsw.gov.au/Product/Index/22
 * Format: JSON REST API
 * Auth: API Key → OAuth 2.0 token
 * Rate limit: 5 calls/min (free tier), 2,500 calls/month
 * Coverage: NSW + Tasmania (v2 endpoints)
 */

export interface NswRetailPrice {
  date: string;
  stationName: string;
  brand: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  lat: number;
  lng: number;
  fuelType: string;
  priceCpl: number;
  source: "nsw_fuelcheck";
}

interface FuelCheckStation {
  code: string;
  name: string;
  brand: string;
  address: string;
  suburb?: string;
  postcode?: string;
  state?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface FuelCheckPrice {
  stationcode: string;
  fueltype: string;
  price: number;
  lastupdated?: string;
}

interface FuelCheckReference {
  stations: {
    stations: FuelCheckStation[];
  };
  fueltypes: {
    fueltypes: { code: string; name: string }[];
  };
}

const BASE_URL = "https://api.nsw.gov.au";
const FUEL_TYPE_MAP: Record<string, string> = {
  E10: "E10",
  U91: "ULP",
  P95: "PULP 95",
  P98: "PULP 98",
  DL: "Diesel",
  PDL: "Diesel",
  LPG: "LPG",
  EV: "EV",
  B20: "B20",
};

export async function fetchNswFuelCheck(apiKey: string, apiSecret: string): Promise<NswRetailPrice[]> {
  // Step 1: Get OAuth token
  const token = await getAccessToken(apiKey, apiSecret);

  // Step 2: Get reference data (stations list)
  const reference = await getReference(token, apiKey);

  // Step 3: Get all current prices
  const prices = await getAllPrices(token, apiKey);

  // Step 4: Join stations with prices
  const stationMap = new Map<string, FuelCheckStation>();
  for (const station of reference.stations.stations) {
    stationMap.set(station.code, station);
  }

  const today = new Date().toISOString().split("T")[0];
  const records: NswRetailPrice[] = [];

  for (const price of prices) {
    const station = stationMap.get(price.stationcode);
    if (!station) continue;

    const fuelType = FUEL_TYPE_MAP[price.fueltype] || price.fueltype;
    if (!fuelType || fuelType === "EV" || fuelType === "LPG") continue;

    records.push({
      date: today,
      stationName: station.name,
      brand: station.brand,
      address: station.address,
      suburb: station.suburb || "",
      state: station.state || "NSW",
      postcode: station.postcode || "",
      lat: station.location?.latitude || 0,
      lng: station.location?.longitude || 0,
      fuelType,
      priceCpl: price.price,
      source: "nsw_fuelcheck",
    });
  }

  return records;
}

async function getAccessToken(apiKey: string, apiSecret: string): Promise<string> {
  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  const response = await fetch(`${BASE_URL}/oauth/client_credential/accesstoken?grant_type=client_credentials`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  if (!response.ok) {
    throw new Error(`NSW FuelCheck auth failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function getReference(token: string, apiKey: string): Promise<FuelCheckReference> {
  const response = await fetch(`${BASE_URL}/v2/fuel/reference`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: apiKey,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`NSW FuelCheck reference fetch failed: ${response.status}`);
  }

  return await response.json();
}

async function getAllPrices(token: string, apiKey: string): Promise<FuelCheckPrice[]> {
  const response = await fetch(`${BASE_URL}/v2/fuel/prices`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: apiKey,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`NSW FuelCheck prices fetch failed: ${response.status}`);
  }

  const data = await response.json();
  return data.prices || [];
}
