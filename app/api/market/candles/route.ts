import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'https://api.hyperliquid.xyz/info';
const CANDLE_INTERVAL = '5m';
const FIVE_MINUTES_MS = 5 * 60 * 1000;

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

// 서버 인메모리 캐시 (심볼별)
const serverCache = new Map<string, CacheEntry>();
const CACHE_TTL = 60000; // 60초

function getCachedCandles(symbol: string): CandleData[] | null {
  const cached = serverCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedCandles(symbol: string, data: CandleData[]) {
  serverCache.set(symbol, {
    data,
    timestamp: Date.now(),
  });
}

async function fetchCandles(symbol: string): Promise<CandleData[]> {
  // 서버 캐시 확인
  const cached = getCachedCandles(symbol);
  if (cached) {
    return cached;
  }

  // 타임스탬프를 5분 단위로 반올림 (캐시 키 안정화)
  const now = Math.floor(Date.now() / FIVE_MINUTES_MS) * FIVE_MINUTES_MS;
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

  const candles = rawData.map((c) => ({
    time: Math.floor(c.t / 1000),
    open: parseFloat(c.o),
    high: parseFloat(c.h),
    low: parseFloat(c.l),
    close: parseFloat(c.c),
    volume: parseFloat(c.v),
  }));

  // 서버 캐시 저장
  setCachedCandles(symbol, candles);

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
    const candles = await fetchCandles(symbol.toUpperCase());

    return NextResponse.json(candles, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
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
