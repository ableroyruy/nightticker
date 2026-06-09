'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ConnectionStatus } from '@/lib/types/market';

const CANDLES_API = '/api/market/candles';
const CACHE_TTL = 120000; // 2분
const POLL_INTERVAL = 300000; // 5분
const BATCH_DELAY = 50; // 배치 수집 대기 시간 (ms)
const MAX_BATCH_SIZE = 10; // 서버 배치 API 최대 크기

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

// ========== 전역 캐시 ==========
const cache = new Map<string, CacheEntry>();

// ========== 배치 요청 코디네이터 ==========
type Resolver = (data: CandleData[]) => void;

interface PendingRequest {
  symbol: string;
  resolve: Resolver;
}

let batchQueue: PendingRequest[] = [];
let batchTimer: NodeJS.Timeout | null = null;
let batchPromise: Promise<void> | null = null;

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

// 배치 API 호출
async function fetchBatch(symbols: string[]): Promise<Record<string, CandleData[]>> {
  try {
    const res = await fetch(`${CANDLES_API}?symbols=${symbols.join(',')}`);
    if (!res.ok) return {};
    const data = await res.json();
    return typeof data === 'object' && data !== null ? data : {};
  } catch {
    return {};
  }
}

// 배치 처리 실행
async function processBatch() {
  const requests = [...batchQueue];
  batchQueue = [];
  batchTimer = null;
  batchPromise = null;

  if (requests.length === 0) return;

  // 캐시에서 해결 가능한 것들 먼저 처리
  const needFetch: PendingRequest[] = [];
  for (const req of requests) {
    const cached = getCachedData(req.symbol);
    if (cached) {
      req.resolve(cached);
    } else {
      needFetch.push(req);
    }
  }

  if (needFetch.length === 0) return;

  // 중복 제거
  const uniqueSymbols = [...new Set(needFetch.map(r => r.symbol))];

  // 배치 크기 제한에 맞춰 나눠서 요청
  const results: Record<string, CandleData[]> = {};

  for (let i = 0; i < uniqueSymbols.length; i += MAX_BATCH_SIZE) {
    const batch = uniqueSymbols.slice(i, i + MAX_BATCH_SIZE);
    const batchResult = await fetchBatch(batch);
    Object.assign(results, batchResult);
  }

  // 캐시 저장 및 결과 전달
  const now = Date.now();
  for (const req of needFetch) {
    const data = results[req.symbol] || [];
    if (data.length > 0) {
      cache.set(req.symbol, { data, timestamp: now });
    }
    req.resolve(data);
  }
}

// 배치 큐에 추가
function queueRequest(symbol: string): Promise<CandleData[]> {
  return new Promise<CandleData[]>((resolve) => {
    batchQueue.push({ symbol, resolve });

    // 타이머가 없으면 새로 시작
    if (!batchTimer) {
      batchTimer = setTimeout(() => {
        batchPromise = processBatch();
      }, BATCH_DELAY);
    }
  });
}

// 데이터 가져오기 (캐시 → 배치 큐)
async function fetchCandles(symbol: string): Promise<CandleData[]> {
  // 캐시 확인
  const cached = getCachedData(symbol);
  if (cached) {
    return cached;
  }

  // 배치 큐에 추가
  return queueRequest(symbol);
}

export function useCandleData(symbol: string): CandleState & { status: ConnectionStatus } {
  const sym = symbol.toUpperCase();
  const mountedRef = useRef(true);

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

  const loadData = useCallback(async () => {
    if (!mountedRef.current) return;

    const data = await fetchCandles(sym);

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
      setStatus('connected');
    } else {
      setState(prev => ({ ...prev, loading: false, error: 'No data' }));
      setStatus('connected');
    }
  }, [sym]);

  useEffect(() => {
    mountedRef.current = true;

    // 즉시 로드 (배치로 묶임)
    loadData();

    // 폴링 설정
    const intervalId = setInterval(() => {
      cache.delete(sym);
      loadData();
    }, POLL_INTERVAL);

    return () => {
      mountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [sym, loadData]);

  return { ...state, status };
}
