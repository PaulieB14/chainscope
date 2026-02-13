"use client";

import { useEffect, useRef } from "react";

interface OhlcBar {
  datetime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function PriceChart({ data, ticker }: { data: OhlcBar[]; ticker: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !data.length) return;

    let chart: ReturnType<typeof import("lightweight-charts").createChart> | null = null;

    import("lightweight-charts").then(({ createChart }) => {
      if (!containerRef.current) return;

      containerRef.current.innerHTML = "";

      chart = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: 320,
        layout: {
          background: { color: "#12141a" },
          textColor: "#71717a",
          fontSize: 11,
        },
        grid: {
          vertLines: { color: "#1e2028" },
          horzLines: { color: "#1e2028" },
        },
        crosshair: {
          mode: 0,
        },
        timeScale: {
          borderColor: "#1e2028",
          timeVisible: false,
        },
        rightPriceScale: {
          borderColor: "#1e2028",
        },
      });

      const candleSeries = chart.addCandlestickSeries({
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderUpColor: "#22c55e",
        borderDownColor: "#ef4444",
        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
      });

      const candles = data
        .map((d) => ({
          time: d.datetime.split(" ")[0],
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }))
        .sort((a, b) => (a.time < b.time ? -1 : 1));

      candleSeries.setData(candles as Parameters<typeof candleSeries.setData>[0]);
      chart.timeScale().fitContent();
    });

    const handleResize = () => {
      if (chart && containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart?.remove();
    };
  }, [data]);

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
        Price Chart — {ticker}
      </h3>
      {data.length === 0 ? (
        <p className="text-zinc-600 text-sm">No price data available</p>
      ) : (
        <div ref={containerRef} className="rounded-lg overflow-hidden" />
      )}
    </div>
  );
}
