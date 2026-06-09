'use client';

import { useState, useEffect, useRef } from 'react';
import { ConnectionStatus } from '@/lib/types/market';

const CACHED_CANDLES_URL = '/api/market/candles';
const POLL_INTERVAL = 60000; // 60초

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

// 전역 캐시 (심볼 → 데이터)
const globalCache = new Map<string, { data: CandleData[]; timestamp: number }>();
const CACHE_TTL = 300000; // 5분

function calculateChange(candles: CandleData[]) {
  if (candles.length < 2) return { change24h: 0, changePercent24h: 0 };
  const first = candles[0];
  const last = candles[candles.length - 1];
  const change24h = last.close - first.close;
  const changePercent24h = first.close > 0 ? (change24h / first.close) * 100 : 0;
  return { change24h, changePercent24h };
}

export function useCandleData(symbol: string): CandleState & { status: ConnectionStatus } {
  // 심볼 정규화
  const normalizedSymbol = symbol.toUpperCase();

  // 캐시에서 초기값 가져오기
  const cachedEntry = globalCache.get(normalizedSymbol);
  const initialData = cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_TTL)
    ? cachedEntry.data
    : null;

  const [state, setState] = useState<CandleState>(() => {
    if (initialData && initialData.length > 0) {
      const { change24h, changePercent24h } = calculateChange(initialData);
      return {
        candles: initialData,
        currentPrice: initialData[initialData.length - 1]?.close ?? null,
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

  const [status, setStatus] = useState<ConnectionStatus>(initialData ? 'connected' : 'connecting');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const fetchData = async () => {
      // 캐시 확인
      const cached = globalCache.get(normalizedSymbol);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        if (mountedRef.current && cached.data.length > 0) {
          const { change24h, changePercent24h } = calculateChange(cached.data);
          setState({
            candles: cached.data,
            currentPrice: cached.data[cached.data.length - 1]?.close ?? null,
            change24h,
            changePercent24h,
            loading: false,
            error: null,
          });
          setStatus('connected');
        }
        return;
      }

      try {
        const res = await fetch(`${CACHED_CANDLES_URL}?symbol=${normalizedSymbol}`);
        if (!res.ok) throw new Error('Failed');

        const data: CandleData[] = await res.json();

        if (!mountedRef.current) return;

        if (Array.isArray(data) && data.length > 0) {
          // 캐시 저장
          globalCache.set(normalizedSymbol, { data, timestamp: Date.now() });

          const { change24h, changePercent24h } = calculateChange(data);
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
      } catch {
        if (mountedRef.current) {
          setState(prev => ({ ...prev, loading: false }));
          setStatus('connected');
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [normalizedSymbol]);

  return { ...state, status };
}
