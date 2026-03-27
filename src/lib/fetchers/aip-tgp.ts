/**
 * AIP Terminal Gate Price Fetcher
 *
 * Fetches wholesale TGP data from the Australian Institute of Petroleum.
 * AIP publishes daily Excel files with average TGPs from BP, Ampol,
 * Viva Energy, and ExxonMobil across all capital city terminals.
 *
 * Source: https://www.aip.com.au/pricing/terminal-gate-prices
 * Format: Excel (.xlsx)
 * Auth: None (public)
 * Update: Weekdays
 */

import * as XLSX from "xlsx";

export interface AipTgpRecord {
  date: string;
  supplier: string;
  terminal: string;
  fuelType: string;
  priceCpl: number;
  source: "aip";
}

const TERMINALS = ["Sydney", "Melbourne", "Brisbane", "Adelaide", "Perth", "Darwin", "Hobart"];
const FUEL_TYPES = ["ULP", "Diesel"];

/**
 * Fetch and parse today's AIP TGP Excel file.
 * Falls back to the undocumented API endpoint if the Excel download fails.
 */
export async function fetchAipTgp(): Promise<AipTgpRecord[]> {
  // Try the undocumented JSON API first (faster, cleaner)
  try {
    const apiRecords = await fetchFromApi();
    if (apiRecords.length > 0) return apiRecords;
  } catch {
    console.log("AIP API not available, falling back to Excel download");
  }

  // Fallback: download and parse the Excel file
  return await fetchFromExcel();
}

async function fetchFromApi(): Promise<AipTgpRecord[]> {
  const response = await fetch("https://api.aip.com.au/public/tgpTables", {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) throw new Error(`AIP API returned ${response.status}`);

  const data = await response.json();
  const records: AipTgpRecord[] = [];

  // Parse the API response — structure may vary, handle gracefully
  if (Array.isArray(data)) {
    for (const entry of data) {
      const date = entry.date || new Date().toISOString().split("T")[0];
      const terminal = entry.location || entry.terminal;
      const supplier = entry.supplier || entry.company;

      if (!terminal || !supplier) continue;

      for (const ft of FUEL_TYPES) {
        const priceKey = ft === "ULP" ? "ulp" : "diesel";
        const price = parseFloat(entry[priceKey] || entry[ft.toLowerCase()]);
        if (!isNaN(price) && price > 0) {
          records.push({
            date,
            supplier: String(supplier),
            terminal: String(terminal),
            fuelType: ft,
            priceCpl: Math.round(price * 10) / 10,
            source: "aip",
          });
        }
      }
    }
  }

  return records;
}

async function fetchFromExcel(): Promise<AipTgpRecord[]> {
  // Construct the download URL with today's date
  const today = new Date();
  const months = [
    "01", "02", "03", "04", "05", "06",
    "07", "08", "09", "10", "11", "12",
  ];
  const dateStr = `${today.getDate()}-${
    ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][today.getMonth()]
  }-${today.getFullYear()}`;
  const monthStr = `${today.getFullYear()}-${months[today.getMonth()]}`;

  const url = `https://www.aip.com.au/sites/default/files/download-files/${monthStr}/AIP_TGP_Data_${dateStr}.xlsx`;

  console.log(`Fetching AIP TGP Excel from: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    // Try yesterday's date (weekends/holidays won't have a file)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yDateStr = `${yesterday.getDate()}-${
      ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][yesterday.getMonth()]
    }-${yesterday.getFullYear()}`;
    const yMonthStr = `${yesterday.getFullYear()}-${months[yesterday.getMonth()]}`;
    const yUrl = `https://www.aip.com.au/sites/default/files/download-files/${yMonthStr}/AIP_TGP_Data_${yDateStr}.xlsx`;

    console.log(`Today's file not found, trying yesterday: ${yUrl}`);
    const yResponse = await fetch(yUrl);
    if (!yResponse.ok) {
      throw new Error(`AIP Excel download failed for both today and yesterday`);
    }
    return parseExcel(await yResponse.arrayBuffer());
  }

  return parseExcel(await response.arrayBuffer());
}

function parseExcel(buffer: ArrayBuffer): AipTgpRecord[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const records: AipTgpRecord[] = [];

  // AIP Excel structure:
  // Sheets: "Petrol TGP", "Diesel TGP"
  // Row 0: Header — col 0 = label, cols 1-7 = terminal names, col 8 = national avg
  // Row 1+: col 0 = Excel date serial, cols 1-7 = average TGP (cpl) per terminal
  const sheetConfigs: { sheetName: string; fuelType: string }[] = [
    { sheetName: "Petrol TGP", fuelType: "ULP" },
    { sheetName: "Diesel TGP", fuelType: "Diesel" },
  ];

  for (const { sheetName, fuelType } of sheetConfigs) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
      header: 1,
      defval: null,
    });

    if (rows.length < 2) continue;

    // Column indices: 0=date, 1=Sydney, 2=Melbourne, 3=Brisbane, 4=Adelaide, 5=Perth, 6=Darwin, 7=Hobart
    const terminalCols = [
      { idx: 1, terminal: "Sydney" },
      { idx: 2, terminal: "Melbourne" },
      { idx: 3, terminal: "Brisbane" },
      { idx: 4, terminal: "Adelaide" },
      { idx: 5, terminal: "Perth" },
      { idx: 6, terminal: "Darwin" },
      { idx: 7, terminal: "Hobart" },
    ];

    // Skip header row (index 0), process data rows
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || !row[0]) continue;

      // Column 0 is an Excel date serial number
      const dateSerial = row[0];
      if (typeof dateSerial !== "number") continue;

      const date = excelDateToString(dateSerial);
      if (!date) continue;

      for (const { idx, terminal } of terminalCols) {
        const price = row[idx];
        if (typeof price !== "number" || price <= 0 || price > 500) continue;

        records.push({
          date,
          supplier: "Average", // AIP publishes the average across all 4 majors
          terminal,
          fuelType,
          priceCpl: Math.round(price * 10) / 10,
          source: "aip",
        });
      }
    }
  }

  return records;
}

function excelDateToString(serial: number): string | null {
  // Excel date serial: days since 1899-12-30 (accounting for the 1900 leap year bug)
  // Serial 1 = 1900-01-01, but Excel wrongly treats 1900 as a leap year
  if (serial < 1) return null;
  const epoch = new Date(1899, 11, 30); // Dec 30, 1899
  const date = new Date(epoch.getTime() + serial * 86400000);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  if (y < 2000 || y > 2030) return null; // sanity check
  return `${y}-${m}-${d}`;
}

