'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ConnectionStatus, PriceUpdate } from '@/lib/types/market';

const WS_URL = 'wss://api.hyperliquid.xyz/ws';
const PING_INTERVAL = 20000; // 20 seconds
const RECONNECT_DELAY = 3000; // 3 seconds

interface AllMidsMessage {
  channel: string;
  data: {
    mids: Record<string, string>;
  };
}

interface UseHyperliquidTickerReturn {
  prices: Record<string, number>;
  previousPrices: Record<string, number>;
  status: ConnectionStatus;
  lastUpdate: Date | null;
  error: string | null;
}

export function useHyperliquidTicker(): UseHyperliquidTickerReturn {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [previousPrices, setPreviousPrices] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const clearTimers = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');
    setError(null);

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
        ws.send(
          JSON.stringify({
            method: 'subscribe',
            subscription: {
              type: 'allMids',
            },
          })
        );

        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ method: 'ping' }));
          }
        }, PING_INTERVAL);
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;

        try {
          const data = JSON.parse(event.data);

          // Handle pong
          if (data.channel === 'pong') return;

          // Handle allMids subscription
          if (data.channel === 'allMids' && data.data?.mids) {
            const mids = data.data.mids as Record<string, string>;

            setPrices((prev) => {
              // Store previous prices before updating
              setPreviousPrices(prev);

              const newPrices: Record<string, number> = {};
              for (const [symbol, priceStr] of Object.entries(mids)) {
                const price = parseFloat(priceStr);
                if (!isNaN(price)) {
                  newPrices[symbol] = price;
                }
              }
              return newPrices;
            });

            setLastUpdate(new Date());
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Connection error');
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;

        setStatus('disconnected');
        clearTimers();

        // Auto reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            connect();
          }
        }, RECONNECT_DELAY);
      };
    } catch (e) {
      console.error('Failed to create WebSocket:', e);
      setError('Failed to connect');
      setStatus('disconnected');

      // Retry connection
      reconnectTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          connect();
        }
      }, RECONNECT_DELAY);
    }
  }, [clearTimers]);

  const disconnect = useCallback(() => {
    clearTimers();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, [clearTimers]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    prices,
    previousPrices,
    status,
    lastUpdate,
    error,
  };
}
