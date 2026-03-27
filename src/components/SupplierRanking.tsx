"use client";

import { PriceComparison, Supplier } from "@/lib/types";
import { Trophy, Medal } from "lucide-react";

interface SupplierRankingProps {
  comparisons: PriceComparison[];
}

export function SupplierRanking({ comparisons }: SupplierRankingProps) {
  // Count how many times each supplier is cheapest
  const wins: Record<string, number> = {};
  for (const comp of comparisons) {
    wins[comp.cheapest] = (wins[comp.cheapest] || 0) + 1;
  }

  const ranked = Object.entries(wins)
    .sort(([, a], [, b]) => b - a)
    .map(([supplier, count]) => ({
      supplier: supplier as Supplier,
      wins: count,
      percentage: Math.round((count / comparisons.length) * 100),
    }));

  const supplierColors: Record<string, string> = {
    Ampol: "bg-teal-500",
    BP: "bg-blue-500",
    "Viva Energy": "bg-red-500",
    ExxonMobil: "bg-purple-500",
    United: "bg-orange-500",
    Liberty: "bg-cyan-500",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-semibold text-slate-900">
          Cheapest Supplier Today
        </h2>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Times each supplier had the lowest TGP across all terminals and fuel types
      </p>

      <div className="space-y-3">
        {ranked.map((r, i) => (
          <div key={r.supplier} className="flex items-center gap-3">
            <div className="w-6 text-center">
              {i === 0 ? (
                <Medal className="w-5 h-5 text-amber-500" />
              ) : (
                <span className="text-sm font-bold text-slate-400">
                  {i + 1}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">
                  {r.supplier}
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {r.wins} wins ({r.percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    supplierColors[r.supplier] || "bg-slate-400"
                  } transition-all`}
                  style={{ width: `${r.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
