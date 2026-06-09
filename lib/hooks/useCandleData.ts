'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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

// 진행 중인 요청 (중복 방지)
const pendingRequests = new Map<string, Promise<CandleData[]>>();

// 요청 큐 (순차 처리)
const requestQueue: Array<() => Promise<void>> = [];
let isProcessingQueue = false;
const MAX_CONCURRENT = 3; // 동시 요청 최대 수
let activeRequests = 0;

async function processQueue() {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  while (requestQueue.length > 0 && activeRequests < MAX_CONCURRENT) {
    const task = requestQueue.shift();
    if (task) {
      activeRequests++;
      task().finally(() => {
        activeRequests--;
        // 다음 작업 처리
        if (requestQueue.length > 0) {
          processQueue();
        }
      });
    }
  }

  isProcessingQueue = false;
}

function calculateChange(candles: CandleData[]) {
  if (candles.length < 2) return { change24h: 0, changePercent24h: 0 };
  const first = candles[0];
  const last = candles[candles.length - 1];
  const change24h = last.close - first.close;
  const changePercent24h = first.close > 0 ? (change24h / first.close) * 100 : 0;
  return { change24h, changePercent24h };
}

// 단일 심볼 fetch (중복 요청 방지)
async function fetchCandlesForSymbol(symbol: string): Promise<CandleData[]> {
  // 이미 진행 중인 요청이 있으면 그 결과를 기다림
  const pending = pendingRequests.get(symbol);
  if (pending) {
    return pending;
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(`${CACHED_CANDLES_URL}?symbol=${symbol}`);
      if (!res.ok) throw new Error('Failed');

      const data: CandleData[] = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        globalCache.set(symbol, { data, timestamp: Date.now() });
        return data;
      }
      return [];
    } catch {
      return [];
    } finally {
      pendingRequests.delete(symbol);
    }
  })();

  pendingRequests.set(symbol, fetchPromise);
  return fetchPromise;
}

export function useCandleData(symbol: string): CandleState & { status: ConnectionStatus } {
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

  const updateState = useCallback((data: CandleData[]) => {
    if (!mountedRef.current) return;

    if (data.length > 0) {
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
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const fetchData = () => {
      // 캐시 확인
      const cached = globalCache.get(normalizedSymbol);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        updateState(cached.data);
        return;
      }

      // 큐에 추가
      requestQueue.push(async () => {
        // 다시 캐시 확인 (큐 대기 중에 다른 요청이 완료했을 수 있음)
        const cachedAgain = globalCache.get(normalizedSymbol);
        if (cachedAgain && Date.now() - cachedAgain.timestamp < CACHE_TTL) {
          updateState(cachedAgain.data);
          return;
        }

        const data = await fetchCandlesForSymbol(normalizedSymbol);
        updateState(data);
      });

      processQueue();
    };

    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [normalizedSymbol, updateState]);

  return { ...state, status };
}
