/**
 * Main data fetcher orchestrator.
 * Coordinates fetching from all sources and returns unified data.
 */

export { fetchAipTgp } from "./aip-tgp";
export { fetchNswFuelCheck } from "./nsw-fuelcheck";
export { fetchWaFuelWatch } from "./wa-fuelwatch";

export type DataSource = "aip" | "nsw_fuelcheck" | "wa_fuelwatch";

export interface ScrapeResult {
  source: DataSource;
  status: "success" | "error";
  recordCount: number;
  errorMessage?: string;
}
