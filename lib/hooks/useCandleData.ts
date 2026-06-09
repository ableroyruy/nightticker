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

async function fetchFromAPI(symbol: string): Promise<CandleData[]> {
  try {
    const res = await fetch(`${CANDLES_API}?symbol=${symbol}`, {
      cache: 'no-store',
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      cache.set(symbol, { data, timestamp: Date.now() });
      return data;
    }
    return [];
  } catch {
    return [];
  }
}

export function useCandleData(symbol: string): CandleState & { status: ConnectionStatus } {
  const sym = symbol.toUpperCase();

  // 초기 상태: 캐시 확인
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

    async function load() {
      // 캐시 확인
      const cached = getCachedData(sym);
      if (cached) {
        if (active) {
          const { change24h, changePercent24h } = getChange(cached);
          setState({
            candles: cached,
            currentPrice: cached[cached.length - 1]?.close ?? null,
            change24h,
            changePercent24h,
            loading: false,
            error: null,
          });
          setStatus('connected');
        }
        return;
      }

      // API 호출
      const data = await fetchFromAPI(sym);

      if (active) {
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
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'No data',
          }));
        }
        setStatus('connected');
      }
    }

    load();

    // 폴링
    const interval = setInterval(() => {
      if (active) load();
    }, POLL_INTERVAL);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [sym]);

  return { ...state, status };
}
