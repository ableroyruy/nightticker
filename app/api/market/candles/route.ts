import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'https://api.hyperliquid.xyz/info';
const CACHE_TTL = 30000; // 30 seconds cache
const CANDLE_INTERVAL = '5m';

interface RawCandle {
  t: number;
  o: string;
  h: string;
  l: string;
  c: string;
  v: string;
}

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CacheEntry {
  data: CandleData[];
  timestamp: number;
}

// In-memory cache for candle data
const candleCache = new Map<string, CacheEntry>();

async function fetchCandles(symbol: string): Promise<CandleData[]> {
  const cacheKey = symbol.toUpperCase();

  // Check cache
  const cached = candleCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Fetch from Hyperliquid
  const now = Date.now();
  const startTime = now - 6 * 60 * 60 * 1000; // 6 hours

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'candleSnapshot',
      req: {
        coin: `xyz:${symbol}`,
        interval: CANDLE_INTERVAL,
        startTime,
        endTime: now,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Hyperliquid API error: ${response.status}`);
  }

  const rawData: RawCandle[] = await response.json();

  if (!Array.isArray(rawData)) {
    return [];
  }

  const candles: CandleData[] = rawData.map((c) => ({
    time: Math.floor(c.t / 1000),
    open: parseFloat(c.o),
    high: parseFloat(c.h),
    low: parseFloat(c.l),
    close: parseFloat(c.c),
    volume: parseFloat(c.v),
  }));

  // Update cache
  candleCache.set(cacheKey, {
    data: candles,
    timestamp: Date.now(),
  });

  return candles;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    );
  }

  try {
    const candles = await fetchCandles(symbol);

    return NextResponse.json(candles, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error(`Failed to fetch candles for ${symbol}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch candles' },
      { status: 500 }
    );
  }
}
