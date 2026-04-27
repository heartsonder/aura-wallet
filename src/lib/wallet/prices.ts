// Live price fetcher with graceful fallback to seeded mock prices.
import { CHAIN_LIST, CHAINS, ChainId } from "./crypto";

const FALLBACK: Record<ChainId, number> = {
  BTC: 67_420,
  ETH: 3_280,
  SOL: 162.4,
  USDT: 1.0,
};

export interface PriceMap {
  prices: Record<ChainId, number>;
  change24h: Record<ChainId, number>;
}

export async function fetchPrices(): Promise<PriceMap> {
  const ids = CHAIN_LIST.map((c) => c.coingeckoId).join(",");
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { headers: { accept: "application/json" } }
    );
    if (!res.ok) throw new Error("price fetch failed");
    const data = await res.json();
    const prices = {} as Record<ChainId, number>;
    const change = {} as Record<ChainId, number>;
    (Object.keys(CHAINS) as ChainId[]).forEach((id) => {
      const row = data[CHAINS[id].coingeckoId];
      prices[id] = row?.usd ?? FALLBACK[id];
      change[id] = row?.usd_24h_change ?? 0;
    });
    return { prices, change24h: change };
  } catch {
    return {
      prices: { ...FALLBACK },
      change24h: { BTC: 1.2, ETH: -0.6, SOL: 3.4, USDT: 0.01 },
    };
  }
}
