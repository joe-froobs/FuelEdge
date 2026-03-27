"use client";

import { Fuel, Bell, Menu, X } from "lucide-react";
import { useState } from "react";
import { PriceAlert } from "@/lib/types";

interface HeaderProps {
  alerts: PriceAlert[];
}

export function Header({ alerts }: HeaderProps) {
  const [showAlerts, setShowAlerts] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-teal-700 rounded-lg flex items-center justify-center">
              <Fuel className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                Fuel<span className="text-teal-700">Edge</span>
              </span>
              <span className="hidden sm:inline text-xs text-slate-400 ml-2 font-medium">
                BETA
              </span>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#" className="text-teal-700 border-b-2 border-teal-700 pb-0.5">
              Dashboard
            </a>
            <a href="#" className="text-slate-500 hover:text-slate-900 transition-colors">
              Price Compare
            </a>
            <a href="#" className="text-slate-500 hover:text-slate-900 transition-colors">
              Trends
            </a>
            <a href="#" className="text-slate-500 hover:text-slate-900 transition-colors">
              Margins
            </a>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Alerts */}
            <div className="relative">
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showAlerts && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                  <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-sm">Price Alerts</span>
                    <span className="text-xs text-slate-400">{unreadCount} new</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 border-b border-slate-50 ${
                          !alert.read ? "bg-teal-50/50" : ""
                        }`}
                      >
                        <p className="text-sm text-slate-700">{alert.message}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {formatTimeAgo(alert.timestamp)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-1">
            <a href="#" className="px-3 py-2 rounded-lg text-teal-700 bg-teal-50 font-medium text-sm">
              Dashboard
            </a>
            <a href="#" className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-sm">
              Price Compare
            </a>
            <a href="#" className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-sm">
              Trends
            </a>
            <a href="#" className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-sm">
              Margins
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
