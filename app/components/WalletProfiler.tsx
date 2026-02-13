"use client";

import { useState } from "react";
import { EVM_CHAINS } from "../lib/constants";
import { getEvmNativeBalance, getEvmBalances } from "../lib/api";
import CopyButton from "./CopyButton";

interface ChainBalance {
  chain: string;
  chainId: string;
  symbol: string;
  color: string;
  explorer: string;
  balance: number;
  loading: boolean;
  error: boolean;
}

interface TokenHolding {
  symbol: string;
  name: string;
  contract: string;
  value: number;
  decimals: number;
}

function formatBalance(val: number): string {
  if (val === 0) return "0";
  if (val < 0.0001) return "<0.0001";
  if (val < 1) return val.toFixed(4);
  if (val >= 1e6) return (val / 1e6).toFixed(2) + "M";
  if (val >= 1e3) return (val / 1e3).toFixed(2) + "K";
  return val.toFixed(4);
}

export default function WalletProfiler({ jwt }: { jwt: string }) {
  const [address, setAddress] = useState("");
  const [balances, setBalances] = useState<ChainBalance[]>([]);
  const [tokens, setTokens] = useState<TokenHolding[]>([]);
  const [scanning, setScanning] = useState(false);
  const [selectedChain, setSelectedChain] = useState<string>("mainnet");

  const scan = async () => {
    if (!address.trim()) return;
    setScanning(true);
    setTokens([]);

    const initial: ChainBalance[] = EVM_CHAINS.map((c) => ({
      chain: c.name,
      chainId: c.id,
      symbol: c.symbol,
      color: c.color,
      explorer: c.explorer,
      balance: 0,
      loading: true,
      error: false,
    }));
    setBalances(initial);

    // Fire all 8 chains in parallel for native balances
    const results = await Promise.allSettled(
      EVM_CHAINS.map((c) => getEvmNativeBalance(jwt, c.id, address.trim()))
    );

    const updated = initial.map((b, i) => {
      const result = results[i];
      if (result.status === "fulfilled" && result.value.data?.[0]) {
        return { ...b, balance: result.value.data[0].value, loading: false };
      }
      return { ...b, loading: false, error: result.status === "rejected" };
    });

    setBalances(updated);

    // Also fetch ERC-20 tokens for the selected chain
    try {
      const tokensRes = await getEvmBalances(jwt, selectedChain as any, address.trim(), "20");
      if (tokensRes.data) {
        setTokens(
          tokensRes.data.map((t: any) => ({
            symbol: t.symbol || "???",
            name: t.name || "Unknown",
            contract: t.contract || "",
            value: t.value || 0,
            decimals: t.decimals || 18,
          }))
        );
      }
    } catch {
      // ERC-20 fetch is best-effort
    }

    setScanning(false);
  };

  const activeExplorer =
    EVM_CHAINS.find((c) => c.id === selectedChain)?.explorer ?? "https://etherscan.io";

  return (
    <div>
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Wallet address (0x...)"
          className="flex-1"
          onKeyDown={(e) => e.key === "Enter" && scan()}
        />
        <button
          onClick={scan}
          disabled={scanning || !address.trim()}
          className="px-6 py-2.5 bg-accent text-black rounded-lg text-sm font-semibold hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent/20 whitespace-nowrap"
        >
          {scanning ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Scanning...
            </span>
          ) : (
            "Scan All Chains"
          )}
        </button>
      </div>

      {/* Quick fills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-xs text-zinc-600">Try:</span>
        {[
          { label: "vitalik.eth", addr: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045" },
          { label: "justin-sun.eth", addr: "0x3DdfA8eC3052539b6C9549F12cEA2C295cfF5296" },
        ].map((w) => (
          <button
            key={w.label}
            onClick={() => setAddress(w.addr)}
            className="px-3 py-1 text-xs bg-card border border-border rounded-lg text-zinc-400 hover:text-white hover:border-accent/50 transition-all"
          >
            {w.label}
          </button>
        ))}
      </div>

      {/* Address display with explorer link */}
      {address && balances.length > 0 && !scanning && (
        <div className="animate-fade-in flex items-center gap-2 mb-4 px-1">
          <span className="text-xs text-zinc-600">Wallet:</span>
          <a
            href={`${activeExplorer}/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-zinc-400 hover:text-accent transition-colors"
          >
            {address}
            <span className="ml-1 text-zinc-700">&nearr;</span>
          </a>
          <CopyButton text={address} />
        </div>
      )}

      {/* Results grid */}
      {balances.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {balances.map((b) => (
            <a
              key={b.chainId}
              href={`${b.explorer}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-card border border-border rounded-xl p-5 transition-all hover:border-zinc-600 card-glow block"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: b.color }}
                />
                <span className="text-sm font-medium text-zinc-300">
                  {b.chain}
                </span>
                <span className="text-zinc-700 text-xs ml-auto">&nearr;</span>
              </div>
              {b.loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                  <span className="text-xs text-zinc-600">Scanning...</span>
                </div>
              ) : b.error ? (
                <span className="text-xs text-danger">Error</span>
              ) : (
                <div>
                  <span className="text-xl font-bold text-white">
                    {formatBalance(b.balance)}
                  </span>
                  <span className="text-sm text-zinc-500 ml-1.5">{b.symbol}</span>
                </div>
              )}
            </a>
          ))}
        </div>
      )}

      {/* ERC-20 Token Holdings */}
      {tokens.length > 0 && (
        <div className="animate-slide-up mt-6 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              ERC-20 Tokens ({tokens.length})
            </h3>
            <select
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value)}
              className="text-xs py-1 px-2"
            >
              {EVM_CHAINS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            {tokens.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs bg-[#1a1c24] rounded-lg px-4 py-3 hover:bg-[#1e2028] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-zinc-300 font-medium">{t.symbol}</span>
                  <span className="text-zinc-600 hidden sm:inline">{t.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-zinc-300">
                    {formatBalance(t.value)}
                  </span>
                  {t.contract && (
                    <>
                      <CopyButton text={t.contract} />
                      <a
                        href={`${activeExplorer}/token/${t.contract}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-600 hover:text-accent transition-colors"
                        title="View token on explorer"
                      >
                        <span className="text-zinc-700">&nearr;</span>
                      </a>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {balances.length > 0 && !scanning && (
        <div className="mt-4 text-xs text-zinc-600 text-center">
          Scanned {EVM_CHAINS.length} chains in parallel via Token API
        </div>
      )}
    </div>
  );
}
