'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ConnectionStatus } from '@/lib/types/market';

const CACHED_CANDLES_URL = '/api/market/candles';
const POLL_INTERVAL = 60000; // 60초마다 폴링
const CLIENT_CACHE_TTL = 30000; // 클라이언트 캐시 30초

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

// 클라이언트 메모리 캐시 (컴포넌트 unmount/remount 시에도 유지)
const clientCache = new Map<string, CacheEntry>();

function calculateChange(candles: CandleData[]): { change24h: number; changePercent24h: number } {
  if (candles.length < 2) {
    return { change24h: 0, changePercent24h: 0 };
  }
  const firstCandle = candles[0];
  const lastCandle = candles[candles.length - 1];
  const change24h = lastCandle.close - firstCandle.close;
  const changePercent24h = firstCandle.close > 0 ? (change24h / firstCandle.close) * 100 : 0;
  return { change24h, changePercent24h };
}

function getCachedData(symbol: string): CandleData[] | null {
  const cached = clientCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedData(symbol: string, data: CandleData[]) {
  clientCache.set(symbol, {
    data,
    timestamp: Date.now(),
  });
}

export function useCandleData(symbol: string): CandleState & { status: ConnectionStatus } {
  const [state, setState] = useState<CandleState>(() => {
    // 초기 상태: 캐시가 있으면 바로 사용
    const cached = getCachedData(symbol);
    if (cached && cached.length > 0) {
      const { change24h, changePercent24h } = calculateChange(cached);
      const lastCandle = cached[cached.length - 1];
      return {
        candles: cached,
        currentPrice: lastCandle?.close ?? null,
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
  const fetchingRef = useRef(false);

  const fetchCandles = useCallback(async (force = false) => {
    // 이미 fetch 중이면 스킵
    if (fetchingRef.current) return;

    // 캐시 확인 (force가 아닐 때만)
    if (!force) {
      const cached = getCachedData(symbol);
      if (cached && cached.length > 0) {
        const { change24h, changePercent24h } = calculateChange(cached);
        const lastCandle = cached[cached.length - 1];
        setState({
          candles: cached,
          currentPrice: lastCandle?.close ?? null,
          change24h,
          changePercent24h,
          loading: false,
          error: null,
        });
        setStatus('connected');
        return;
      }
    }

    fetchingRef.current = true;

    try {
      const response = await fetch(`${CACHED_CANDLES_URL}?symbol=${symbol}`);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data: CandleData[] = await response.json();

      if (!mountedRef.current) {
        fetchingRef.current = false;
        return;
      }

      if (Array.isArray(data) && data.length > 0) {
        // 캐시 저장
        setCachedData(symbol, data);

        const { change24h, changePercent24h } = calculateChange(data);
        const lastCandle = data[data.length - 1];

        setState({
          candles: data,
          currentPrice: lastCandle?.close ?? null,
          change24h,
          changePercent24h,
          loading: false,
          error: null,
        });
        setStatus('connected');
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'No data',
        }));
        setStatus('connected');
      }
    } catch (e) {
      console.error(`Failed to fetch candles for ${symbol}:`, e);
      if (!mountedRef.current) {
        fetchingRef.current = false;
        return;
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load',
      }));
      setStatus('disconnected');
    } finally {
      fetchingRef.current = false;
    }
  }, [symbol]);

  useEffect(() => {
    mountedRef.current = true;
    fetchingRef.current = false;

    // 초기 로드
    fetchCandles();

    // 60초마다 폴링 (강제 새로고침)
    const interval = setInterval(() => fetchCandles(true), POLL_INTERVAL);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchCandles]);

  return { ...state, status };
}
