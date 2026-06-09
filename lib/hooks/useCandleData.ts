'use client';

import { useState, useEffect } from 'react';
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
}

// 전역 캐시
const cache = new Map<string, CacheEntry>();
// 진행 중인 요청 (중복 방지)
const pendingRequests = new Map<string, Promise<CandleData[]>>();
// 데이터 업데이트 콜백 (여러 컴포넌트가 같은 심볼 구독)
const updateCallbacks = new Map<string, Set<(data: CandleData[]) => void>>();

function getChange(candles: CandleData[]) {
  if (candles.length < 2) return { change24h: 0, changePercent24h: 0 };
  const first = candles[0].close;
  const last = candles[candles.length - 1].close;
  const change24h = last - first;
  const changePercent24h = first > 0 ? (change24h / first) * 100 : 0;
  return { change24h, changePercent24h };
}

function isCacheValid(symbol: string): boolean {
  const entry = cache.get(symbol);
  return !!(entry && Date.now() - entry.timestamp < CACHE_TTL && entry.data.length > 0);
}

function getCachedData(symbol: string): CandleData[] | null {
  if (isCacheValid(symbol)) {
    return cache.get(symbol)!.data;
  }
  return null;
}

// 데이터 도착시 모든 구독자에게 알림
function notifySubscribers(symbol: string, data: CandleData[]) {
  const callbacks = updateCallbacks.get(symbol);
  if (callbacks) {
    callbacks.forEach(cb => cb(data));
  }
}

// 구독 등록
function subscribe(symbol: string, callback: (data: CandleData[]) => void) {
  if (!updateCallbacks.has(symbol)) {
    updateCallbacks.set(symbol, new Set());
  }
  updateCallbacks.get(symbol)!.add(callback);

  return () => {
    const callbacks = updateCallbacks.get(symbol);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        updateCallbacks.delete(symbol);
      }
    }
  };
}

// API 요청 (중복 방지)
async function fetchCandles(symbol: string): Promise<CandleData[]> {
  // 캐시 확인
  const cached = getCachedData(symbol);
  if (cached) return cached;

  // 이미 진행 중인 요청이 있으면 그 결과 대기
  const pending = pendingRequests.get(symbol);
  if (pending) return pending;

  // 새 요청 시작
  const request = (async () => {
    try {
      const res = await fetch(`${CANDLES_API}?symbol=${symbol}`, {
        cache: 'no-store',
      });

      if (!res.ok) return [];

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        cache.set(symbol, { data, timestamp: Date.now() });
        // 모든 구독자에게 알림
        notifySubscribers(symbol, data);
        return data;
      }
      return [];
    } catch {
      return [];
    } finally {
      pendingRequests.delete(symbol);
    }
  })();

  pendingRequests.set(symbol, request);
  return request;
}

export function useCandleData(symbol: string): CandleState & { status: ConnectionStatus } {
  const sym = symbol.toUpperCase();

  const [state, setState] = useState<CandleState>(() => {
    const cached = getCachedData(sym);
    if (cached) {
      const { change24h, changePercent24h } = getChange(cached);
      return {
        candles: cached,
        currentPrice: cached[cached.length - 1]?.close ?? null,
        change24h,
        changePercent24h,
        loading: false,
        error: null,
      };
    }
    return {
      candles: [],
      currentPrice: null,
      change24h: null,
      changePercent24h: null,
      loading: true,
      error: null,
    };
  });

  const [status, setStatus] = useState<ConnectionStatus>('connecting');

  useEffect(() => {
    let active = true;

    // 데이터 업데이트 핸들러
    const handleUpdate = (data: CandleData[]) => {
      if (!active) return;
      const { change24h, changePercent24h } = getChange(data);
      setState({
        candles: data,
        currentPrice: data[data.length - 1]?.close ?? null,
        change24h,
        changePercent24h,
        loading: false,
        error: null,
      });
      setStatus('connected');
    };

    // 구독 등록 (다른 컴포넌트의 fetch 결과도 받음)
    const unsubscribe = subscribe(sym, handleUpdate);

    // 데이터 로드
    async function load() {
      const data = await fetchCandles(sym);

      if (active) {
        if (data.length > 0) {
          handleUpdate(data);
        } else {
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'No data',
          }));
          setStatus('connected');
        }
      }
    }

    load();

    // 폴링
    const interval = setInterval(() => {
      if (active) {
        // 폴링 시에는 캐시 무효화
        const entry = cache.get(sym);
        if (entry) {
          entry.timestamp = 0; // 강제로 캐시 만료
        }
        load();
      }
    }, POLL_INTERVAL);

    return () => {
      active = false;
      unsubscribe();
      clearInterval(interval);
    };
  }, [sym]);

  return { ...state, status };
}
