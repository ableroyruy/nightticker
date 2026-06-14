import { NextResponse } from 'next/server';

const API_URL = 'https://api.hyperliquid.xyz/info';
const CACHE_TTL = 3000; // 3초 (실시간 가격)
const META_CACHE_TTL = 60000; // 60초 (prevDayPx)

interface AssetContext {
  prevDayPx: string;
}

interface AssetMeta {
  name: string;
}

interface TickerData {
  price: number;
  prevDayPx: number;
  change24h: number;
  changePercent24h: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

let priceCache: CacheEntry<Record<string, string>> | null = null;
let metaCache: CacheEntry<Record<string, number>> | null = null;

// Fetch prices from Hyperliquid
async function fetchPrices(): Promise<Record<string, string>> {
  if (priceCache && Date.now() - priceCache.timestamp < CACHE_TTL) {
    return priceCache.data;
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'allMids' }),
  });

  if (!response.ok) {
    throw new Error(`Hyperliquid API error: ${response.status}`);
  }

  const data = await response.json();
  priceCache = { data, timestamp: Date.now() };
  return data;
}

// Fetch meta (prevDayPx) from Hyperliquid
async function fetchMeta(): Promise<Record<string, number>> {
  if (metaCache && Date.now() - metaCache.timestamp < META_CACHE_TTL) {
    return metaCache.data;
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'metaAndAssetCtxs', dex: 'xyz' }),
  });

  if (!response.ok) {
    throw new Error(`Hyperliquid API error: ${response.status}`);
  }

  const data = await response.json();
  const prevDayPrices: Record<string, number> = {};

  if (Array.isArray(data) && data.length >= 2) {
    const universe: AssetMeta[] = data[0].universe || [];
    const contexts: AssetContext[] = data[1] || [];

    universe.forEach((meta, index) => {
      const ctx = contexts[index];
      if (meta.name && ctx?.prevDayPx) {
        const prevDayPx = parseFloat(ctx.prevDayPx);
        if (!isNaN(prevDayPx) && prevDayPx > 0) {
          const symbol = meta.name.replace('xyz:', '');
          prevDayPrices[symbol] = prevDayPx;
        }
      }
    });
  }

  metaCache = { data: prevDayPrices, timestamp: Date.now() };
  return prevDayPrices;
}

export async function GET() {
  try {
    // Fetch both in parallel
    const [prices, meta] = await Promise.all([fetchPrices(), fetchMeta()]);

    // Combine into ticker data
    const tickers: Record<string, TickerData> = {};

    for (const [rawSymbol, priceStr] of Object.entries(prices)) {
      const price = parseFloat(priceStr);
      if (isNaN(price)) continue;

      const symbol = rawSymbol.replace('xyz:', '');
      const prevDayPx = meta[symbol] || 0;
      const change24h = prevDayPx > 0 ? price - prevDayPx : 0;
      const changePercent24h = prevDayPx > 0 ? (change24h / prevDayPx) * 100 : 0;

      tickers[symbol] = {
        price,
        prevDayPx,
        change24h,
        changePercent24h,
      };
    }

    return NextResponse.json(tickers, {
      headers: {
        'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=10',
      },
    });
  } catch (error) {
    console.error('Failed to fetch ticker:', error);

    // Fallback: return cached data if available
    if (priceCache?.data && metaCache?.data) {
      const tickers: Record<string, TickerData> = {};
      for (const [rawSymbol, priceStr] of Object.entries(priceCache.data)) {
        const price = parseFloat(priceStr);
        if (isNaN(price)) continue;
        const symbol = rawSymbol.replace('xyz:', '');
        const prevDayPx = metaCache.data[symbol] || 0;
        const change24h = prevDayPx > 0 ? price - prevDayPx : 0;
        const changePercent24h = prevDayPx > 0 ? (change24h / prevDayPx) * 100 : 0;
        tickers[symbol] = { price, prevDayPx, change24h, changePercent24h };
      }
      return NextResponse.json(tickers, {
        headers: { 'Cache-Control': 'public, s-maxage=1' },
      });
    }

    return NextResponse.json({ error: 'Failed to fetch ticker' }, { status: 500 });
  }
}
