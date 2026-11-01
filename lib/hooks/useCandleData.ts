'use client';

import { useState, useEffect } from 'react';
import type { ConnectionStatus } from '@/lib/types/market';

export interface CandleData { time: number; open: number; high: number; low: number; close: number; volume: number }
interface CacheEntry { data: CandleData[]; timestamp: number }
interface Result { data: CandleData[]; error: string | null }
interface CandleState {
  candles: CandleData[];
  currentPrice: number | null;
  change24h: number | null;
  changePercent24h: number | null;
  loading: boolean;
  error: string | null;
  status: ConnectionStatus;
}
const cache = new Map<string, CacheEntry>();
const pending = new Map<string, Promise<Result>>();
let queue = new Map<string, (result: Result) => void>();
let batchTimer: ReturnType<typeof setTimeout> | null = null;
function cached(symbol: string, maxAge = 120000) {
  const entry = cache.get(symbol);
  return entry && Date.now() - entry.timestamp < maxAge ? entry : null;
}
async function runBatch() {
  const requests = queue;
  queue = new Map(); batchTimer = null;
  const symbols = [...requests.keys()].sort();
  for (let i = 0; i < symbols.length; i += 10) {
    const batch = symbols.slice(i, i + 10);
    let data: Record<string, CandleData[]> = {};
    let timestamp = 0;
    let stale = false;
    try {
      const response = await fetch(`/api/market/candles?symbols=${encodeURIComponent(batch.join(','))}`, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error('Chart request failed');
      data = await response.json();
      timestamp = Number(response.headers.get('X-Data-Timestamp'));
      stale = response.headers.get('X-Data-Stale') === 'true';
    } catch { /* Each symbol retains its last good data below. */ }
    for (const symbol of batch) {
      const candles = data[symbol];
      const valid = Array.isArray(candles) && candles.every(c => [c.time, c.open, c.high, c.low, c.close, c.volume].every(Number.isFinite));
      let result: Result;
      if (valid && timestamp > 0 && Date.now() - timestamp < 600000) {
        if (!stale) {
          cache.set(symbol, { data: candles, timestamp });
          if (cache.size > 256) cache.delete(cache.keys().next().value!);
        }
        result = { data: candles, error: stale ? 'Chart data is delayed' : candles.length ? null : 'No chart data' };
      } else {
        result = { data: cached(symbol, 600000)?.data ?? [], error: 'Chart data temporarily unavailable' };
      }
      pending.delete(symbol);
      requests.get(symbol)?.(result);
    }
  }
}
function fetchCandles(symbol: string): Promise<Result> {
  const entry = cached(symbol);
  if (entry) return Promise.resolve({ data: entry.data, error: entry.data.length ? null : 'No chart data' });
  const existing = pending.get(symbol);
  if (existing) return existing;
  const promise = new Promise<Result>(resolve => {
    queue.set(symbol, resolve);
    if (!batchTimer) batchTimer = setTimeout(() => { void runBatch(); }, 50);
  });
  pending.set(symbol, promise);
  return promise;
}
function stateFor(result?: Result): CandleState {
  return {
    candles: result?.data ?? [], currentPrice: result?.data.at(-1)?.close ?? null,
    // The chart covers six hours; it must never manufacture a 24h change.
    change24h: null, changePercent24h: null,
    loading: !result, error: result?.error ?? null,
    status: !result ? 'connecting' : result.error && result.error !== 'No chart data' ? 'disconnected' : 'connected',
  };
}
export function useCandleData(symbol: string, enabled = true): CandleState {
  const sym = symbol.replace(/^xyz:/i, '').toUpperCase();
  const [state, setState] = useState(() => {
    const entry = cached(sym);
    return stateFor(entry ? { data: entry.data, error: null } : undefined);
  });
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!enabled || document.visibilityState === 'hidden') return;
      const result = await fetchCandles(sym);
      if (!cancelled) setState(stateFor(result));
    }
    Promise.resolve().then(() => { if (!cancelled) { setState(stateFor()); void load(); } });
    const interval = setInterval(() => { void load(); }, 300000);
    const onVisible = () => { if (document.visibilityState === 'visible') void load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { cancelled = true; clearInterval(interval); document.removeEventListener('visibilitychange', onVisible); };
  }, [sym, enabled]);
  return state;
}
