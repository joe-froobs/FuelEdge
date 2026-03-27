"use client";

import { Header } from "@/components/Header";
import { StatsBar } from "@/components/StatsBar";
import { PriceTable } from "@/components/PriceTable";
import { PriceTrendChart } from "@/components/PriceTrendChart";
import { MarginTable } from "@/components/MarginTable";
import { SupplierRanking } from "@/components/SupplierRanking";
import { getTodayComparisons, getMarginAnalysis, getAlerts } from "@/lib/mock-data";
import { MapPin, Calendar } from "lucide-react";

export default function DashboardPage() {
  const comparisons = getTodayComparisons();
  const margins = getMarginAnalysis();
  const alerts = getAlerts();

  const today = new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header alerts={alerts} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Price Intelligence Dashboard
            </h1>
            <div className="flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1 text-sm text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                {today}
              </span>
              <span className="flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="w-3.5 h-3.5" />
                All Australian terminals
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Data updated today
            </span>
          </div>
        </div>

        {/* Stats */}
        <StatsBar comparisons={comparisons} />

        {/* Price comparison table */}
        <PriceTable comparisons={comparisons} />

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PriceTrendChart />
          </div>
          <div>
            <SupplierRanking comparisons={comparisons} />
          </div>
        </div>

        {/* Margin analysis */}
        <MarginTable margins={margins} />

        {/* Data source notice */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">
            About this data
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Terminal Gate Prices are sourced from publicly available data
            published by Ampol, BP, Viva Energy, and ExxonMobil as required
            under the Competition and Consumer (Industry Codes — Oil)
            Regulations 2017 (Oilcode). Retail prices are sourced from NSW
            FuelCheck and WA FuelWatch government APIs. FuelEdge is not
            affiliated with any fuel supplier. Data is indicative and should
            not be the sole basis for purchasing decisions. Prices shown are
            in Australian cents per litre (cpl), inclusive of GST.
          </p>
          <p className="text-xs text-amber-600 font-medium mt-2">
            DEMO: This dashboard currently shows simulated data. Live data
            integration coming soon.
          </p>
        </div>
      </main>
    </div>
  );
}
