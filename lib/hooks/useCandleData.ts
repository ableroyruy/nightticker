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

interface CacheEntry {
  data: CandleData[];
  timestamp: number;
}

// 전역 캐시
const cache = new Map<string, CacheEntry>();
// 진행 중인 요청 (Promise 공유)
const pendingRequests = new Map<string, Promise<CandleData[]>>();

function getChange(candles: CandleData[]) {
  if (candles.length < 2) return { change24h: 0, changePercent24h: 0 };
  const first = candles[0].close;
  const last = candles[candles.length - 1].close;
  const change24h = last - first;
  const changePercent24h = first > 0 ? (change24h / first) * 100 : 0;
  return { change24h, changePercent24h };
}

function getCachedData(symbol: string): CandleData[] | null {
  const entry = cache.get(symbol);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL && entry.data.length > 0) {
    return entry.data;
  }
  return null;
}

async function fetchFromServer(symbol: string): Promise<CandleData[]> {
  try {
    const res = await fetch(`${CANDLES_API}?symbol=${symbol}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : [];
  } catch {
    return [];
  }
}

// 데이터 가져오기 (캐시 + 요청 중복 방지)
function fetchCandles(symbol: string): Promise<CandleData[]> {
  // 1. 캐시 확인
  const cached = getCachedData(symbol);
  if (cached) {
    return Promise.resolve(cached);
  }

  // 2. 진행 중인 요청 확인
  const pending = pendingRequests.get(symbol);
  if (pending) {
    return pending;
  }

  // 3. 새 요청
  const request = fetchFromServer(symbol).then(data => {
    if (data.length > 0) {
      cache.set(symbol, { data, timestamp: Date.now() });
    }
    pendingRequests.delete(symbol);
    return data;
  }).catch(() => {
    pendingRequests.delete(symbol);
    return [];
  });

  pendingRequests.set(symbol, request);
  return request;
}

export function useCandleData(symbol: string): CandleState & { status: ConnectionStatus } {
  const sym = symbol.toUpperCase();
  const mountedRef = useRef(true);
  const symRef = useRef(sym);

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

  const [status, setStatus] = useState<ConnectionStatus>(() =>
    getCachedData(sym) ? 'connected' : 'connecting'
  );

  useEffect(() => {
    mountedRef.current = true;
    symRef.current = sym;

    let intervalId: NodeJS.Timeout | null = null;

    const loadData = async () => {
      // 심볼이 변경됐으면 무시
      if (symRef.current !== sym) return;

      const data = await fetchCandles(sym);

      // 언마운트됐거나 심볼이 변경됐으면 무시
      if (!mountedRef.current || symRef.current !== sym) return;

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
      } else {
        setState(prev => ({ ...prev, loading: false, error: 'No data' }));
        setStatus('connected');
      }
    };

    // 즉시 로드
    loadData();

    // 폴링 설정
    intervalId = setInterval(() => {
      // 캐시 무효화 후 로드
      cache.delete(sym);
      loadData();
    }, POLL_INTERVAL);

    return () => {
      mountedRef.current = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [sym]);

  return { ...state, status };
}
