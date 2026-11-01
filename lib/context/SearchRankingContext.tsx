'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
import { stocks } from '@/lib/markets/stocks';
import { defaultRankings, MAX_BATCH_SIZE, MAX_EVENT_AGE_MS, validateBatch, type RankingData, type RankingItem, type ViewBatch } from '@/lib/ranking/core';

export type SearchRankingItem = RankingItem;
interface SearchRankingContextValue {
  rankings: SearchRankingItem[];
  recordPageView: (symbol: string) => void;
  getTopRankings: (limit?: number) => SearchRankingItem[];
  isLoading: boolean;
}
const SearchRankingContext = createContext<SearchRankingContextValue | null>(null);
const active = new Set(stocks.map(stock => stock.symbol));
const CACHE_KEY = 'nightticker_ranking_cache_v3';
const QUEUE_KEY = 'nightticker_ranking_queue_v1';
const MAX_QUEUED_BATCHES = 10;

function readCache(): RankingData | null {
  try {
    const value = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null') as RankingData | null;
    if (value && Array.isArray(value.rankings) && Date.now() < value.expiresAt && value.lastUpdated <= Date.now()) return value;
  } catch { /* Browser storage may be disabled. */ }
  return null;
}

export function SearchRankingProvider({ children }: { children: ReactNode }) {
  const [rankings, setRankings] = useState<SearchRankingItem[]>(() => defaultRankings(active));
  const [isLoading, setIsLoading] = useState(true);
  const queueRef = useRef<ViewBatch[]>([]);
  const loadedRef = useRef(false);
  const mountedRef = useRef(false);
  const flushingRef = useRef(false);
  const sendingIdRef = useRef<string | null>(null);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failuresRef = useRef(0);

  const persistQueue = useCallback(() => {
    try { sessionStorage.setItem(QUEUE_KEY, JSON.stringify(queueRef.current)); } catch { /* In-memory delivery still works. */ }
  }, []);

  const loadQueue = useCallback(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    try {
      const stored: unknown = JSON.parse(sessionStorage.getItem(QUEUE_KEY) || '[]');
      if (Array.isArray(stored)) {
        queueRef.current = stored.slice(0, MAX_QUEUED_BATCHES).map(value => validateBatch(value, active, Date.now())).filter((value): value is ViewBatch => value !== null);
        for (const batch of queueRef.current) Object.freeze(batch.events);
      }
    } catch { /* A malformed queue must not break the page. */ }
  }, []);

  const flushPendingViews = useCallback(async function flush(): Promise<void> {
    loadQueue();
    if (flushingRef.current) return;
    if (flushTimerRef.current) { clearTimeout(flushTimerRef.current); flushTimerRef.current = null; }
    queueRef.current = queueRef.current.filter(batch => batch.events.every(event => Date.now() - event.timestamp < MAX_EVENT_AGE_MS));
    const batch = queueRef.current[0];
    persistQueue();
    if (!batch) return;
    flushingRef.current = true;
    sendingIdRef.current = batch.id;
    // Freeze the batch before the first attempt. Future views get a new id,
    // so retries and pagehide never reuse an id for a changed payload.
    Object.freeze(batch.events);
    let delay = 0;
    try {
      const response = await fetch('/api/ranking', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch), keepalive: true, signal: AbortSignal.timeout(10_000),
      });
      if (response.ok || [400, 403, 409, 413].includes(response.status)) {
        queueRef.current = queueRef.current.filter(item => item.id !== batch.id);
        failuresRef.current = 0;
      } else {
        failuresRef.current++;
        const retrySeconds = Number(response.headers.get('Retry-After'));
        delay = Math.min(300_000, Math.max(Number.isFinite(retrySeconds) ? retrySeconds * 1000 : 0, 30_000 * 2 ** Math.min(failuresRef.current - 1, 4)));
      }
    } catch {
      failuresRef.current++;
      delay = Math.min(300_000, 30_000 * 2 ** Math.min(failuresRef.current - 1, 4));
    } finally {
      flushingRef.current = false;
      sendingIdRef.current = null;
      persistQueue();
      if (mountedRef.current && queueRef.current.length) flushTimerRef.current = setTimeout(flush, delay || 2000);
    }
  }, [loadQueue, persistQueue]);

  const recordPageView = useCallback((symbol: string) => {
    if (!active.has(symbol)) return;
    loadQueue();
    const now = Date.now();
    const tail = queueRef.current.at(-1);
    // Suppress React Strict Mode's duplicate mount effect without suppressing a
    // later visit to the same stock. No extra Redis read is needed.
    const last = tail?.events.at(-1);
    if (last?.symbol === symbol && now - last.timestamp < 1000) return;
    if (tail && tail.id !== sendingIdRef.current && !Object.isFrozen(tail.events) && tail.events.length < MAX_BATCH_SIZE) {
      tail.events.push({ symbol, timestamp: now });
    } else {
      if (queueRef.current.length >= MAX_QUEUED_BATCHES) return;
      queueRef.current.push({ id: crypto.randomUUID(), events: [{ symbol, timestamp: now }] });
    }
    persistQueue();
    if (!flushTimerRef.current && !flushingRef.current) flushTimerRef.current = setTimeout(flushPendingViews, 2000);
  }, [loadQueue, persistQueue, flushPendingViews]);

  useEffect(() => {
    mountedRef.current = true;
    loadQueue();
    // Persisted batches may have been sent before a reload; never append to them.
    for (const batch of queueRef.current) Object.freeze(batch.events);
    let cancelled = false;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    let fetching = false;
    const schedule = (delay: number) => {
      if (!cancelled) refreshTimer = setTimeout(refresh, Math.max(30_000, delay));
    };
    async function refresh() {
      if (cancelled || fetching) return;
      fetching = true;
      try {
        const response = await fetch('/api/ranking', { signal: AbortSignal.timeout(10_000) });
        if (!response.ok) throw new Error('Ranking unavailable');
        const data: RankingData = await response.json();
        if (!Array.isArray(data.rankings) || !Number.isFinite(data.expiresAt)) throw new Error('Invalid ranking response');
        if (cancelled) return;
        setRankings(data.rankings.filter(item => active.has(item.symbol)));
        if (!data.degraded) {
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* Optional cache. */ }
        }
        schedule(data.degraded ? 30_000 : data.expiresAt - Date.now());
      } catch {
        schedule(60_000);
      } finally {
        fetching = false;
        if (!cancelled) setIsLoading(false);
      }
    }
    Promise.resolve().then(() => {
      if (cancelled) return;
      const cached = readCache();
      if (cached) {
        setRankings(cached.rankings.filter(item => active.has(item.symbol)));
        setIsLoading(false);
        schedule(cached.expiresAt - Date.now());
      } else void refresh();
      if (queueRef.current.length && !flushTimerRef.current) flushTimerRef.current = setTimeout(flushPendingViews, 2000);
    });
    const flushOnHide = () => { if (document.visibilityState === 'hidden') void flushPendingViews(); };
    const flushOnPageHide = () => { void flushPendingViews(); };
    document.addEventListener('visibilitychange', flushOnHide);
    window.addEventListener('pagehide', flushOnPageHide);
    return () => {
      cancelled = true;
      mountedRef.current = false;
      if (refreshTimer) clearTimeout(refreshTimer);
      if (flushTimerRef.current) { clearTimeout(flushTimerRef.current); flushTimerRef.current = null; }
      document.removeEventListener('visibilitychange', flushOnHide);
      window.removeEventListener('pagehide', flushOnPageHide);
      persistQueue();
    };
  }, [loadQueue, flushPendingViews, persistQueue]);

  const getTopRankings = useCallback((limit = 10) => rankings.slice(0, limit), [rankings]);
  const value = useMemo(() => ({ rankings, recordPageView, getTopRankings, isLoading }), [rankings, recordPageView, getTopRankings, isLoading]);
  return <SearchRankingContext.Provider value={value}>{children}</SearchRankingContext.Provider>;
}

export function useSearchRanking() {
  const context = useContext(SearchRankingContext);
  if (!context) throw new Error('useSearchRanking must be used within a SearchRankingProvider');
  return context;
}
