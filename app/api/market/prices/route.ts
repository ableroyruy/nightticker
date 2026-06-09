import { NextResponse } from 'next/server';

const API_URL = 'https://api.hyperliquid.xyz/info';
const CACHE_TTL = 3000; // 3초 (WebSocket 있으니 초기 로드용)

interface CacheEntry {
  data: Record<string, string>;
  timestamp: number;
}

let priceCache: CacheEntry | null = null;

async function fetchPrices(): Promise<Record<string, string>> {
  // 서버 캐시 확인
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

  // 서버 캐시 저장
  priceCache = {
    data,
    timestamp: Date.now(),
  };

  return data;
}

export async function GET() {
  try {
    const prices = await fetchPrices();

    return NextResponse.json(prices, {
      headers: {
        'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=10',
      },
    });
  } catch (error) {
    console.error('Failed to fetch prices:', error);

    // 에러 시 만료된 캐시라도 반환
    if (priceCache?.data) {
      return NextResponse.json(priceCache.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=1',
        },
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}
