"use client";

import { useState } from "react";
import { Fuel, ArrowRight, BarChart3, TrendingDown, Shield, Zap } from "lucide-react";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-teal-700 rounded-lg flex items-center justify-center">
              <Fuel className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              Fuel<span className="text-teal-700">Edge</span>
            </span>
          </div>
          <a
            href="/dashboard"
            className="text-sm font-medium text-teal-700 hover:text-teal-800 transition-colors"
          >
            View Demo Dashboard &rarr;
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-6">
            <Zap className="w-3 h-3" />
            Now tracking all 4 major Australian fuel wholesalers
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
            Stop overpaying for
            <br />
            <span className="text-teal-700">wholesale fuel.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl">
            FuelEdge compares Terminal Gate Prices across Ampol, BP, Viva Energy
            and ExxonMobil every day. See who&apos;s cheapest at your nearest terminal,
            track trends, and get alerts when prices drop.
          </p>

          <p className="mt-3 text-base text-slate-500">
            Built for independent petrol station operators. Save 1-2 cpl on
            every litre — that&apos;s{" "}
            <strong className="text-slate-700">$30,000-$60,000/year</strong> on
            3M litres.
          </p>

          {/* CTA */}
          <div className="mt-10">
            {submitted ? (
              <div className="inline-flex items-center gap-2 px-5 py-3 bg-green-50 text-green-700 rounded-xl font-medium">
                <Shield className="w-5 h-5" />
                Thanks! We&apos;ll be in touch when we launch.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-teal-700 text-white rounded-xl font-semibold text-sm hover:bg-teal-800 transition-colors flex items-center justify-center gap-2"
                >
                  Get Early Access
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
            <p className="mt-3 text-xs text-slate-400">
              Free during beta. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Everything you need to buy smarter
          </h2>
          <p className="text-slate-500 mb-12 max-w-xl">
            We aggregate publicly available Terminal Gate Prices and retail data
            into one clean dashboard, updated daily.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={BarChart3}
              title="Price Comparison"
              description="See today's TGP from every major supplier at every terminal, side by side. Instantly spot who's cheapest."
            />
            <FeatureCard
              icon={TrendingDown}
              title="Trend Analysis"
              description="Track wholesale price movements over 7, 14, or 30 days. Time your purchases when prices dip."
            />
            <FeatureCard
              icon={Shield}
              title="Margin Intelligence"
              description="Compare wholesale vs retail prices in your area. Know your true margin and benchmark against the market."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="text-2xl font-bold text-slate-900 mb-12">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Step
            number="1"
            title="We collect the data"
            description="Every day, we pull Terminal Gate Prices from Ampol, BP, Viva Energy, and ExxonMobil. Plus retail prices from NSW FuelCheck and WA FuelWatch."
          />
          <Step
            number="2"
            title="You see the picture"
            description="Our dashboard shows you who's cheapest at your nearest terminal, how prices are trending, and where the biggest spreads are."
          />
          <Step
            number="3"
            title="You save money"
            description="Use the data to negotiate with your supplier, switch to a cheaper one, or time your purchases better. Even 1 cpl saved adds up fast."
          />
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Simple pricing
          </h2>
          <p className="text-slate-500 mb-12">
            Free during beta. Launch pricing below.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
            <div className="bg-white rounded-2xl border border-slate-200 p-8">
              <h3 className="text-lg font-semibold text-slate-900">Starter</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-slate-900">$99</span>
                <span className="text-slate-500">/month</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">&#10003;</span>
                  Daily TGP comparison across all suppliers
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">&#10003;</span>
                  30-day price trend charts
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">&#10003;</span>
                  Email alerts on price drops
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">&#10003;</span>
                  Margin analysis dashboard
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border-2 border-teal-600 p-8 relative">
              <div className="absolute -top-3 left-6 px-3 py-0.5 bg-teal-600 text-white text-xs font-bold rounded-full">
                RECOMMENDED
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Professional</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-slate-900">$249</span>
                <span className="text-slate-500">/month</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">&#10003;</span>
                  Everything in Starter
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">&#10003;</span>
                  90-day price history and export
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">&#10003;</span>
                  Custom alert rules
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">&#10003;</span>
                  Multi-terminal monitoring
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">&#10003;</span>
                  Contract benchmarking tools
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">&#10003;</span>
                  Priority support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-700 rounded-md flex items-center justify-center">
              <Fuel className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900">
              Fuel<span className="text-teal-700">Edge</span>
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Data sourced from publicly available Terminal Gate Prices as required
            by the Oilcode. Not affiliated with any fuel supplier.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-teal-700" />
      </div>
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="w-8 h-8 bg-teal-700 rounded-full flex items-center justify-center text-white font-bold text-sm mb-4">
        {number}
      </div>
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}
