import { NextResponse } from 'next/server';

const API_URL = 'https://api.hyperliquid.xyz/info';
const CACHE_REVALIDATE = 1; // 1 second

async function fetchPrices(): Promise<Record<string, string>> {
  // Use Next.js fetch cache with revalidation
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'allMids' }),
    next: { revalidate: CACHE_REVALIDATE, tags: ['all-prices'] },
  });

  if (!response.ok) {
    throw new Error(`Hyperliquid API error: ${response.status}`);
  }

  return response.json();
}

export async function GET() {
  try {
    const prices = await fetchPrices();

    return NextResponse.json(prices, {
      headers: {
        'Cache-Control': 'public, s-maxage=1, stale-while-revalidate=5',
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
