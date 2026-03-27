"use client";

import { useState, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown } from "lucide-react";
import { Terminal, FuelType } from "@/lib/types";
import { getPriceTrend } from "@/lib/mock-data";

const SUPPLIERS = ["Ampol", "BP", "Viva Energy", "ExxonMobil"] as const;

const SUPPLIER_COLORS: Record<string, string> = {
  Ampol: "#0f766e",
  BP: "#1d4ed8",
  "Viva Energy": "#dc2626",
  ExxonMobil: "#7c3aed",
};

export function PriceTrendChart() {
  const [terminal, setTerminal] = useState<Terminal>("Sydney");
  const [fuelType, setFuelType] = useState<FuelType>("ULP");
  const [days, setDays] = useState(30);
  const [hiddenSuppliers, setHiddenSuppliers] = useState<Set<string>>(new Set());

  const data = getPriceTrend(terminal, fuelType, days);

  const terminals: Terminal[] = [
    "Sydney", "Melbourne", "Brisbane", "Adelaide", "Perth", "Darwin", "Hobart",
  ];
  const fuelTypes: FuelType[] = ["ULP", "Diesel", "PULP 95", "PULP 98"];

  const toggleSupplier = useCallback((supplier: string) => {
    setHiddenSuppliers((prev) => {
      const next = new Set(prev);
      if (next.has(supplier)) {
        next.delete(supplier);
      } else {
        // Don't allow hiding all suppliers
        if (next.size < SUPPLIERS.length - 1) {
          next.add(supplier);
        }
      }
      return next;
    });
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Price Trends</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Historical TGP movement by supplier
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <select
                value={terminal}
                onChange={(e) => setTerminal(e.target.value as Terminal)}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                {terminals.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                {fuelTypes.map((ft) => (
                  <option key={ft} value={ft}>{ft}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              {[
                { label: "7D", value: 7 },
                { label: "30D", value: 30 },
                { label: "90D", value: 90 },
                { label: "1Y", value: 365 },
                { label: "5Y", value: 1825 },
                { label: "10Y", value: 3650 },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDays(opt.value)}
                  className={`px-2.5 py-2 text-xs font-medium transition-colors ${
                    days === opt.value
                      ? "bg-teal-700 text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive supplier toggles */}
      <div className="px-5 pt-4 flex items-center gap-1 flex-wrap">
        <span className="text-xs text-slate-400 mr-1">Show:</span>
        {SUPPLIERS.map((supplier) => {
          const isHidden = hiddenSuppliers.has(supplier);
          const color = SUPPLIER_COLORS[supplier];
          return (
            <button
              key={supplier}
              onClick={() => toggleSupplier(supplier)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                isHidden
                  ? "bg-slate-100 text-slate-400 line-through"
                  : "text-white"
              }`}
              style={!isHidden ? { backgroundColor: color } : undefined}
            >
              <span
                className={`w-2 h-2 rounded-full ${isHidden ? "bg-slate-300" : "bg-white/50"}`}
              />
              {supplier}
            </button>
          );
        })}
      </div>

      <div className="p-5">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickFormatter={(val) => {
                const d = new Date(val);
                if (days > 1825) {
                  return d.toLocaleDateString("en-AU", { month: "short", year: "2-digit" });
                } else if (days > 365) {
                  return d.toLocaleDateString("en-AU", { month: "short", year: "2-digit" });
                } else if (days > 60) {
                  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
                }
                return `${d.getDate()}/${d.getMonth() + 1}`;
              }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              domain={["auto", "auto"]}
              tickFormatter={(val) => `${val}`}
              label={{
                value: "cpl",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 11, fill: "#94a3b8" },
              }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: "12px",
              }}
              formatter={(value, name) => {
                if (hiddenSuppliers.has(name as string)) return [null, null];
                return [`${Number(value).toFixed(1)} cpl`, name];
              }}
              labelFormatter={(label) => {
                const d = new Date(label);
                if (days > 365) {
                  return d.toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });
                }
                return d.toLocaleDateString("en-AU", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
              }}
            />
            {SUPPLIERS.map((supplier) => (
              <Line
                key={supplier}
                type="monotone"
                dataKey={supplier}
                stroke={SUPPLIER_COLORS[supplier]}
                strokeWidth={hiddenSuppliers.has(supplier) ? 0 : 2}
                dot={false}
                activeDot={hiddenSuppliers.has(supplier) ? false : { r: 4 }}
                hide={hiddenSuppliers.has(supplier)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
