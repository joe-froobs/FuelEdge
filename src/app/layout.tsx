import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FuelEdge — Fuel Price Intelligence for Independent Operators",
  description:
    "Compare wholesale fuel prices across Australian distributors. Find better deals, track trends, and save on every litre.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
