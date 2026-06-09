import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'https://api.hyperliquid.xyz/info';
const CANDLE_INTERVAL = '5m';
const CACHE_REVALIDATE = 30; // 30 seconds

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

async function fetchCandles(symbol: string): Promise<CandleData[]> {
  const now = Date.now();
  const startTime = now - 6 * 60 * 60 * 1000; // 6 hours

  // Use Next.js fetch cache with revalidation
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
    next: { revalidate: CACHE_REVALIDATE, tags: [`candles-${symbol}`] },
  });

  if (!response.ok) {
    throw new Error(`Hyperliquid API error: ${response.status}`);
  }

  const rawData: RawCandle[] = await response.json();

  if (!Array.isArray(rawData)) {
    return [];
  }

  return rawData.map((c) => ({
    time: Math.floor(c.t / 1000),
    open: parseFloat(c.o),
    high: parseFloat(c.h),
    low: parseFloat(c.l),
    close: parseFloat(c.c),
    volume: parseFloat(c.v),
  }));
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
    const candles = await fetchCandles(symbol.toUpperCase());

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
