'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ConnectionStatus } from '@/lib/types/market';

const WS_URL = 'wss://api.hyperliquid.xyz/ws';
const API_URL = 'https://api.hyperliquid.xyz/info';
const META_REFRESH_INTERVAL = 60000; // 1 minute for 24h base prices
const RECONNECT_DELAY = 3000;

interface AssetContext {
  prevDayPx: string;
  midPx: string;
  markPx: string;
}

interface AssetMeta {
  name: string;
}

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
  const metaIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevDayPricesRef = useRef<Record<string, number>>({});
  const tickersRef = useRef<Record<string, TickerData>>({});

  // Fetch metaAndAssetCtxs for 24h base prices (REST)
  const fetchMeta = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'metaAndAssetCtxs', dex: 'xyz' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();

      if (!mountedRef.current) return;

      if (Array.isArray(data) && data.length >= 2) {
        const universe: AssetMeta[] = data[0].universe || [];
        const contexts: AssetContext[] = data[1] || [];

        const newPrevDayPrices: Record<string, number> = {};

        universe.forEach((meta, index) => {
          const ctx = contexts[index];
          if (meta.name && ctx?.prevDayPx) {
            const prevDayPx = parseFloat(ctx.prevDayPx);
            if (!isNaN(prevDayPx) && prevDayPx > 0) {
              newPrevDayPrices[meta.name] = prevDayPx;
            }
          }
        });

        prevDayPricesRef.current = newPrevDayPrices;

        // Update tickers with new prevDayPx data
        if (Object.keys(tickersRef.current).length > 0) {
          const updated: Record<string, TickerData> = {};
          for (const [symbol, ticker] of Object.entries(tickersRef.current)) {
            const prevDayPx = newPrevDayPrices[symbol] || ticker.prevDayPx;
            const change24h = prevDayPx > 0 ? ticker.price - prevDayPx : 0;
            const changePercent24h = prevDayPx > 0 ? (change24h / prevDayPx) * 100 : 0;
            updated[symbol] = {
              ...ticker,
              prevDayPx,
              change24h,
              changePercent24h,
            };
          }
          tickersRef.current = updated;
          setTickers(updated);
        }
      }
    } catch (e) {
      console.error('Failed to fetch meta:', e);
    }
  }, []);

  // Process WebSocket price updates
  const processPriceUpdate = useCallback((mids: Record<string, string>) => {
    if (!mountedRef.current) return;

    const prevDayPrices = prevDayPricesRef.current;
    const newTickers: Record<string, TickerData> = {};

    for (const [symbol, priceStr] of Object.entries(mids)) {
      const price = parseFloat(priceStr);
      if (isNaN(price)) continue;

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

    // Fetch meta first, then connect WebSocket
    const init = async () => {
      await fetchMeta();
      connectWebSocket();
    };
    init();

    // Set up meta refresh interval
    metaIntervalRef.current = setInterval(fetchMeta, META_REFRESH_INTERVAL);

    return () => {
      mountedRef.current = false;

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      if (metaIntervalRef.current) {
        clearInterval(metaIntervalRef.current);
        metaIntervalRef.current = null;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [fetchMeta, connectWebSocket]);

  return {
    tickers,
    status,
    lastUpdate,
    error,
  };
}
