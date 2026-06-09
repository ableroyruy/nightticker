'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const API_URL = 'https://api.hyperliquid.xyz/info';
const CANDLE_INTERVAL = '5m';
const CANDLES_6H = 72; // 6 hours / 5 minutes = 72 candles
const POLLING_INTERVAL = 60000; // 1 minute polling
const FETCH_DELAY = 300; // Delay between API calls to avoid rate limiting

export interface CandleData {
  time: number; // seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface RawCandle {
  t: number; // timestamp ms
  o: string;
  h: string;
  l: string;
  c: string;
  v: string;
}

interface CandleState {
  candles: CandleData[];
  currentPrice: number | null;
  change24h: number | null;
  changePercent24h: number | null;
  loading: boolean;
  error: string | null;
}

// Fetch queue to prevent rate limiting
class CandleFetchQueue {
  private static instance: CandleFetchQueue | null = null;
  private queue: Array<{ symbol: string; resolve: (data: CandleData[]) => void; reject: (err: Error) => void }> = [];
  private isFetching = false;
  private cache: Map<string, { data: CandleData[]; timestamp: number }> = new Map();
  private cacheTimeout = 30000; // 30 seconds cache

  private constructor() {}

  static getInstance(): CandleFetchQueue {
    if (!CandleFetchQueue.instance) {
      CandleFetchQueue.instance = new CandleFetchQueue();
    }
    return CandleFetchQueue.instance;
  }

  private async processQueue() {
    if (this.isFetching || this.queue.length === 0) return;

    this.isFetching = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;

      // Check cache first
      const cached = this.cache.get(item.symbol);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        item.resolve(cached.data);
        continue;
      }

      try {
        const data = await this.doFetch(item.symbol);
        this.cache.set(item.symbol, { data, timestamp: Date.now() });
        item.resolve(data);
      } catch (e) {
        item.reject(e as Error);
      }

      // Delay between requests
      if (this.queue.length > 0) {
        await new Promise((r) => setTimeout(r, FETCH_DELAY));
      }
    }

    this.isFetching = false;
  }

  private async doFetch(symbol: string): Promise<CandleData[]> {
    const now = Date.now();
    const startTime = now - 6 * 60 * 60 * 1000; // 6 hours

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'candleSnapshot',
        req: {
          coin: `xyz:${symbol}`,
          interval: CANDLE_INTERVAL,
          startTime,
          endTime: now,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data: RawCandle[] = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((c) => ({
      time: Math.floor(c.t / 1000),
      open: parseFloat(c.o),
      high: parseFloat(c.h),
      low: parseFloat(c.l),
      close: parseFloat(c.c),
      volume: parseFloat(c.v),
    }));
  }

  fetch(symbol: string): Promise<CandleData[]> {
    return new Promise((resolve, reject) => {
      this.queue.push({ symbol, resolve, reject });
      this.processQueue();
    });
  }

  // Force refresh bypassing cache
  async refresh(symbol: string): Promise<CandleData[]> {
    this.cache.delete(symbol);
    return this.fetch(symbol);
  }
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

export function useCandleData(symbol: string): CandleState {
  const [state, setState] = useState<CandleState>({
    candles: [],
    currentPrice: null,
    change24h: null,
    changePercent24h: null,
    loading: true,
    error: null,
  });
  const mountedRef = useRef(true);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      const queue = CandleFetchQueue.getInstance();
      const candles = isRefresh ? await queue.refresh(symbol) : await queue.fetch(symbol);

      if (!mountedRef.current) return;

      const { change24h, changePercent24h } = calculateChange(candles);
      const lastCandle = candles[candles.length - 1];

      setState({
        candles,
        currentPrice: lastCandle?.close ?? null,
        change24h,
        changePercent24h,
        loading: false,
        error: null,
      });
    } catch (e) {
      if (!mountedRef.current) return;

      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to load candle data',
      }));
    }
  }, [symbol]);

  useEffect(() => {
    mountedRef.current = true;

    // Initial fetch
    fetchData(false);

    // Set up polling (1 minute interval)
    pollingRef.current = setInterval(() => {
      fetchData(true);
    }, POLLING_INTERVAL);

    return () => {
      mountedRef.current = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [fetchData]);

  return state;
}
