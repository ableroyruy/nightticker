'use client';

import { useState, useEffect, useRef } from 'react';
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

function getChange(candles: CandleData[]) {
  if (candles.length < 2) return { change24h: 0, changePercent24h: 0 };
  const first = candles[0].close;
  const last = candles[candles.length - 1].close;
  const change24h = last - first;
  const changePercent24h = first > 0 ? (change24h / first) * 100 : 0;
  return { change24h, changePercent24h };
}

async function fetchCandles(symbol: string, retries = 2): Promise<CandleData[]> {
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
      try {
        const res = await fetch(`${CANDLES_API}?symbol=${symbol}`);
        if (!res.ok) {
          if (attempt < retries) {
            await new Promise(r => setTimeout(r, 300 * (attempt + 1)));
            continue;
          }
          return [];
        }

        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          cache.set(symbol, { data, timestamp: Date.now() });
          return data;
        }
        return [];
      } catch {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 300 * (attempt + 1)));
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
  const symbolRef = useRef(sym);

  useEffect(() => {
    symbolRef.current = sym;
    let cancelled = false;

    const load = async () => {
      const data = await fetchCandles(sym);

      // 심볼이 바뀌었거나 unmount되었으면 무시
      if (cancelled || symbolRef.current !== sym) return;

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
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
      setStatus('connected');
    };

    load();
    const interval = setInterval(load, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [sym]);

  return { ...state, status };
}
