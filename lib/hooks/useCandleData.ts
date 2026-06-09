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

function getChange(candles: CandleData[]) {
  if (candles.length < 2) return { change24h: 0, changePercent24h: 0 };
  const first = candles[0].close;
  const last = candles[candles.length - 1].close;
  const change24h = last - first;
  const changePercent24h = first > 0 ? (change24h / first) * 100 : 0;
  return { change24h, changePercent24h };
}

function getCachedState(sym: string): CandleState | null {
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
  return null;
}

async function fetchCandlesFromAPI(symbol: string): Promise<CandleData[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${CANDLES_API}?symbol=${symbol}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      cache.set(symbol, { data, timestamp: Date.now() });
      return data;
    }
    return [];
  } catch {
    clearTimeout(timeoutId);
    return [];
  }
}

export function useCandleData(symbol: string): CandleState & { status: ConnectionStatus } {
  const sym = symbol.toUpperCase();
  const isMountedRef = useRef(false);
  const fetchIdRef = useRef(0);

  const [state, setState] = useState<CandleState>(() => {
    const cached = getCachedState(sym);
    if (cached) {
      console.log(`[useCandleData] ${sym}: 초기 캐시 히트`);
      return cached;
    }
    console.log(`[useCandleData] ${sym}: 초기 캐시 미스, loading 상태로 시작`);
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
    console.log(`[useCandleData] ${sym}: useEffect 시작`);
    isMountedRef.current = true;
    const currentFetchId = ++fetchIdRef.current;

    const updateState = (data: CandleData[]) => {
      console.log(`[useCandleData] ${sym}: updateState 호출, mounted=${isMountedRef.current}, fetchId=${currentFetchId}/${fetchIdRef.current}, dataLen=${data.length}`);
      if (!isMountedRef.current || fetchIdRef.current !== currentFetchId) {
        console.log(`[useCandleData] ${sym}: updateState 스킵 (unmounted 또는 stale)`);
        return;
      }

      if (data.length > 0) {
        const { change24h, changePercent24h } = getChange(data);
        console.log(`[useCandleData] ${sym}: setState 호출 (데이터 있음)`);
        setState({
          candles: data,
          currentPrice: data[data.length - 1]?.close ?? null,
          change24h,
          changePercent24h,
          loading: false,
          error: null,
        });
      } else {
        console.log(`[useCandleData] ${sym}: setState 호출 (데이터 없음)`);
        setState(prev => ({ ...prev, loading: false }));
      }
      setStatus('connected');
    };

    const load = async () => {
      // 캐시 확인
      const cachedState = getCachedState(sym);
      if (cachedState) {
        console.log(`[useCandleData] ${sym}: load() 캐시 히트`);
        if (isMountedRef.current && fetchIdRef.current === currentFetchId) {
          setState(cachedState);
          setStatus('connected');
        }
        return;
      }

      // API 호출
      console.log(`[useCandleData] ${sym}: API 호출 시작`);
      const data = await fetchCandlesFromAPI(sym);
      console.log(`[useCandleData] ${sym}: API 호출 완료, dataLen=${data.length}`);
      updateState(data);
    };

    load();
    const interval = setInterval(load, POLL_INTERVAL);

    return () => {
      console.log(`[useCandleData] ${sym}: useEffect 클린업`);
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [sym]);

  return { ...state, status };
}
