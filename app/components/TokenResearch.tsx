"use client";

import { useState } from "react";
import { EVM_CHAINS, type EvmChainId, getExplorer } from "../lib/constants";
import { getEvmHolders, getEvmPools, getEvmPoolOhlc, getEvmSwaps } from "../lib/api";
import HolderChart from "./HolderChart";
import PriceChart from "./PriceChart";
import CopyButton from "./CopyButton";

interface Props {
  jwt: string;
}

function truncAddr(addr: string) {
  if (!addr) return "?";
  return addr.slice(0, 6) + "\u2026" + addr.slice(-4);
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// Normalize protocol names: "uniswap_v3" / "uniswap-v3" / "Uniswap V3" all match
function normProtocol(p: string) {
  return (p || "").toLowerCase().replace(/[\s_-]+/g, "");
}

const DEX_CONFIGS: { match: string; label: string; color: string; url: (net: string, pool: string) => string }[] = [
  {
    match: "uniswapv3",
    label: "Uniswap V3",
    color: "#ff007a",
    url: (net, pool) => {
      const chain = net === "mainnet" ? "ethereum" : net === "arbitrum-one" ? "arbitrum" : net === "polygon" ? "polygon" : net === "optimism" ? "optimism" : net === "base" ? "base" : net === "bsc" ? "bnb" : net === "avalanche" ? "avalanche" : "ethereum";
      return `https://app.uniswap.org/explore/pools/${chain}/${pool}`;
    },
  },
  {
    match: "uniswapv2",
    label: "Uniswap V2",
    color: "#ff007a",
    url: (_net, pool) => `https://app.uniswap.org/explore/pools/ethereum/${pool}`,
  },
  {
    match: "sushiswap",
    label: "SushiSwap",
    color: "#e05baa",
    url: (_net, pool) => `https://www.sushi.com/ethereum/pool/v2/${pool}`,
  },
  {
    match: "pancakeswapv3",
    label: "PancakeSwap V3",
    color: "#1fc7d4",
    url: (_net, pool) => `https://pancakeswap.finance/info/v3/pairs/${pool}`,
  },
  {
    match: "pancakeswapv2",
    label: "PancakeSwap V2",
    color: "#1fc7d4",
    url: (_net, pool) => `https://pancakeswap.finance/info/pairs/${pool}`,
  },
  {
    match: "curve",
    label: "Curve",
    color: "#a5a4ce",
    url: (_net, pool) => `https://curve.fi/#/ethereum/pools?search=${pool}`,
  },
  {
    match: "balancer",
    label: "Balancer",
    color: "#1e1e1e",
    url: (_net, pool) => `https://app.balancer.fi/#/ethereum/pool/${pool}`,
  },
];

function getDexConfig(protocol: string) {
  const norm = normProtocol(protocol);
  return DEX_CONFIGS.find((d) => norm.includes(d.match)) || null;
}

export default function TokenResearch({ jwt }: Props) {
  const [network, setNetwork] = useState<EvmChainId>("mainnet");
  const [contract, setContract] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [holders, setHolders] = useState<any[]>([]);
  const [ohlcData, setOhlcData] = useState<any[]>([]);
  const [ticker, setTicker] = useState("");
  const [poolInfo, setPoolInfo] = useState<any[]>([]);
  const [swaps, setSwaps] = useState<any[]>([]);

  const explorer = getExplorer(network);

  const analyze = async () => {
    if (!contract.trim()) return;
    setLoading(true);
    setError("");
    setHolders([]);
    setOhlcData([]);
    setPoolInfo([]);
    setSwaps([]);
    setTicker("");

    try {
      const [holdersRes, poolsRes] = await Promise.all([
        getEvmHolders(jwt, network, contract.trim()).catch(() => ({ data: [] })),
        getEvmPools(jwt, network, contract.trim()).catch(() => ({ data: [] })),
      ]);

      setHolders(holdersRes.data || []);
      setPoolInfo(poolsRes.data || []);

      if (poolsRes.data?.length > 0) {
        const pool = poolsRes.data[0];
        const poolAddress = pool.pool;
        const inputSymbol = pool.input_token?.symbol || "?";
        const outputSymbol = pool.output_token?.symbol || "?";
        setTicker(`${inputSymbol}/${outputSymbol}`);

        const now = new Date();
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const endTime = now.toISOString().split("T")[0];
        const startTime = monthAgo.toISOString().split("T")[0];

        const [ohlcRes, swapsRes] = await Promise.all([
          getEvmPoolOhlc(jwt, network, poolAddress, "1d", startTime, endTime, "30").catch(() => ({ data: [] })),
          getEvmSwaps(jwt, network, "10", poolAddress).catch(() => ({ data: [] })),
        ]);

        setOhlcData(ohlcRes.data || []);
        setSwaps(swapsRes.data || []);
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={network}
          onChange={(e) => setNetwork(e.target.value as EvmChainId)}
          className="w-full sm:w-44"
        >
          {EVM_CHAINS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          value={contract}
          onChange={(e) => setContract(e.target.value)}
          placeholder="Token contract address (0x...)"
          className="flex-1"
          onKeyDown={(e) => e.key === "Enter" && analyze()}
        />
        <button
          onClick={analyze}
          disabled={loading || !contract.trim()}
          className="px-6 py-2.5 bg-accent text-black rounded-lg text-sm font-semibold hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent/20 hover:shadow-accent/30 whitespace-nowrap"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Analyzing...
            </span>
          ) : (
            "Analyze Token"
          )}
        </button>
      </div>

      {/* Quick fills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-xs text-zinc-600">Quick:</span>
        {[
          { label: "USDT", addr: "0xdac17f958d2ee523a2206206994597c13d831ec7" },
          { label: "USDC", addr: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
          { label: "WETH", addr: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" },
          { label: "LINK", addr: "0x514910771af9ca656af840dff83e8264ecf986ca" },
        ].map((t) => (
          <button
            key={t.label}
            onClick={() => {
              setContract(t.addr);
              setNetwork("mainnet");
            }}
            className="px-3 py-1.5 text-xs bg-card border border-border rounded-lg text-zinc-400 hover:text-white hover:border-accent/50 transition-all"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="skeleton h-4 w-24 rounded mb-4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i}>
                  <div className="skeleton h-3 rounded mb-1" style={{ width: `${80 - i * 10}%` }} />
                  <div className="skeleton h-2 rounded-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="skeleton h-4 w-32 rounded mb-4" />
            <div className="skeleton h-72 rounded-lg" />
          </div>
        </div>
      )}

      {error && (
        <div className="animate-fade-in bg-danger/10 border border-danger/30 rounded-xl p-4 mb-6 text-danger text-sm">
          {error}
        </div>
      )}

      {/* Charts */}
      {!loading && (holders.length > 0 || ohlcData.length > 0) && (
        <div className="animate-slide-up grid grid-cols-1 lg:grid-cols-2 gap-6">
          {holders.length > 0 && <HolderChart holders={holders} explorer={explorer} />}
          {ohlcData.length > 0 && <PriceChart data={ohlcData} ticker={ticker} />}
        </div>
      )}

      {/* ── DEX Pools ── */}
      {!loading && poolInfo.length > 0 && (
        <div className="animate-slide-up mt-6">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 px-1">
            Liquidity Pools ({poolInfo.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {poolInfo.map((p: any, i: number) => {
              const dex = getDexConfig(p.protocol);
              const dexUrl = dex?.url(network, p.pool) || null;
              const pairLabel = `${p.input_token?.symbol || "?"}/${p.output_token?.symbol || "?"}`;

              return (
                <div
                  key={i}
                  className="bg-card border border-border rounded-xl p-4 card-glow transition-all hover:border-zinc-600 group"
                >
                  {/* DEX badge + pair */}
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: dex?.color || "#52525b" }}
                    />
                    <span className="text-sm font-semibold text-white">{pairLabel}</span>
                  </div>

                  {/* Protocol label */}
                  <div className="text-xs text-zinc-500 mb-3">
                    {dex?.label || p.protocol || "Unknown DEX"}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    {dexUrl && (
                      <a
                        href={dexUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center py-2 px-3 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: `${dex?.color || "#22c55e"}20`,
                          color: dex?.color || "#22c55e",
                          border: `1px solid ${dex?.color || "#22c55e"}40`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `${dex?.color || "#22c55e"}35`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = `${dex?.color || "#22c55e"}20`;
                        }}
                      >
                        Open in {dex?.label || "DEX"} &rarr;
                      </a>
                    )}
                    <a
                      href={`${explorer}/address/${p.pool}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-lg text-xs font-medium bg-white/5 border border-border text-zinc-400 hover:text-white hover:border-zinc-500 transition-all"
                      title="View contract on block explorer"
                    >
                      Explorer &nearr;
                    </a>
                    <CopyButton text={p.pool} />
                  </div>

                  {/* Address */}
                  <div className="mt-2 text-[10px] font-mono text-zinc-700 group-hover:text-zinc-500 transition-colors">
                    {truncAddr(p.pool)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Recent Swaps ── */}
      {!loading && swaps.length > 0 && (
        <div className="animate-slide-up mt-6 bg-card border border-border rounded-xl p-5 overflow-hidden">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Recent Swaps {ticker && <span className="text-accent normal-case">{ticker}</span>}
          </h3>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-zinc-600 border-b border-border">
                  <th className="text-left py-2 pr-4 font-medium">Time</th>
                  <th className="text-left py-2 pr-4 font-medium">Sold</th>
                  <th className="text-left py-2 pr-4 font-medium">Bought</th>
                  <th className="text-right py-2 font-medium">Tx</th>
                </tr>
              </thead>
              <tbody>
                {swaps.map((s: any, i: number) => (
                  <tr
                    key={i}
                    className="border-b border-border/50 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-2.5 pr-4 text-zinc-500 whitespace-nowrap">
                      {s.datetime ? timeAgo(s.datetime) : "\u2014"}
                    </td>
                    <td className="py-2.5 pr-4 whitespace-nowrap">
                      <span className="text-red-400 font-mono">
                        {Number(s.input_amount || 0).toFixed(4)}
                      </span>{" "}
                      <span className="text-zinc-500">{s.input_token?.symbol || "?"}</span>
                    </td>
                    <td className="py-2.5 pr-4 whitespace-nowrap">
                      <span className="text-green-400 font-mono">
                        {Number(s.output_amount || 0).toFixed(4)}
                      </span>{" "}
                      <span className="text-zinc-500">{s.output_token?.symbol || "?"}</span>
                    </td>
                    <td className="py-2.5 text-right">
                      {s.transaction ? (
                        <a
                          href={`${explorer}/tx/${s.transaction}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-zinc-500 hover:text-accent transition-colors"
                        >
                          {s.transaction.slice(0, 10)}\u2026
                        </a>
                      ) : (
                        "\u2014"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && holders.length > 0 && (
        <div className="mt-4 text-xs text-zinc-600 text-center">
          Data via The Graph Token API
        </div>
      )}
    </div>
  );
}
