"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChevronDown } from "lucide-react";
import { Terminal, FuelType } from "@/lib/types";
import { getPriceTrend } from "@/lib/mock-data";

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

  const data = getPriceTrend(terminal, fuelType, days);

  const terminals: Terminal[] = [
    "Sydney", "Melbourne", "Brisbane", "Adelaide", "Perth", "Darwin", "Hobart",
  ];
  const fuelTypes: FuelType[] = ["ULP", "Diesel", "PULP 95", "PULP 98"];

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
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-2 text-xs font-medium transition-colors ${
                    days === d
                      ? "bg-teal-700 text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>
        </div>
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
                return `${d.getDate()}/${d.getMonth() + 1}`;
              }}
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
              formatter={(value) => [`${Number(value).toFixed(1)} cpl`]}
              labelFormatter={(label) => {
                const d = new Date(label);
                return d.toLocaleDateString("en-AU", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                });
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
            />
            {Object.entries(SUPPLIER_COLORS).map(([supplier, color]) => (
              <Line
                key={supplier}
                type="monotone"
                dataKey={supplier}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
