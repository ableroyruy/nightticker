import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'https://api.hyperliquid.xyz/info';
const CANDLE_INTERVAL = '5m';
const FIVE_MINUTES_MS = 5 * 60 * 1000;

// 캐시 설정
const CACHE_TTL = 120000; // 2분 (5분 캔들이므로 2분이면 충분)
const MAX_BATCH_SIZE = 10; // 배치 요청 최대 개수
const MAX_CONCURRENT = 5; // 동시 요청 최대 개수

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

// 진행 중인 요청 (중복 방지)
const pendingFetches = new Map<string, Promise<CandleData[]>>();

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

  // 캐시 크기 제한 (100개 초과 시 오래된 것 제거)
  if (serverCache.size > 100) {
    const entries = Array.from(serverCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    for (let i = 0; i < 20; i++) {
      serverCache.delete(entries[i][0]);
    }
  }
}

async function fetchSingleCandle(symbol: string): Promise<CandleData[]> {
  // 진행 중인 요청이 있으면 재사용
  const pending = pendingFetches.get(symbol);
  if (pending) {
    return pending;
  }

  const fetchPromise = (async () => {
    try {
      // 타임스탬프를 5분 단위로 반올림
      const now = Math.floor(Date.now() / FIVE_MINUTES_MS) * FIVE_MINUTES_MS;
      const startTime = now - 6 * 60 * 60 * 1000; // 6시간

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
        throw new Error(`API error: ${response.status}`);
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

      setCachedCandles(symbol, candles);
      return candles;
    } catch (error) {
      console.error(`Failed to fetch candles for ${symbol}:`, error);
      return [];
    } finally {
      pendingFetches.delete(symbol);
    }
  })();

  pendingFetches.set(symbol, fetchPromise);
  return fetchPromise;
}

// 배치로 여러 심볼 fetch (동시성 제한)
async function fetchBatchCandles(symbols: string[]): Promise<Record<string, CandleData[]>> {
  const result: Record<string, CandleData[]> = {};
  const toFetch: string[] = [];

  // 캐시 확인
  for (const symbol of symbols) {
    const cached = getCachedCandles(symbol);
    if (cached) {
      result[symbol] = cached;
    } else {
      toFetch.push(symbol);
    }
  }

  // 동시성 제한하여 fetch
  for (let i = 0; i < toFetch.length; i += MAX_CONCURRENT) {
    const batch = toFetch.slice(i, i + MAX_CONCURRENT);
    const promises = batch.map(symbol =>
      fetchSingleCandle(symbol).then(data => ({ symbol, data }))
    );
    const results = await Promise.all(promises);
    for (const { symbol, data } of results) {
      result[symbol] = data;
    }
  }

  return result;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const symbols = searchParams.get('symbols'); // 배치용: comma-separated

  // 배치 요청
  if (symbols) {
    const symbolList = symbols
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(s => s.length > 0)
      .slice(0, MAX_BATCH_SIZE);

    if (symbolList.length === 0) {
      return NextResponse.json(
        { error: 'No valid symbols provided' },
        { status: 400 }
      );
    }

    try {
      const data = await fetchBatchCandles(symbolList);
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
        },
      });
    } catch (error) {
      console.error('Batch fetch failed:', error);
      return NextResponse.json(
        { error: 'Failed to fetch candles' },
        { status: 500 }
      );
    }
  }

  // 단일 심볼 요청
  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol or symbols parameter is required' },
      { status: 400 }
    );
  }

  const normalizedSymbol = symbol.toUpperCase();

  // 캐시 확인
  const cached = getCachedCandles(normalizedSymbol);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
      },
    });
  }

  try {
    const candles = await fetchSingleCandle(normalizedSymbol);
    return NextResponse.json(candles, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
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
