import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChainScope — Cross-Chain Token Intelligence",
  description: "Multi-chain token research & wallet profiler powered by The Graph Token API",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
