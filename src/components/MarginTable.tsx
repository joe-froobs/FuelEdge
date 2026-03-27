"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { MarginAnalysis, FuelType } from "@/lib/types";

interface MarginTableProps {
  margins: MarginAnalysis[];
}

export function MarginTable({ margins }: MarginTableProps) {
  const [selectedFuel, setSelectedFuel] = useState<FuelType>("ULP");
  const fuelTypes = [...new Set(margins.map((m) => m.fuelType))];
  const filtered = margins.filter((m) => m.fuelType === selectedFuel);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Margin Analysis</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Wholesale vs average retail — see where margins are fattest
            </p>
          </div>
          <div className="relative">
            <select
              value={selectedFuel}
              onChange={(e) => setSelectedFuel(e.target.value as FuelType)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              {fuelTypes.map((ft) => (
                <option key={ft} value={ft}>{ft}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
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
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Avg Wholesale
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Avg Retail
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Margin
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Margin Bar
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered
              .sort((a, b) => b.marginCpl - a.marginCpl)
              .map((m) => {
                const maxMargin = Math.max(...filtered.map((f) => f.marginCpl));
                const barWidth = (m.marginCpl / maxMargin) * 100;
                const isHigh = m.marginCpl > 18;
                const isLow = m.marginCpl < 12;

                return (
                  <tr
                    key={m.terminal}
                    className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-sm text-slate-900">
                        {m.terminal}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm font-mono text-slate-600">
                        {m.wholesaleCpl.toFixed(1)} cpl
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm font-mono text-slate-600">
                        {m.avgRetailCpl.toFixed(1)} cpl
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span
                        className={`text-sm font-bold ${
                          isHigh
                            ? "text-green-600"
                            : isLow
                            ? "text-red-600"
                            : "text-slate-700"
                        }`}
                      >
                        {m.marginCpl.toFixed(1)} cpl
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${
                            isHigh
                              ? "bg-green-500"
                              : isLow
                              ? "bg-red-400"
                              : "bg-teal-500"
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
