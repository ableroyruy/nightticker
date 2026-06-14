'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ConnectionStatus } from '@/lib/types/market';

const WS_URL = 'wss://api.hyperliquid.xyz/ws';
const CACHED_TICKER_URL = '/api/market/ticker'; // 통합 API (prices + meta)
const RECONNECT_DELAY = 3000;

interface WsMessage {
  channel: string;
  data: {
    mids: Record<string, string>;
  };
}

export interface TickerData {
  price: number;
  prevDayPx: number;
  change24h: number;
  changePercent24h: number;
}

interface UseHyperliquidTickerReturn {
  tickers: Record<string, TickerData>;
  status: ConnectionStatus;
  lastUpdate: Date | null;
  error: string | null;
}

export function useHyperliquidTicker(): UseHyperliquidTickerReturn {
  const [tickers, setTickers] = useState<Record<string, TickerData>>({});
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevDayPricesRef = useRef<Record<string, number>>({});
  const tickersRef = useRef<Record<string, TickerData>>({});

  // Process WebSocket price updates
  const processPriceUpdate = useCallback((mids: Record<string, string>) => {
    if (!mountedRef.current) return;

    const prevDayPrices = prevDayPricesRef.current;
    const newTickers: Record<string, TickerData> = {};

    for (const [rawSymbol, priceStr] of Object.entries(mids)) {
      const price = parseFloat(priceStr);
      if (isNaN(price)) continue;

      const symbol = rawSymbol.replace('xyz:', '');
      const prevDayPx = prevDayPrices[symbol] || 0;
      let change24h = 0;
      let changePercent24h = 0;

      if (prevDayPx > 0) {
        change24h = price - prevDayPx;
        changePercent24h = (change24h / prevDayPx) * 100;
      }

      newTickers[symbol] = {
        price,
        prevDayPx,
        change24h,
        changePercent24h,
      };
    }

    tickersRef.current = newTickers;
    setTickers(newTickers);
    setLastUpdate(new Date());
  }, []);

  // Fetch initial data from cached ticker API (fast, single request)
  const fetchCachedTicker = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      const response = await fetch(CACHED_TICKER_URL);
      if (!response.ok) return;

      const data: Record<string, TickerData> = await response.json();
      if (!mountedRef.current) return;

      // Store prevDayPx for WebSocket updates
      const prevDayPrices: Record<string, number> = {};
      for (const [symbol, ticker] of Object.entries(data)) {
        prevDayPrices[symbol] = ticker.prevDayPx;
      }
      prevDayPricesRef.current = prevDayPrices;

      // Set tickers immediately
      tickersRef.current = data;
      setTickers(data);
      setLastUpdate(new Date());
    } catch (e) {
      console.error('Failed to fetch cached ticker:', e);
    }
  }, []);

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    if (!mountedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) {
          ws.close();
          return;
        }

        setStatus('connected');
        setError(null);

        // Subscribe to allMids for XYZ DEX
        ws.send(JSON.stringify({
          method: 'subscribe',
          subscription: {
            type: 'allMids',
            dex: 'xyz',
          },
        }));
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;

        try {
          const message: WsMessage = JSON.parse(event.data);

          if (message.channel === 'allMids' && message.data?.mids) {
            processPriceUpdate(message.data.mids);
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        if (mountedRef.current) {
          setError('WebSocket connection error');
        }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;

        setStatus('disconnected');
        wsRef.current = null;

        // Attempt to reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            setStatus('connecting');
            connectWebSocket();
          }
        }, RECONNECT_DELAY);
      };
    } catch (e) {
      console.error('Failed to create WebSocket:', e);
      if (mountedRef.current) {
        setStatus('disconnected');
        setError('Failed to connect');

        reconnectTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            connectWebSocket();
          }
        }, RECONNECT_DELAY);
      }
    }
  }, [processPriceUpdate]);

  useEffect(() => {
    mountedRef.current = true;

    // Fast init: single API call -> WebSocket
    const init = async () => {
      // 1. Get cached ticker (prices + meta in one request)
      await fetchCachedTicker();
      // 2. Connect WebSocket for real-time updates
      connectWebSocket();
    };
    init();

    return () => {
      mountedRef.current = false;

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [fetchCachedTicker, connectWebSocket]);

  return {
    tickers,
    status,
    lastUpdate,
    error,
  };
}
