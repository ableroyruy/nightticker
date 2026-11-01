import { NextResponse } from 'next/server';
import { getTicker, marketHeaders } from '@/lib/market/data';

export async function GET() {
  try {
    const data = await getTicker();
    return NextResponse.json(data.tickers, { headers: { ...marketHeaders(data.timestamp, data.stale, 3), 'X-Meta-Timestamp': String(data.metaTimestamp) } });
  } catch {
    return NextResponse.json({ error: 'Market data temporarily unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '5' } });
  }
}
