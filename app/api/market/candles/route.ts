import { NextRequest, NextResponse } from 'next/server';
import { stocks } from '@/lib/markets/stocks';
import { info, stripSymbol } from '@/lib/market/data';
import { RequestCache } from '@/lib/market/cache';

interface CandleData { time: number; open: number; high: number; low: number; close: number; volume: number }
interface RawCandle { t: number; o: string; h: string; l: string; c: string; v: string }
const allowed = new Set(stocks.map(stock => stripSymbol(stock.hyperliquidSymbol)));
const caches = new Map<string, RequestCache<CandleData[]>>();
let running = 0;
const waiters: Array<() => void> = [];
async function limited<T>(load: () => Promise<T>): Promise<T> {
  if (running >= 5) await new Promise<void>(resolve => waiters.push(resolve));
  else running++;
  try { return await load(); }
  finally { const next = waiters.shift(); if (next) next(); else running--; }
}
function cacheFor(symbol: string) {
  let cache = caches.get(symbol);
  if (!cache) {
    cache = new RequestCache(120000, 600000, () => limited(async () => {
      const now = Math.floor(Date.now() / 300000) * 300000;
      const raw = await info({ type: 'candleSnapshot', req: { coin: `xyz:${symbol}`, interval: '5m', startTime: now - 6 * 3600000, endTime: now } });
      if (!Array.isArray(raw)) throw new Error('Invalid candles');
      const candles = (raw as RawCandle[]).map(c => ({ time: Math.floor(c.t / 1000), open: Number(c.o), high: Number(c.h), low: Number(c.l), close: Number(c.c), volume: Number(c.v) }));
      if (candles.some(c => Object.values(c).some(value => !Number.isFinite(value)))) throw new Error('Invalid candle values');
      return candles.sort((a, b) => a.time - b.time).filter((c, i, list) => i === 0 || c.time !== list[i - 1].time);
    }));
    caches.set(symbol, cache);
    // Bounded by the validated catalog, so adding assets does not evict hot data.
  }
  return cache;
}
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const batch = params.get('symbols');
  const raw = batch ?? params.get('symbol');
  if (!raw || raw.length > 500) return NextResponse.json({ error: 'Symbol required' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  const symbols = [...new Set(raw.split(',').map(s => stripSymbol(s.trim())))].sort();
  if (!symbols.length || symbols.length > 10 || symbols.some(s => !allowed.has(s)) || (!batch && symbols.length !== 1)) return NextResponse.json({ error: 'Invalid symbols' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  const entries = await Promise.allSettled(symbols.map(async symbol => ({ symbol, entry: await cacheFor(symbol).get() })));
  const data: Record<string, CandleData[]> = {};
  let stale = false;
  let timestamp = Date.now();
  let failed = false;
  for (const result of entries) {
    if (result.status === 'rejected') { failed = true; continue; }
    data[result.value.symbol] = result.value.entry.data;
    stale ||= result.value.entry.stale;
    timestamp = Math.min(timestamp, result.value.entry.timestamp);
  }
  // Partial batch results remain usable, but are never cached as complete success.
  if (!Object.keys(data).length) return NextResponse.json({ error: 'Chart data temporarily unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '5' } });
  return NextResponse.json(batch ? data : data[symbols[0]], {
    status: failed ? 207 : 200,
    headers: { 'Cache-Control': stale || failed ? 'no-store' : `public, max-age=0, s-maxage=${Math.max(1, 120 - Math.floor((Date.now() - timestamp) / 1000))}, stale-while-revalidate=60`, 'X-Data-Timestamp': String(timestamp), 'X-Data-Stale': String(stale || failed) },
  });
}
