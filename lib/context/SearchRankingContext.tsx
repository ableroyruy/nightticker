'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { stocks } from '@/lib/markets/stocks';

const STORAGE_KEY = 'nightticker_page_views';
const RANKING_SNAPSHOT_KEY = 'nightticker_page_views_snapshot';

interface PageViewRecord {
  symbol: string;
  timestamp: number;
}

interface RankingSnapshot {
  rankings: { symbol: string; count: number }[];
  timestamp: number;
}

export interface SearchRankingItem {
  symbol: string;
  count: number;
  rank: number;
  previousRank: number | null;
  rankChange: number | null;
}

interface SearchRankingContextValue {
  rankings: SearchRankingItem[];
  recordPageView: (symbol: string) => void;
  getTopRankings: (limit?: number) => SearchRankingItem[];
}

const SearchRankingContext = createContext<SearchRankingContextValue | null>(
  null
);

export function SearchRankingProvider({ children }: { children: ReactNode }) {
  const [rankings, setRankings] = useState<SearchRankingItem[]>([]);

  // Calculate rankings from stored data
  const calculateRankings = useCallback((): SearchRankingItem[] => {
    if (typeof window === 'undefined') return [];

    const now = Date.now();
    const last24h = now - 24 * 60 * 60 * 1000;
    const last48h = now - 48 * 60 * 60 * 1000;

    // Get page view records
    const stored = localStorage.getItem(STORAGE_KEY);
    const records: PageViewRecord[] = stored ? JSON.parse(stored) : [];

    // Filter records from last 24h
    const recentRecords = records.filter((r) => r.timestamp > last24h);

    // Count views per symbol
    const countMap = new Map<string, number>();
    recentRecords.forEach((r) => {
      countMap.set(r.symbol, (countMap.get(r.symbol) || 0) + 1);
    });

    // If no view data, return popular stocks as default
    if (countMap.size === 0) {
      const defaultStocks = stocks.slice(0, 10);
      return defaultStocks.map((stock, index) => ({
        symbol: stock.symbol,
        count: 10 - index,
        rank: index + 1,
        previousRank: null,
        rankChange: null,
      }));
    }

    // Create current rankings
    const currentRankings = Array.from(countMap.entries())
      .map(([symbol, count]) => ({ symbol, count }))
      .sort((a, b) => b.count - a.count);

    // Get 48h snapshot for comparison
    const snapshotStored = localStorage.getItem(RANKING_SNAPSHOT_KEY);
    const snapshot: RankingSnapshot | null = snapshotStored
      ? JSON.parse(snapshotStored)
      : null;

    // Create previous rank map
    const previousRankMap = new Map<string, number>();
    if (snapshot && snapshot.timestamp > last48h) {
      snapshot.rankings.forEach((item, index) => {
        previousRankMap.set(item.symbol, index + 1);
      });
    }

    // Build final rankings with rank changes
    return currentRankings.map((item, index) => {
      const rank = index + 1;
      const previousRank = previousRankMap.get(item.symbol) ?? null;
      const rankChange = previousRank !== null ? previousRank - rank : null;
      return {
        symbol: item.symbol,
        count: item.count,
        rank,
        previousRank,
        rankChange,
      };
    });
  }, []);

  // Record a page view
  const recordPageView = useCallback(
    (symbol: string) => {
      if (typeof window === 'undefined') return;

      const now = Date.now();
      const last48h = now - 48 * 60 * 60 * 1000;

      // Get existing records
      const stored = localStorage.getItem(STORAGE_KEY);
      const records: PageViewRecord[] = stored ? JSON.parse(stored) : [];

      // Add new record
      records.push({ symbol, timestamp: now });

      // Clean up old records (keep only last 48h)
      const cleanedRecords = records.filter((r) => r.timestamp > last48h);

      // Save
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedRecords));

      // Update rankings
      setRankings(calculateRankings());
    },
    [calculateRankings]
  );

  // Save snapshot for 48h comparison
  const saveSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    const last24h = now - 24 * 60 * 60 * 1000;

    const stored = localStorage.getItem(STORAGE_KEY);
    const records: PageViewRecord[] = stored ? JSON.parse(stored) : [];

    const recentRecords = records.filter((r) => r.timestamp > last24h);

    const countMap = new Map<string, number>();
    recentRecords.forEach((r) => {
      countMap.set(r.symbol, (countMap.get(r.symbol) || 0) + 1);
    });

    const snapshotRankings = Array.from(countMap.entries())
      .map(([symbol, count]) => ({ symbol, count }))
      .sort((a, b) => b.count - a.count);

    const snapshot: RankingSnapshot = {
      rankings: snapshotRankings,
      timestamp: now,
    };

    localStorage.setItem(RANKING_SNAPSHOT_KEY, JSON.stringify(snapshot));
  }, []);

  // Load initial rankings
  useEffect(() => {
    setRankings(calculateRankings());

    // Save snapshot every hour
    const snapshotInterval = setInterval(saveSnapshot, 60 * 60 * 1000);

    return () => clearInterval(snapshotInterval);
  }, [calculateRankings, saveSnapshot]);

  // Get top N rankings
  const getTopRankings = useCallback(
    (limit: number = 10) => {
      return rankings.slice(0, limit);
    },
    [rankings]
  );

  const value = useMemo(
    () => ({
      rankings,
      recordPageView,
      getTopRankings,
    }),
    [rankings, recordPageView, getTopRankings]
  );

  return (
    <SearchRankingContext.Provider value={value}>
      {children}
    </SearchRankingContext.Provider>
  );
}

export function useSearchRanking() {
  const context = useContext(SearchRankingContext);
  if (!context) {
    throw new Error(
      'useSearchRanking must be used within a SearchRankingProvider'
    );
  }
  return context;
}
