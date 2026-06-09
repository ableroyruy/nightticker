'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ConnectionStatus } from '@/lib/types/market';

const WS_URL = 'wss://api.hyperliquid.xyz/ws';
const CACHED_CANDLES_URL = '/api/market/candles'; // Our cached API
const CANDLE_INTERVAL = '5m';
const CANDLES_6H = 72;
const RECONNECT_DELAY = 3000;

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

type CandleListener = (state: CandleState) => void;

// Singleton WebSocket manager for candle subscriptions
class CandleWebSocketManager {
  private static instance: CandleWebSocketManager | null = null;
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = 'disconnected';
  private subscribedSymbols: Set<string> = new Set();
  private listeners: Map<string, Set<CandleListener>> = new Map();
  private candleStates: Map<string, CandleState> = new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pendingSubscriptions: Set<string> = new Set();

  private constructor() {}

  static getInstance(): CandleWebSocketManager {
    if (!CandleWebSocketManager.instance) {
      CandleWebSocketManager.instance = new CandleWebSocketManager();
    }
    return CandleWebSocketManager.instance;
  }

  private getDefaultState(): CandleState {
    return {
      candles: [],
      currentPrice: null,
      change24h: null,
      changePercent24h: null,
      loading: true,
      error: null,
    };
  }

  private notifyListeners(symbol: string) {
    const state = this.candleStates.get(symbol);
    const symbolListeners = this.listeners.get(symbol);
    if (state && symbolListeners) {
      symbolListeners.forEach((listener) => listener(state));
    }
  }

  // Fetch from our cached API (fast)
  private async fetchCachedCandles(symbol: string): Promise<CandleData[]> {
    const response = await fetch(`${CACHED_CANDLES_URL}?symbol=${symbol}`);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data: CandleData[] = await response.json();
    return Array.isArray(data) ? data : [];
  }

  private calculateChange(candles: CandleData[]): { change24h: number; changePercent24h: number } {
    if (candles.length < 2) {
      return { change24h: 0, changePercent24h: 0 };
    }
    const firstCandle = candles[0];
    const lastCandle = candles[candles.length - 1];
    const change24h = lastCandle.close - firstCandle.close;
    const changePercent24h = firstCandle.close > 0 ? (change24h / firstCandle.close) * 100 : 0;
    return { change24h, changePercent24h };
  }

  private connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    this.status = 'connecting';

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        this.status = 'connected';
        // Subscribe to all pending symbols
        this.pendingSubscriptions.forEach((symbol) => {
          this.sendSubscription(symbol);
        });
        this.pendingSubscriptions.clear();

