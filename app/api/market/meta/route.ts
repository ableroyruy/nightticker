import { NextResponse } from 'next/server';
import { metaCache, marketHeaders } from '@/lib/market/data';

export async function GET() {
  try {
    const entry = await metaCache.get();
    return NextResponse.json(entry.data.prices, { headers: marketHeaders(entry.timestamp, entry.stale, 60) });
  } catch {
    return NextResponse.json({ error: 'Metadata temporarily unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
