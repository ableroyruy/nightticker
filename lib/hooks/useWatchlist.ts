'use client';

import { useState, useEffect, useCallback } from 'react';

const WATCHLIST_KEY = 'nightticker_watchlist';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(WATCHLIST_KEY);
        if (stored) {
          setWatchlist(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load watchlist:', error);
      }
      setIsLoaded(true);
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
      } catch (error) {
        console.error('Failed to save watchlist:', error);
      }
    }
  }, [watchlist, isLoaded]);

  const add = useCallback((symbol: string) => {
    setWatchlist((prev) => {
      const normalizedSymbol = symbol.toUpperCase();
      if (prev.includes(normalizedSymbol)) {
        return prev;
      }
      return [...prev, normalizedSymbol];
    });
  }, []);

  const remove = useCallback((symbol: string) => {
    setWatchlist((prev) =>
      prev.filter((s) => s !== symbol.toUpperCase())
    );
  }, []);

  const toggle = useCallback((symbol: string) => {
    const normalizedSymbol = symbol.toUpperCase();
    setWatchlist((prev) => {
      if (prev.includes(normalizedSymbol)) {
        return prev.filter((s) => s !== normalizedSymbol);
      }
      return [...prev, normalizedSymbol];
    });
  }, []);

  const isWatched = useCallback(
    (symbol: string) => watchlist.includes(symbol.toUpperCase()),
    [watchlist]
  );

  const clear = useCallback(() => {
    setWatchlist([]);
  }, []);

  return {
    watchlist,
    isLoaded,
    add,
    remove,
    toggle,
    isWatched,
    clear,
  };
}