        // Re-subscribe existing symbols
        this.subscribedSymbols.forEach((symbol) => {
          this.sendSubscription(symbol);
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (e) {
          console.error('Failed to parse candle WebSocket message:', e);
        }
      };

      this.ws.onerror = (event) => {
        console.error('Candle WebSocket error:', event);
      };

      this.ws.onclose = () => {
        this.status = 'disconnected';
        this.ws = null;

        // Attempt reconnect if there are still subscribers
        if (this.subscribedSymbols.size > 0) {
          this.reconnectTimeout = setTimeout(() => {
            this.connect();
          }, RECONNECT_DELAY);
        }
      };
    } catch (e) {
      console.error('Failed to create candle WebSocket:', e);
      this.status = 'disconnected';

      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, RECONNECT_DELAY);
    }
  }

  private sendSubscription(symbol: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          method: 'subscribe',
          subscription: {
            type: 'candle',
            coin: `xyz:${symbol}`,
            interval: CANDLE_INTERVAL,
          },
        })
      );
    }
  }

  private sendUnsubscription(symbol: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          method: 'unsubscribe',
          subscription: {
            type: 'candle',
            coin: `xyz:${symbol}`,
            interval: CANDLE_INTERVAL,
          },
        })
      );
    }
  }

  private handleMessage(message: { channel?: string; data?: RawCandle }) {
    if (message.channel?.startsWith('candle') && message.data) {
      // Extract symbol from channel: "candle:xyz:AAPL:5m" -> "AAPL"
      const parts = message.channel.split(':');
      if (parts.length >= 3) {
        const symbol = parts[2];
        const candle = message.data;

        const state = this.candleStates.get(symbol);
        if (!state) return;

        const newCandle: CandleData = {
          time: Math.floor(candle.t / 1000),
          open: parseFloat(candle.o),
          high: parseFloat(candle.h),
          low: parseFloat(candle.l),
          close: parseFloat(candle.c),
          volume: parseFloat(candle.v),
        };

        let updatedCandles = [...state.candles];
        const lastCandle = updatedCandles[updatedCandles.length - 1];

        if (lastCandle && lastCandle.time === newCandle.time) {
          // Update existing candle
          updatedCandles[updatedCandles.length - 1] = newCandle;
        } else {
          // Add new candle
          updatedCandles.push(newCandle);
          // Keep only last 72 candles (6 hours)
          if (updatedCandles.length > CANDLES_6H) {
            updatedCandles = updatedCandles.slice(-CANDLES_6H);
          }
        }

        const { change24h, changePercent24h } = this.calculateChange(updatedCandles);

        this.candleStates.set(symbol, {
          ...state,
          candles: updatedCandles,
          currentPrice: newCandle.close,
          change24h,
          changePercent24h,
        });

        this.notifyListeners(symbol);
      }
    }
  }

  async subscribe(symbol: string, listener: CandleListener): Promise<() => void> {
    // Add listener
    if (!this.listeners.has(symbol)) {
      this.listeners.set(symbol, new Set());
    }
    this.listeners.get(symbol)!.add(listener);

    // Initialize state if needed
    if (!this.candleStates.has(symbol)) {
      this.candleStates.set(symbol, this.getDefaultState());
    }

    // Notify with current state
    listener(this.candleStates.get(symbol)!);

    // Fetch initial data if this is a new subscription
    if (!this.subscribedSymbols.has(symbol)) {
      this.subscribedSymbols.add(symbol);

      // Fetch from our cached API (fast)
      try {
        const candles = await this.fetchCachedCandles(symbol);
        const { change24h, changePercent24h } = this.calculateChange(candles);
        const lastCandle = candles[candles.length - 1];

        this.candleStates.set(symbol, {
          candles,
          currentPrice: lastCandle?.close ?? null,
          change24h,
          changePercent24h,
          loading: false,
          error: null,
        });

        this.notifyListeners(symbol);
      } catch (e) {
        console.error(`Failed to fetch candles for ${symbol}:`, e);
        this.candleStates.set(symbol, {
          ...this.getDefaultState(),
          loading: false,
          error: 'Failed to load candle data',
        });
        this.notifyListeners(symbol);
      }

      // Subscribe via WebSocket for real-time updates
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendSubscription(symbol);
      } else {
        this.pendingSubscriptions.add(symbol);
        this.connect();
      }
    }

    // Return unsubscribe function
    return () => {
      const symbolListeners = this.listeners.get(symbol);
      if (symbolListeners) {
        symbolListeners.delete(listener);

        // If no more listeners for this symbol, unsubscribe
        if (symbolListeners.size === 0) {
          this.listeners.delete(symbol);
          this.subscribedSymbols.delete(symbol);
          this.pendingSubscriptions.delete(symbol);
          this.candleStates.delete(symbol);
          this.sendUnsubscription(symbol);

          // Close WebSocket if no more subscriptions
          if (this.subscribedSymbols.size === 0) {
            if (this.reconnectTimeout) {
              clearTimeout(this.reconnectTimeout);
              this.reconnectTimeout = null;
            }
            this.ws?.close();
            this.ws = null;
          }
        }
      }
    };
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }
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
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const handleUpdate = useCallback((newState: CandleState) => {
    setState(newState);
  }, []);

  useEffect(() => {
    const manager = CandleWebSocketManager.getInstance();

    // Subscribe and store unsubscribe function
    manager.subscribe(symbol, handleUpdate).then((unsub) => {
      unsubscribeRef.current = unsub;
    });

    // Poll status
    const statusInterval = setInterval(() => {
      setStatus(manager.getStatus());
    }, 1000);

    return () => {
      clearInterval(statusInterval);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [symbol, handleUpdate]);

  return { ...state, status };
}
