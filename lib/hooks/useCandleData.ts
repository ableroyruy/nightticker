'use client';

import { useSyncExternalStore, useCallback } from 'react';
import { ConnectionStatus } from '@/lib/types/market';

const CANDLES_API = '/api/market/candles';
const CACHE_TTL = 120000; // 2분
const POLL_INTERVAL = 300000; // 5분

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandleState {
  candles: CandleData[];
  currentPrice: number | null;
  change24h: number | null;
  changePercent24h: number | null;
  loading: boolean;
  error: string | null;
}

interface CacheEntry {
  data: CandleData[];
  timestamp: number;
  loading: boolean;
  error: string | null;
}

// 전역 스토어
const store = new Map<string, CacheEntry>();
const subscribers = new Map<string, Set<() => void>>();
const fetchPromises = new Map<string, Promise<void>>();
const pollIntervals = new Map<string, NodeJS.Timeout>();

function getChange(candles: CandleData[]) {
  if (candles.length < 2) return { change24h: 0, changePercent24h: 0 };
  const first = candles[0].close;
  const last = candles[candles.length - 1].close;
  const change24h = last - first;
  const changePercent24h = first > 0 ? (change24h / first) * 100 : 0;
  return { change24h, changePercent24h };
}

function notifySubscribers(symbol: string) {
  const subs = subscribers.get(symbol);
  if (subs) {
    subs.forEach(cb => cb());
  }
}

function subscribe(symbol: string, callback: () => void) {
  if (!subscribers.has(symbol)) {
    subscribers.set(symbol, new Set());
  }
  subscribers.get(symbol)!.add(callback);

  // 첫 구독자면 fetch 시작
  if (subscribers.get(symbol)!.size === 1) {
    startFetching(symbol);
  }

  return () => {
    const subs = subscribers.get(symbol);
    if (subs) {
      subs.delete(callback);
      // 마지막 구독자가 떠나면 polling 중지
      if (subs.size === 0) {
        stopPolling(symbol);
        subscribers.delete(symbol);
      }
    }
  };
}

function getSnapshot(symbol: string): CacheEntry {
  const cached = store.get(symbol);
  if (cached) return cached;

  // 기본값 반환 (loading 상태)
  return {
    data: [],
    timestamp: 0,
    loading: true,
    error: null,
  };
}

async function fetchCandles(symbol: string): Promise<CandleData[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${CANDLES_API}?symbol=${symbol}`, {
      signal: controller.signal,
      cache: 'no-store', // 브라우저 캐시 사용 안함
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return [];
  } catch {
    clearTimeout(timeoutId);
    return [];
  }
}

async function startFetching(symbol: string) {
  // 이미 fetch 중이면 스킵
  if (fetchPromises.has(symbol)) return;

  // 캐시가 유효하면 스킵
  const cached = store.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL && cached.data.length > 0) {
    return;
  }

  const fetchPromise = (async () => {
    // loading 상태로 업데이트
    store.set(symbol, {
      data: cached?.data ?? [],
      timestamp: cached?.timestamp ?? 0,
      loading: true,
      error: null,
    });
    notifySubscribers(symbol);

    const data = await fetchCandles(symbol);

    // 데이터 저장
    store.set(symbol, {
      data,
      timestamp: Date.now(),
      loading: false,
      error: data.length === 0 ? 'No data' : null,
    });
    notifySubscribers(symbol);

    fetchPromises.delete(symbol);
  })();

  fetchPromises.set(symbol, fetchPromise);
  await fetchPromise;

  // polling 시작
  startPolling(symbol);
}

function startPolling(symbol: string) {
  if (pollIntervals.has(symbol)) return;

  const interval = setInterval(async () => {
    // 구독자가 없으면 중지
    if (!subscribers.has(symbol) || subscribers.get(symbol)!.size === 0) {
      stopPolling(symbol);
      return;
    }

    const data = await fetchCandles(symbol);
    if (data.length > 0) {
      store.set(symbol, {
        data,
        timestamp: Date.now(),
        loading: false,
        error: null,
      });
      notifySubscribers(symbol);
    }
  }, POLL_INTERVAL);

  pollIntervals.set(symbol, interval);
}

function stopPolling(symbol: string) {
  const interval = pollIntervals.get(symbol);
  if (interval) {
    clearInterval(interval);
    pollIntervals.delete(symbol);
  }
}

export function useCandleData(symbol: string): CandleState & { status: ConnectionStatus } {
  const sym = symbol.toUpperCase();

  const subscribeToSymbol = useCallback(
    (callback: () => void) => subscribe(sym, callback),
    [sym]
  );

  const getSnapshotForSymbol = useCallback(
    () => getSnapshot(sym),
    [sym]
  );

  const entry = useSyncExternalStore(
    subscribeToSymbol,
    getSnapshotForSymbol,
    getSnapshotForSymbol // SSR용
  );

  const { change24h, changePercent24h } = entry.data.length > 0
    ? getChange(entry.data)
    : { change24h: null, changePercent24h: null };

  return {
    candles: entry.data,
    currentPrice: entry.data.length > 0 ? entry.data[entry.data.length - 1]?.close ?? null : null,
    change24h,
    changePercent24h,
    loading: entry.loading,
    error: entry.error,
    status: entry.loading ? 'connecting' : 'connected',
  };
}
