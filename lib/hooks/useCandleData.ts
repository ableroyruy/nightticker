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

// 진행 중인 요청 (중복 방지) - Promise를 공유해서 같은 심볼 동시 요청 방지
const pendingRequests = new Map<string, Promise<CandleData[]>>();

// 요청 지연을 위한 카운터 (staggered loading)
let requestCounter = 0;
const REQUEST_DELAY_MS = 50; // 각 요청 사이 50ms 간격

function calculateChange(candles: CandleData[]) {
  if (candles.length < 2) return { change24h: 0, changePercent24h: 0 };
  const first = candles[0];
  const last = candles[candles.length - 1];
  const change24h = last.close - first.close;
  const changePercent24h = first.close > 0 ? (change24h / first.close) * 100 : 0;
  return { change24h, changePercent24h };
}

// 단일 심볼 fetch (중복 요청 방지 + 재시도)
async function fetchCandlesForSymbol(symbol: string, retries = 2): Promise<CandleData[]> {
  // 이미 진행 중인 요청이 있으면 그 결과를 기다림
  const pending = pendingRequests.get(symbol);
  if (pending) {
    return pending;
  }

  const fetchPromise = (async () => {
    for (let attempt = 0; attempt <= retries; attempt++) {
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
        if (attempt < retries) {
          // 재시도 전 잠시 대기
          await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
          continue;
        }
        return [];
      }
    }
    return [];
  })();

  pendingRequests.set(symbol, fetchPromise);

  // 완료 후 pendingRequests에서 제거
  fetchPromise.finally(() => {
    pendingRequests.delete(symbol);
  });

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

  useEffect(() => {
    mountedRef.current = true;

    const updateState = (data: CandleData[]) => {
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
    };

    const fetchData = async (useDelay = false) => {
      // 캐시 확인
      const cached = globalCache.get(normalizedSymbol);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        updateState(cached.data);
        return;
      }

      // 초기 로드 시에만 staggered delay 적용
      if (useDelay) {
        const delay = (requestCounter++ % 20) * REQUEST_DELAY_MS;
        if (delay > 0) {
          await new Promise(r => setTimeout(r, delay));
        }
        // 딜레이 후 다시 캐시 확인 (다른 요청이 완료했을 수 있음)
        const cachedAfterDelay = globalCache.get(normalizedSymbol);
        if (cachedAfterDelay && Date.now() - cachedAfterDelay.timestamp < CACHE_TTL) {
          updateState(cachedAfterDelay.data);
          return;
        }
      }

      if (!mountedRef.current) return;

      const data = await fetchCandlesForSymbol(normalizedSymbol);
      updateState(data);
    };

    // 초기 로드는 staggered delay 적용
    fetchData(true);

    // 폴링은 딜레이 없이
    const interval = setInterval(() => fetchData(false), POLL_INTERVAL);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [normalizedSymbol]);

  return { ...state, status };
}
