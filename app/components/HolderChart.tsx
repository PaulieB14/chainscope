"use client";

import CopyButton from "./CopyButton";

interface Holder {
  address: string;
  value: number;
  symbol: string;
  amount: string;
}

function truncate(addr: string) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function formatValue(val: number): string {
  if (val >= 1e9) return (val / 1e9).toFixed(2) + "B";
  if (val >= 1e6) return (val / 1e6).toFixed(2) + "M";
  if (val >= 1e3) return (val / 1e3).toFixed(2) + "K";
  return val.toFixed(2);
}

export default function HolderChart({ holders, explorer }: { holders: Holder[]; explorer: string }) {
  if (!holders.length) return null;

  const maxVal = holders[0]?.value || 1;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
        Top Holders
      </h3>
      <div className="space-y-3">
        {holders.map((h, i) => {
          const pct = (h.value / maxVal) * 100;
          return (
            <div key={h.address}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-zinc-600">#{i + 1}</span>
                  <a
                    href={`${explorer}/address/${h.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-zinc-400 hover:text-accent transition-colors"
                  >
                    {truncate(h.address)}
                    <span className="ml-1 text-zinc-700">&#x2197;</span>
                  </a>
                  <CopyButton text={h.address} />
                </span>
                <span className="text-zinc-300 font-medium">
                  {formatValue(h.value)} {h.symbol}
                </span>
              </div>
              <div className="w-full bg-[#1a1c24] rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(pct, 2)}%`,
                    background: `hsl(${142 - i * 8}, 70%, ${50 - i * 3}%)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
