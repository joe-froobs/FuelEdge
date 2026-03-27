"use client";

import { useState } from "react";
import { ChevronDown, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { PriceComparison, Terminal, FuelType } from "@/lib/types";

interface PriceTableProps {
  comparisons: PriceComparison[];
}

export function PriceTable({ comparisons }: PriceTableProps) {
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | "all">("all");
  const [selectedFuel, setSelectedFuel] = useState<FuelType>("ULP");

  const terminals = [...new Set(comparisons.map((c) => c.terminal))];
  const fuelTypes = [...new Set(comparisons.map((c) => c.fuelType))];

  const filtered = comparisons.filter(
    (c) =>
      c.fuelType === selectedFuel &&
      (selectedTerminal === "all" || c.terminal === selectedTerminal)
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Terminal Gate Price Comparison
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Today&apos;s wholesale prices across all major suppliers
            </p>
          </div>
          <div className="flex gap-2">
            {/* Fuel type selector */}
            <div className="relative">
              <select
                value={selectedFuel}
                onChange={(e) => setSelectedFuel(e.target.value as FuelType)}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                {fuelTypes.map((ft) => (
                  <option key={ft} value={ft}>
                    {ft}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Terminal selector */}
            <div className="relative">
              <select
                value={selectedTerminal}
                onChange={(e) =>
                  setSelectedTerminal(e.target.value as Terminal | "all")
                }
                className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="all">All Terminals</option>
                {terminals.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Terminal
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Cheapest
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Spread
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-teal-700 uppercase tracking-wide">
                Ampol
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-blue-700 uppercase tracking-wide">
                BP
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-red-700 uppercase tracking-wide">
                Viva Energy
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-purple-700 uppercase tracking-wide">
                ExxonMobil
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((comp, i) => (
              <tr
                key={`${comp.terminal}-${comp.fuelType}`}
                className={`border-t border-slate-100 hover:bg-slate-50/50 transition-colors ${
                  i % 2 === 0 ? "" : "bg-slate-25"
                }`}
              >
                <td className="px-5 py-3.5">
                  <span className="font-medium text-sm text-slate-900">
                    {comp.terminal}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                    {comp.cheapest}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span
                    className={`text-sm font-semibold ${
                      comp.spread > 3 ? "text-amber-600" : "text-slate-500"
                    }`}
                  >
                    {comp.spread.toFixed(1)} cpl
                  </span>
                </td>
                {comp.prices.map((p) => {
                  const isCheapest = p.supplier === comp.cheapest;
                  return (
                    <td
                      key={p.supplier}
                      className="px-5 py-3.5 text-right"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span
                          className={`text-sm font-mono ${
                            isCheapest
                              ? "font-bold text-green-700"
                              : "text-slate-700"
                          }`}
                        >
                          {p.priceCpl.toFixed(1)}
                        </span>
                        <PriceChange change={p.changeFromYesterday} />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PriceChange({ change }: { change: number }) {
  if (Math.abs(change) < 0.1) {
    return <Minus className="w-3 h-3 text-slate-300" />;
  }
  if (change > 0) {
    return (
      <span className="flex items-center text-red-500">
        <ArrowUpRight className="w-3 h-3" />
        <span className="text-[10px] font-medium">{change.toFixed(1)}</span>
      </span>
    );
  }
  return (
    <span className="flex items-center text-green-600">
      <ArrowDownRight className="w-3 h-3" />
      <span className="text-[10px] font-medium">{Math.abs(change).toFixed(1)}</span>
    </span>
  );
}
