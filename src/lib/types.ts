export interface TerminalGatePrice {
  id: string;
  date: string; // YYYY-MM-DD
  supplier: Supplier;
  terminal: Terminal;
  fuelType: FuelType;
  priceCpl: number; // cents per litre
}

export type Supplier = "Ampol" | "BP" | "Viva Energy" | "ExxonMobil" | "United" | "Liberty";

export type Terminal =
  | "Sydney"
  | "Melbourne"
  | "Brisbane"
  | "Adelaide"
  | "Perth"
  | "Darwin"
  | "Hobart"
  | "Geelong"
  | "Lytton"
  | "Port Lincoln";

export type FuelType = "ULP" | "Diesel" | "PULP 95" | "PULP 98" | "E10";

export interface PriceComparison {
  terminal: Terminal;
  fuelType: FuelType;
  date: string;
  prices: {
    supplier: Supplier;
    priceCpl: number;
    changeFromYesterday: number;
  }[];
  cheapest: Supplier;
  spread: number; // difference between cheapest and most expensive
}

export interface RetailPrice {
  stationName: string;
  brand: string;
  address: string;
  suburb: string;
  state: string;
  lat: number;
  lng: number;
  fuelType: FuelType;
  priceCpl: number;
  lastUpdated: string;
}

export interface MarginAnalysis {
  terminal: Terminal;
  fuelType: FuelType;
  wholesaleCpl: number;
  avgRetailCpl: number;
  marginCpl: number;
}

export interface PriceAlert {
  id: string;
  type: "price_drop" | "spread_widened" | "new_cheapest";
  message: string;
  terminal: Terminal;
  fuelType: FuelType;
  timestamp: string;
  read: boolean;
}
