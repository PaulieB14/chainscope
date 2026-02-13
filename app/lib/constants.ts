export const EVM_CHAINS = [
  { id: "mainnet", name: "Ethereum", symbol: "ETH", color: "#627eea", explorer: "https://etherscan.io" },
  { id: "base", name: "Base", symbol: "ETH", color: "#0052ff", explorer: "https://basescan.org" },
  { id: "arbitrum-one", name: "Arbitrum", symbol: "ETH", color: "#28a0f0", explorer: "https://arbiscan.io" },
  { id: "optimism", name: "Optimism", symbol: "ETH", color: "#ff0420", explorer: "https://optimistic.etherscan.io" },
  { id: "polygon", name: "Polygon", symbol: "MATIC", color: "#8247e5", explorer: "https://polygonscan.com" },
  { id: "bsc", name: "BNB Chain", symbol: "BNB", color: "#f0b90b", explorer: "https://bscscan.com" },
  { id: "avalanche", name: "Avalanche", symbol: "AVAX", color: "#e84142", explorer: "https://snowscan.xyz" },
  { id: "unichain", name: "Unichain", symbol: "ETH", color: "#ff007a", explorer: "https://uniscan.xyz" },
] as const;

export type EvmChainId = (typeof EVM_CHAINS)[number]["id"];

export function getExplorer(networkId: string) {
  return EVM_CHAINS.find((c) => c.id === networkId)?.explorer ?? "https://etherscan.io";
}
