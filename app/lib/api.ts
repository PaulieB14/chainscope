import type { EvmChainId } from "./constants";

async function apiGet(jwt: string, path: string, params: Record<string, string>) {
  const qs = new URLSearchParams({ path, ...params });
  const res = await fetch(`/api/token?${qs.toString()}`, {
    headers: { "x-token-jwt": jwt },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `API error ${res.status}`);
  }
  return res.json();
}

// ── EVM ──

export async function getEvmNativeBalance(jwt: string, network: EvmChainId, address: string) {
  return apiGet(jwt, "/v1/evm/balances/native", { network, address });
}

export async function getEvmBalances(jwt: string, network: EvmChainId, address: string, limit = "20") {
  return apiGet(jwt, "/v1/evm/balances", { network, address, limit });
}

export async function getEvmHolders(jwt: string, network: EvmChainId, contract: string, limit = "10") {
  return apiGet(jwt, "/v1/evm/holders", { network, contract, limit });
}

export async function getEvmPools(jwt: string, network: EvmChainId, inputToken: string, limit = "5") {
  return apiGet(jwt, "/v1/evm/pools", { network, input_token: inputToken, limit });
}

export async function getEvmPoolOhlc(
  jwt: string,
  network: EvmChainId,
  pool: string,
  interval = "1d",
  startTime: string,
  endTime: string,
  limit = "30"
) {
  return apiGet(jwt, "/v1/evm/pools/ohlc", {
    network,
    pool,
    interval,
    start_time: startTime,
    end_time: endTime,
    limit,
  });
}

export async function getEvmSwaps(jwt: string, network: EvmChainId, limit = "10", pool?: string) {
  const params: Record<string, string> = { network, limit };
  if (pool) params.pool = pool;
  return apiGet(jwt, "/v1/evm/swaps", params);
}
