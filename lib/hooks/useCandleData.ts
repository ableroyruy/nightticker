'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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

// 전역 캐시
const cache = new Map<string, { data: CandleData[]; timestamp: number }>();
// 진행 중인 요청 (Promise 공유)
const pending = new Map<string, Promise<CandleData[]>>();
// 캐시 업데이트 리스너 (React Strict Mode 대응)
const listeners = new Map<string, Set<(data: CandleData[]) => void>>();

function getChange(candles: CandleData[]) {
  if (candles.length < 2) return { change24h: 0, changePercent24h: 0 };
  const first = candles[0].close;
  const last = candles[candles.length - 1].close;
  const change24h = last - first;
  const changePercent24h = first > 0 ? (change24h / first) * 100 : 0;
  return { change24h, changePercent24h };
}

function notifyListeners(symbol: string, data: CandleData[]) {
  const symbolListeners = listeners.get(symbol);
  if (symbolListeners) {
    symbolListeners.forEach(listener => listener(data));
  }
}

function subscribe(symbol: string, listener: (data: CandleData[]) => void) {
  if (!listeners.has(symbol)) {
    listeners.set(symbol, new Set());
  }
  listeners.get(symbol)!.add(listener);
  return () => {
    const symbolListeners = listeners.get(symbol);
    if (symbolListeners) {
      symbolListeners.delete(listener);
      if (symbolListeners.size === 0) {
        listeners.delete(symbol);
      }
    }
  };
}

async function fetchCandles(symbol: string, retries = 3): Promise<CandleData[]> {
  // 캐시 확인
  const cached = cache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // 진행 중인 요청 재사용
  const inflight = pending.get(symbol);
  if (inflight) return inflight;

  const promise = (async () => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

      try {
        const res = await fetch(`${CANDLES_API}?symbol=${symbol}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          if (attempt < retries) {
            await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
            continue;
          }
          return [];
        }

        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          cache.set(symbol, { data, timestamp: Date.now() });
          // 모든 리스너에게 알림 (Strict Mode에서 cancelled된 컴포넌트도 받을 수 있도록)
          notifyListeners(symbol, data);
          return data;
        }
        return [];
      } catch (e) {
        clearTimeout(timeoutId);
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
          continue;
        }
        return [];
      }
    }
    return [];
  })();

  pending.set(symbol, promise);
  promise.finally(() => pending.delete(symbol));
  return promise;
}

export function useCandleData(symbol: string): CandleState & { status: ConnectionStatus } {
  const sym = symbol.toUpperCase();

  const [state, setState] = useState<CandleState>(() => {
    const cached = cache.get(sym);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL && cached.data.length > 0) {
      const { change24h, changePercent24h } = getChange(cached.data);
      return {
        candles: cached.data,
        currentPrice: cached.data[cached.data.length - 1]?.close ?? null,
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
  const mountedRef = useRef(true);

  // 데이터 업데이트 핸들러
  const handleDataUpdate = useCallback((data: CandleData[]) => {
    if (!mountedRef.current) return;
    if (data.length > 0) {
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
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // 1. 먼저 캐시 확인 (Strict Mode에서 이전 마운트가 캐시를 채웠을 수 있음)
    const cached = cache.get(sym);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL && cached.data.length > 0) {
      handleDataUpdate(cached.data);
    }

    // 2. 리스너 등록 (다른 컴포넌트의 fetch가 완료되면 알림 받음)
    const unsubscribe = subscribe(sym, handleDataUpdate);

    // 3. fetch 시작 (캐시가 있으면 바로 반환, 없으면 네트워크 요청)
    const load = async () => {
      const data = await fetchCandles(sym);
      // fetchCandles 내부에서 notifyListeners를 호출하므로
      // 여기서는 캐시 히트 케이스만 처리
      if (data.length > 0 && mountedRef.current) {
        handleDataUpdate(data);
      } else if (data.length === 0 && mountedRef.current) {
        setState(prev => ({ ...prev, loading: false }));
        setStatus('connected');
      }
    };

    load();
    const interval = setInterval(load, POLL_INTERVAL);

    return () => {
      mountedRef.current = false;
      unsubscribe();
      clearInterval(interval);
    };
  }, [sym, handleDataUpdate]);

  return { ...state, status };
}
