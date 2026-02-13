# ChainScope

Cross-chain token intelligence app powered by [The Graph Token API](https://token-api.thegraph.com/skills.md).

## Features

- **Token Research** — Analyze any ERC-20 token: top holders, OHLCV candlestick price charts, DEX liquidity pools with direct links to Uniswap/SushiSwap/PancakeSwap, recent swap activity
- **Wallet Profiler** — Scan any wallet across 8 EVM chains in parallel: native balances, ERC-20 token holdings, block explorer links
- **CoinGecko Market Data** — Live price, 24h change, market cap, and volume pulled from CoinGecko
- **BYOK (Bring Your Own Key)** — Your JWT is stored locally in your browser and never sent to any server except The Graph's API

## Supported Chains

Ethereum, Base, Arbitrum, Optimism, Polygon, BNB Chain, Avalanche, Unichain

## Getting Started

1. Get a free API key from [thegraph.market](https://thegraph.market)
2. Clone and run:

```bash
git clone https://github.com/PaulieB14/chainscope.git
cd chainscope
npm install
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) and paste your JWT

## Tech Stack

- **Next.js 15** (App Router)
- **TailwindCSS** — Dark theme
- **lightweight-charts** — TradingView candlestick charts
- **Recharts** — Holder distribution visualization
- **The Graph Token API** — All on-chain data ([skills.md](https://token-api.thegraph.com/skills.md))
- **CoinGecko API** — Market data (free tier, no key required)

## Architecture

```
Browser (JWT in localStorage)
  |
  v
Next.js API Route (/api/token)  -- thin proxy to avoid CORS
  |
  v
The Graph Token API (token-api.thegraph.com)
```

Zero backend cost. Deployable to Vercel free tier.

## License

MIT
