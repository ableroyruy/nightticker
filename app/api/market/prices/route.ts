import { NextResponse } from 'next/server';

const API_URL = 'https://api.hyperliquid.xyz/info';
const CACHE_TTL = 5000; // 5 seconds cache

interface CacheEntry {
  data: Record<string, string>;
  timestamp: number;
}

let priceCache: CacheEntry | null = null;

async function fetchPrices(): Promise<Record<string, string>> {
  // Check cache
  if (priceCache && Date.now() - priceCache.timestamp < CACHE_TTL) {
    return priceCache.data;
  }

  // Fetch from Hyperliquid
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'allMids' }),
  });

  if (!response.ok) {
    throw new Error(`Hyperliquid API error: ${response.status}`);
  }

  const data = await response.json();

  // Update cache
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
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
      },
    });
  } catch (error) {
    console.error('Failed to fetch prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}
