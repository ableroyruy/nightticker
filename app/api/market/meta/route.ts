import { NextResponse } from 'next/server';

const API_URL = 'https://api.hyperliquid.xyz/info';
const CACHE_TTL = 60000; // 60초 (prevDayPx는 자주 안 바뀜)

interface AssetContext {
  prevDayPx: string;
}

interface AssetMeta {
  name: string;
}

interface CacheEntry {
  data: Record<string, number>;
  timestamp: number;
}

let metaCache: CacheEntry | null = null;

async function fetchMeta(): Promise<Record<string, number>> {
  // 서버 캐시 확인
  if (metaCache && Date.now() - metaCache.timestamp < CACHE_TTL) {
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

  // prevDayPx 데이터만 추출
  const prevDayPrices: Record<string, number> = {};

  if (Array.isArray(data) && data.length >= 2) {
    const universe: AssetMeta[] = data[0].universe || [];
    const contexts: AssetContext[] = data[1] || [];

    universe.forEach((meta, index) => {
      const ctx = contexts[index];
      if (meta.name && ctx?.prevDayPx) {
        const prevDayPx = parseFloat(ctx.prevDayPx);
        if (!isNaN(prevDayPx) && prevDayPx > 0) {
          // xyz: 프리픽스 제거
          const symbol = meta.name.replace('xyz:', '');
          prevDayPrices[symbol] = prevDayPx;
        }
      }
    });
  }

  // 서버 캐시 저장
  metaCache = {
    data: prevDayPrices,
    timestamp: Date.now(),
  };

  return prevDayPrices;
}

export async function GET() {
  try {
    const meta = await fetchMeta();

    return NextResponse.json(meta, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Failed to fetch meta:', error);

    // 에러 시 만료된 캐시라도 반환
    if (metaCache?.data) {
      return NextResponse.json(metaCache.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=10',
        },
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch meta' },
      { status: 500 }
    );
  }
}
