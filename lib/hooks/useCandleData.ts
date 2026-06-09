'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ConnectionStatus } from '@/lib/types/market';

const CACHED_CANDLES_URL = '/api/market/candles';
const POLL_INTERVAL = 60000; // 60초마다 폴링 (서버 캐시 60초)

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

export function useCandleData(symbol: string): CandleState & { status: ConnectionStatus } {
  const [state, setState] = useState<CandleState>({
    candles: [],
    currentPrice: null,
    change24h: null,
    changePercent24h: null,
    loading: true,
    error: null,
  });
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const mountedRef = useRef(true);

  const fetchCandles = useCallback(async () => {
    try {
      const response = await fetch(`${CACHED_CANDLES_URL}?symbol=${symbol}`);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data: CandleData[] = await response.json();

      if (!mountedRef.current) return;

      if (Array.isArray(data) && data.length > 0) {
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
      if (!mountedRef.current) return;

      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load',
      }));
      setStatus('disconnected');
    }
  }, [symbol]);

  useEffect(() => {
    mountedRef.current = true;

    // 초기 로드
    fetchCandles();

    // 60초마다 폴링
    const interval = setInterval(fetchCandles, POLL_INTERVAL);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchCandles]);

  return { ...state, status };
}
