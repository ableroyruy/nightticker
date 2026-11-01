import { NextResponse } from 'next/server';
import { pricesCache, marketHeaders } from '@/lib/market/data';

export async function GET() {
  try {
    const entry = await pricesCache.get();
    return NextResponse.json(entry.data, { headers: marketHeaders(entry.timestamp, entry.stale, 3) });
  } catch {
    return NextResponse.json({ error: 'Prices temporarily unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
