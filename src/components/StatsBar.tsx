"use client";

import { TrendingDown, TrendingUp, Activity, DollarSign } from "lucide-react";
import { PriceComparison } from "@/lib/types";

interface StatsBarProps {
  comparisons: PriceComparison[];
}

export function StatsBar({ comparisons }: StatsBarProps) {
  const ulpComparisons = comparisons.filter((c) => c.fuelType === "ULP");
  const dieselComparisons = comparisons.filter((c) => c.fuelType === "Diesel");

  const avgUlpSpread =
    ulpComparisons.reduce((sum, c) => sum + c.spread, 0) / ulpComparisons.length;
  const avgDieselSpread =
    dieselComparisons.reduce((sum, c) => sum + c.spread, 0) / dieselComparisons.length;
  const maxSpread = Math.max(...comparisons.map((c) => c.spread));
  const maxSpreadItem = comparisons.find((c) => c.spread === maxSpread)!;

  // Potential savings on 3M litres/year
  const avgSpread = comparisons.reduce((sum, c) => sum + c.spread, 0) / comparisons.length;
  const potentialSavings = Math.round(avgSpread * 30000); // 3M litres, cpl to dollars

  const stats = [
    {
      label: "Avg ULP Spread",
      value: `${avgUlpSpread.toFixed(1)} cpl`,
      subtext: "Across all terminals",
      icon: Activity,
      color: "text-teal-700",
      bg: "bg-teal-50",
    },
    {
      label: "Avg Diesel Spread",
      value: `${avgDieselSpread.toFixed(1)} cpl`,
      subtext: "Across all terminals",
      icon: Activity,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      label: "Biggest Opportunity",
      value: `${maxSpread.toFixed(1)} cpl`,
      subtext: `${maxSpreadItem.fuelType} at ${maxSpreadItem.terminal}`,
      icon: TrendingUp,
      color: "text-amber-700",
      bg: "bg-amber-50",
    },
    {
      label: "Potential Annual Savings",
      value: `$${potentialSavings.toLocaleString()}`,
      subtext: "Based on 3M litres/year",
      icon: DollarSign,
      color: "text-green-700",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {stat.label}
              </p>
              <p className="text-2xl font-bold mt-1 text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-1">{stat.subtext}</p>
            </div>
            <div className={`${stat.bg} p-2.5 rounded-lg`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
