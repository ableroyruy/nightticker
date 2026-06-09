'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ConnectionStatus } from '@/lib/types/market';

const CACHED_CANDLES_URL = '/api/market/candles';
const POLL_INTERVAL = 60000; // 60초마다 폴링
const CLIENT_CACHE_TTL = 300000; // 클라이언트 캐시 5분
const MAX_CONCURRENT = 3; // 동시 요청 최대 3개
const REQUEST_DELAY = 100; // 요청 간 딜레이 100ms
const FETCH_TIMEOUT = 10000; // 10초 타임아웃

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

// 클라이언트 메모리 캐시
const clientCache = new Map<string, CacheEntry>();

// 진행 중인 요청 (같은 심볼 중복 요청 방지)
const pendingRequests = new Map<string, Promise<CandleData[]>>();

// 요청 큐
const requestQueue: Array<() => void> = [];
let activeRequests = 0;

function processQueue() {
  while (activeRequests < MAX_CONCURRENT && requestQueue.length > 0) {
    const next = requestQueue.shift();
    if (next) {
      activeRequests++;
      next();
    }
  }
}

function queueRequest<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const execute = async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (e) {
        reject(e);
      } finally {
        activeRequests--;
        setTimeout(processQueue, REQUEST_DELAY);
      }
    };
    requestQueue.push(execute);
    processQueue();
  });
}

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
  const [status, setStatus] = useState<ConnectionStatus>(() => {
    const cached = getCachedData(symbol);
    return cached ? 'connected' : 'connecting';
  });
  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);

  const fetchCandles = useCallback(async (force = false) => {
    if (fetchingRef.current) return;

    // 캐시 확인
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

    // 이미 같은 심볼 요청 중이면 그 결과를 기다림
    let fetchPromise = pendingRequests.get(symbol);

    if (!fetchPromise) {
      // 새 요청 생성
      fetchPromise = queueRequest(async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        try {
          const response = await fetch(`${CACHED_CANDLES_URL}?symbol=${symbol}`, {
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
          }

          const data: CandleData[] = await response.json();
          return Array.isArray(data) ? data : [];
        } catch {
          return [];
        }
      }).then((data) => {
        pendingRequests.delete(symbol);
        return data;
      });

      pendingRequests.set(symbol, fetchPromise);
    }

    try {
      const data = await fetchPromise;

      if (!mountedRef.current) {
        fetchingRef.current = false;
        return;
      }

      if (data.length > 0) {
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
        // 데이터 없으면 캐시라도 사용
        const cached = clientCache.get(symbol);
        if (cached?.data?.length) {
          const { change24h, changePercent24h } = calculateChange(cached.data);
          const lastCandle = cached.data[cached.data.length - 1];
          setState({
            candles: cached.data,
            currentPrice: lastCandle?.close ?? null,
            change24h,
            changePercent24h,
            loading: false,
            error: null,
          });
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
        setStatus('connected');
      }
    } catch {
      if (mountedRef.current) {
        setState(prev => ({ ...prev, loading: false }));
        setStatus('connected');
      }
    }

    fetchingRef.current = false;
  }, [symbol]);

  useEffect(() => {
    mountedRef.current = true;
    fetchingRef.current = false;

    fetchCandles();

    const interval = setInterval(() => fetchCandles(true), POLL_INTERVAL);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchCandles]);

  return { ...state, status };
}
