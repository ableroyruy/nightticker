import { RequestCache } from './cache';

export const API_URL = 'https://api.hyperliquid.xyz/info';
export const stripSymbol = (symbol: string) => symbol.replace(/^xyz:/i, '').toUpperCase();
export interface TickerData {
  price: number;
  prevDayPx: number | null;
  change24h: number | null;
  changePercent24h: number | null;
}
export async function info(body: object): Promise<unknown> {
  const response = await fetch(API_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body), cache: 'no-store', signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Hyperliquid API error: ${response.status}`);
  return response.json();
}
export const pricesCache = new RequestCache(3000, 60000, async () => {
  const data = await info({ type: 'allMids', dex: 'xyz' });
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid prices');
  const prices: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && Number.isFinite(Number(value)) && Number(value) > 0) prices[key] = value;
  }
  if (!Object.keys(prices).length) throw new Error('Empty prices');
  return prices;
});
export const metaCache = new RequestCache(60000, 300000, async () => {
  const data = await info({ type: 'metaAndAssetCtxs', dex: 'xyz' });
  if (!Array.isArray(data) || !Array.isArray(data[0]?.universe) || !Array.isArray(data[1])) throw new Error('Invalid metadata');
  const prices: Record<string, number> = {};
  const delisted: string[] = [];
  data[0].universe.forEach((item: { name: string; isDelisted?: boolean }, index: number) => {
    const symbol = stripSymbol(item.name);
    if (item.isDelisted) { delisted.push(symbol); return; }
    const value = Number(data[1][index]?.prevDayPx);
    if (Number.isFinite(value) && value > 0) prices[symbol] = value;
  });
  return { prices, delisted };
});
export function makeTicker(price: number, prevDayPx: number | null): TickerData {
  const change24h = prevDayPx && prevDayPx > 0 ? price - prevDayPx : null;
  return { price, prevDayPx, change24h, changePercent24h: change24h !== null && prevDayPx ? change24h / prevDayPx * 100 : null };
}
export async function getTicker() {
  const [prices, meta] = await Promise.all([pricesCache.get(), metaCache.get()]);
  const tickers: Record<string, TickerData> = {};
  for (const [raw, value] of Object.entries(prices.data)) {
    const symbol = stripSymbol(raw);
    if (!meta.data.delisted.includes(symbol)) tickers[symbol] = makeTicker(Number(value), meta.data.prices[symbol] ?? null);
  }
  return { tickers, timestamp: prices.timestamp, metaTimestamp: meta.timestamp, stale: prices.stale || meta.stale };
}
export function marketHeaders(timestamp: number, stale: boolean, seconds: number) {
  return {
    'Cache-Control': stale ? 'no-store' : `public, max-age=0, s-maxage=${Math.max(1, seconds - Math.floor((Date.now() - timestamp) / 1000))}, stale-while-revalidate=${seconds === 3 ? 10 : 60}`,
    'X-Data-Timestamp': String(timestamp), 'X-Data-Stale': String(stale),
  };
}
