'use client';

import { useState, useEffect, useRef } from 'react';
import { ConnectionStatus } from '@/lib/types/market';

const CANDLES_API = '/api/market/candles';

// 캐시 설정 - 서버와 동일하게 2분
const CACHE_TTL = 120000;
// 폴링 간격 - 5분 캔들이므로 5분마다 갱신
const POLL_INTERVAL = 300000;
// 초기 로드 시 요청 분산 (50ms 간격)
const STAGGER_DELAY = 50;

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
// 진행 중인 요청 (Promise 공유로 중복 방지)
const pending = new Map<string, Promise<CandleData[]>>();
// 요청 분산용 카운터
let counter = 0;

function getChange(candles: CandleData[]) {
  if (candles.length < 2) return { change24h: 0, changePercent24h: 0 };
  const first = candles[0].close;
  const last = candles[candles.length - 1].close;
  const change24h = last - first;
  const changePercent24h = first > 0 ? (change24h / first) * 100 : 0;
  return { change24h, changePercent24h };
}

async function fetchCandles(symbol: string): Promise<CandleData[]> {
  // 진행 중인 요청 재사용
  const inflight = pending.get(symbol);
  if (inflight) return inflight;

  const promise = (async () => {
    try {
      const res = await fetch(`${CANDLES_API}?symbol=${symbol}`);
      if (!res.ok) return [];

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        cache.set(symbol, { data, timestamp: Date.now() });
        return data;
      }
      return [];
    } catch {
      return [];
    } finally {
      pending.delete(symbol);
    }
  })();

  pending.set(symbol, promise);
  return promise;
}

export function useCandleData(symbol: string): CandleState & { status: ConnectionStatus } {
  const sym = symbol.toUpperCase();

  // 캐시에서 초기값
  const cached = cache.get(sym);
  const hasCache = cached && Date.now() - cached.timestamp < CACHE_TTL;

  const [state, setState] = useState<CandleState>(() => {
    if (hasCache && cached.data.length > 0) {
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

  const [status, setStatus] = useState<ConnectionStatus>(hasCache ? 'connected' : 'connecting');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const update = (data: CandleData[]) => {
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
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
      setStatus('connected');
    };

    const load = async (stagger: boolean) => {
      // 캐시 확인
      const c = cache.get(sym);
      if (c && Date.now() - c.timestamp < CACHE_TTL) {
        update(c.data);
        return;
      }

      // 초기 로드 시 분산
      if (stagger) {
        const delay = (counter++ % 20) * STAGGER_DELAY;
        if (delay > 0) {
          await new Promise(r => setTimeout(r, delay));
          // 딜레이 후 캐시 재확인
          const c2 = cache.get(sym);
          if (c2 && Date.now() - c2.timestamp < CACHE_TTL) {
            update(c2.data);
            return;
          }
        }
      }

      if (!mountedRef.current) return;
      const data = await fetchCandles(sym);
      update(data);
    };

    load(true);
    const interval = setInterval(() => load(false), POLL_INTERVAL);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [sym]);

  return { ...state, status };
}
