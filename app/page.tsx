"use client";

import { useState, useEffect } from "react";
import JwtModal from "./components/JwtModal";
import TokenResearch from "./components/TokenResearch";
import WalletProfiler from "./components/WalletProfiler";

type Tab = "token" | "wallet";

const JWT_KEY = "chainscope_jwt";

export default function Home() {
  const [jwt, setJwt] = useState<string>("");
  const [showJwtModal, setShowJwtModal] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("token");

  useEffect(() => {
    const saved = localStorage.getItem(JWT_KEY);
    if (saved) setJwt(saved); // eslint-disable-line react-hooks/set-state-in-effect
    else setShowJwtModal(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const saveJwt = (token: string) => {
    localStorage.setItem(JWT_KEY, token);
    setJwt(token);
    setShowJwtModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Gradient top bar */}
      <div className="h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500" />

      <main className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="gradient-text">Chain</span>
              <span className="text-white">Scope</span>
            </h1>
            <p className="text-xs text-zinc-600 mt-1">
              Cross-chain token intelligence powered by The Graph
            </p>
          </div>
          <button
            onClick={() => setShowJwtModal(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              jwt
                ? "bg-card border border-border text-zinc-400 hover:text-white hover:border-accent/50"
                : "bg-accent text-black hover:bg-green-400 shadow-lg shadow-accent/20"
            }`}
          >
            {jwt ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Connected
              </span>
            ) : (
              "Set API Key"
            )}
          </button>
        </header>

        {/* JWT Modal */}
        {showJwtModal && (
          <JwtModal currentJwt={jwt} onSave={saveJwt} onClose={() => setShowJwtModal(false)} />
        )}

        {/* No JWT warning */}
        {!jwt && (
          <div className="animate-fade-in bg-card border border-warn/30 rounded-xl p-8 text-center">
            <p className="text-warn font-semibold text-lg mb-2">No API key configured</p>
            <p className="text-zinc-500 text-sm max-w-md mx-auto">
              Get a free API key from{" "}
              <a
                href="https://thegraph.market"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline hover:text-green-400 transition-colors"
              >
                thegraph.market
              </a>{" "}
              and paste it above to start exploring tokens and wallets across 8 EVM chains.
            </p>
          </div>
        )}

        {/* Tabs */}
        {jwt && (
          <div className="animate-fade-in">
            <div className="flex gap-1 bg-card border border-border rounded-xl p-1 mb-6 w-fit">
              {([
                { key: "token" as Tab, label: "Token Research" },
                { key: "wallet" as Tab, label: "Wallet Profiler" },
              ]).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? "bg-accent text-black shadow-lg shadow-accent/20"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="animate-slide-up">
              {activeTab === "token" && <TokenResearch jwt={jwt} />}
              {activeTab === "wallet" && <WalletProfiler jwt={jwt} />}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-4 px-4 text-center">
        <p className="text-xs text-zinc-700">
          Built with{" "}
          <a
            href="https://thegraph.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-accent transition-colors"
          >
            The Graph Token API
          </a>
          {" "}&middot;{" "}
          <a
            href="https://github.com/PaulieB14/chainscope"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-accent transition-colors"
          >
            GitHub
          </a>
          {" "}&middot; Your API key never leaves your browser
        </p>
      </footer>
    </div>
  );
}
