'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ConnectionStatus } from '@/lib/types/market';

const API_URL = 'https://api.hyperliquid.xyz/info';
const POLL_INTERVAL = 5000; // 5 seconds

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
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPrices = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'allMids', dex: 'xyz' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();

      if (!mountedRef.current) return;

      setPrices((prev) => {
        // Store previous prices before updating
        if (Object.keys(prev).length > 0) {
          setPreviousPrices(prev);
        }

        const newPrices: Record<string, number> = {};
        for (const [symbol, priceStr] of Object.entries(data)) {
          const price = parseFloat(priceStr as string);
          if (!isNaN(price)) {
            newPrices[symbol] = price;
          }
        }
        return newPrices;
      });

      setStatus('connected');
      setLastUpdate(new Date());
      setError(null);
    } catch (e) {
      console.error('Failed to fetch prices:', e);
      if (mountedRef.current) {
        setError('Failed to fetch prices');
        setStatus('disconnected');
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // Initial fetch
    fetchPrices();

    // Set up polling interval
    intervalRef.current = setInterval(fetchPrices, POLL_INTERVAL);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchPrices]);

  return {
    prices,
    previousPrices,
    status,
    lastUpdate,
    error,
  };
}
