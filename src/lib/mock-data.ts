import {
  TerminalGatePrice,
  PriceComparison,
  PriceAlert,
  Supplier,
  Terminal,
  FuelType,
  MarginAnalysis,
} from "./types";

const suppliers: Supplier[] = ["Ampol", "BP", "Viva Energy", "ExxonMobil"];
const terminals: Terminal[] = [
  "Sydney",
  "Melbourne",
  "Brisbane",
  "Adelaide",
  "Perth",
  "Darwin",
  "Hobart",
];
const fuelTypes: FuelType[] = ["ULP", "Diesel", "PULP 95", "PULP 98"];

// Base prices per fuel type (cpl)
const basePrices: Record<FuelType, number> = {
  ULP: 155,
  Diesel: 168,
  "PULP 95": 167,
  "PULP 98": 178,
  E10: 152,
};

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generatePrice(
  base: number,
  supplierIdx: number,
  terminalIdx: number,
  dayOffset: number
): number {
  const seed = supplierIdx * 1000 + terminalIdx * 100 + dayOffset;
  const variation = (seededRandom(seed) - 0.5) * 8; // +/- 4 cpl variation
  const supplierPremium = supplierIdx * 0.7; // each supplier slightly different
  const terminalAdjust = terminalIdx * 0.3; // location adjustments
  return Math.round((base + variation + supplierPremium + terminalAdjust) * 10) / 10;
}

export function generateHistoricalPrices(days: number = 30): TerminalGatePrice[] {
  const prices: TerminalGatePrice[] = [];
  const today = new Date();

  for (let d = 0; d < days; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split("T")[0];

    for (let si = 0; si < suppliers.length; si++) {
      for (let ti = 0; ti < terminals.length; ti++) {
        for (const ft of fuelTypes) {
          prices.push({
            id: `${dateStr}-${suppliers[si]}-${terminals[ti]}-${ft}`,
            date: dateStr,
            supplier: suppliers[si],
            terminal: terminals[ti],
            fuelType: ft,
            priceCpl: generatePrice(basePrices[ft], si, ti, d),
          });
        }
      }
    }
  }

  return prices;
}

export function getTodayComparisons(): PriceComparison[] {
  const comparisons: PriceComparison[] = [];
  const today = new Date().toISOString().split("T")[0];

  for (const terminal of terminals) {
    for (const ft of fuelTypes) {
      const ti = terminals.indexOf(terminal);
      const prices = suppliers.map((supplier, si) => {
        const todayPrice = generatePrice(basePrices[ft], si, ti, 0);
        const yesterdayPrice = generatePrice(basePrices[ft], si, ti, 1);
        return {
          supplier,
          priceCpl: todayPrice,
          changeFromYesterday: Math.round((todayPrice - yesterdayPrice) * 10) / 10,
        };
      });

      prices.sort((a, b) => a.priceCpl - b.priceCpl);

      comparisons.push({
        terminal,
        fuelType: ft,
        date: today,
        prices,
        cheapest: prices[0].supplier,
        spread: Math.round((prices[prices.length - 1].priceCpl - prices[0].priceCpl) * 10) / 10,
      });
    }
  }

  return comparisons;
}

export function getMarginAnalysis(): MarginAnalysis[] {
  const margins: MarginAnalysis[] = [];
  const retailPremium: Record<FuelType, number> = {
    ULP: 18,
    Diesel: 15,
    "PULP 95": 20,
    "PULP 98": 22,
    E10: 16,
  };

  for (const terminal of terminals) {
    for (const ft of fuelTypes) {
      const ti = terminals.indexOf(terminal);
      const avgWholesale =
        suppliers.reduce((sum, _, si) => sum + generatePrice(basePrices[ft], si, ti, 0), 0) /
        suppliers.length;
      const avgRetail = avgWholesale + retailPremium[ft] + (seededRandom(ti * 10 + fuelTypes.indexOf(ft)) - 0.5) * 6;

      margins.push({
        terminal,
        fuelType: ft,
        wholesaleCpl: Math.round(avgWholesale * 10) / 10,
        avgRetailCpl: Math.round(avgRetail * 10) / 10,
        marginCpl: Math.round((avgRetail - avgWholesale) * 10) / 10,
      });
    }
  }

  return margins;
}

export function getAlerts(): PriceAlert[] {
  return [
    {
      id: "1",
      type: "price_drop",
      message: "BP dropped ULP by 2.3 cpl at Sydney terminal",
      terminal: "Sydney",
      fuelType: "ULP",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false,
    },
    {
      id: "2",
      type: "new_cheapest",
      message: "Viva Energy is now cheapest for Diesel in Melbourne (164.2 cpl)",
      terminal: "Melbourne",
      fuelType: "Diesel",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: false,
    },
    {
      id: "3",
      type: "spread_widened",
      message: "Diesel spread in Brisbane widened to 5.8 cpl — shop around",
      terminal: "Brisbane",
      fuelType: "Diesel",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      read: true,
    },
    {
      id: "4",
      type: "price_drop",
      message: "Ampol dropped PULP 95 by 1.8 cpl at Perth terminal",
      terminal: "Perth",
      fuelType: "PULP 95",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      read: true,
    },
  ];
}

export function getPriceTrend(
  terminal: Terminal,
  fuelType: FuelType,
  days: number = 30
): { date: string; [supplier: string]: number | string }[] {
  const trend: { date: string; [supplier: string]: number | string }[] = [];
  const today = new Date();
  const ti = terminals.indexOf(terminal);

  for (let d = days - 1; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split("T")[0];

    const point: { date: string; [supplier: string]: number | string } = { date: dateStr };
    for (let si = 0; si < suppliers.length; si++) {
      point[suppliers[si]] = generatePrice(basePrices[fuelType], si, ti, d);
    }
    trend.push(point);
  }

  return trend;
}
