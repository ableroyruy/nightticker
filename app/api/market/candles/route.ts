import { NextRequest, NextResponse } from 'next/server';
import { stocks } from '@/lib/markets/stocks';
import { info, stripSymbol } from '@/lib/market/data';

interface CandleData { time: number; open: number; high: number; low: number; close: number; volume: number }
interface RawCandle { t: number; o: string; h: string; l: string; c: string; v: string }
const allowed = new Set(stocks.map(stock => stripSymbol(stock.hyperliquidSymbol)));
interface CandleEntry { data: CandleData[]; timestamp: number }
// Workers isolate I/O belongs to the request that started it. Share completed
// values only: another request must never await its promises or queue callbacks.
const snapshots = new Map<string, CandleEntry>();
async function loadCandles(symbol: string) {
  const previous = snapshots.get(symbol);
  if (previous && Date.now() - previous.timestamp < 120000) return { ...previous, stale: false };
  try {
    const now = Math.floor(Date.now() / 300000) * 300000;
    const raw = await info({ type: 'candleSnapshot', req: { coin: `xyz:${symbol}`, interval: '5m', startTime: now - 6 * 3600000, endTime: now } });
    if (!Array.isArray(raw)) throw new Error('Invalid candles');
    const candles = (raw as RawCandle[]).map(c => ({ time: Math.floor(c.t / 1000), open: Number(c.o), high: Number(c.h), low: Number(c.l), close: Number(c.c), volume: Number(c.v) }));
    if (candles.some(c => Object.values(c).some(value => !Number.isFinite(value)))) throw new Error('Invalid candle values');
    const entry = {
      data: candles.sort((a, b) => a.time - b.time).filter((c, i, list) => i === 0 || c.time !== list[i - 1].time),
      timestamp: Date.now(),
    };
    snapshots.set(symbol, entry);
    return { ...entry, stale: false };
  } catch (error) {
    const fallback = snapshots.get(symbol);
    if (fallback && Date.now() - fallback.timestamp < 600000) return { ...fallback, stale: true };
    throw error;
  }
}
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const batch = params.get('symbols');
  const raw = batch ?? params.get('symbol');
  if (!raw || raw.length > 500) return NextResponse.json({ error: 'Symbol required' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  const symbols = [...new Set(raw.split(',').map(s => stripSymbol(s.trim())))].sort();
  if (!symbols.length || symbols.length > 10 || symbols.some(s => !allowed.has(s)) || (!batch && symbols.length !== 1)) return NextResponse.json({ error: 'Invalid symbols' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  // Limit each HTTP request independently. A module-level semaphore can strand
  // queued work after its owning Worker request finishes (Cloudflare 1101).
  let running = 0;
  const waiters: Array<() => void> = [];
  async function limited(symbol: string) {
    if (running >= 5) await new Promise<void>(resolve => waiters.push(resolve));
    else running++;
    try { return { symbol, entry: await loadCandles(symbol) }; }
    finally { const next = waiters.shift(); if (next) next(); else running--; }
  }
  const entries = await Promise.allSettled(symbols.map(limited));
  const data: Record<string, CandleData[]> = {};
  let stale = false;
  let timestamp = Date.now();
  let failed = false;
  for (const [index, result] of entries.entries()) {
    if (result.status === 'rejected') {
      console.warn('[market-candles]', { symbol: symbols[index], reason: result.reason instanceof Error ? result.reason.message : 'Upstream request failed' });
      failed = true;
      continue;
    }
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
