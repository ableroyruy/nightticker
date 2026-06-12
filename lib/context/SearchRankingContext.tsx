'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import { stocks } from '@/lib/markets/stocks';

const STORAGE_KEY = 'nightticker_page_views';
const RANKING_CACHE_KEY = 'nightticker_ranking_cache';

// Time constants
const FIVE_MINUTES = 5 * 60 * 1000;
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;
const SEVENTY_TWO_HOURS = 72 * 60 * 60 * 1000;

interface PageViewRecord {
  symbol: string;
  timestamp: number;
}

interface RankingCache {
  rankings: SearchRankingItem[];
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
  const lastCalculationRef = useRef<number>(0);

  // Calculate rankings from stored data with 5-minute cache
  // 현재 순위: T-24h ~ T (최근 24시간)
  // 전일 순위: T-48h ~ T-24h (그 전 24시간)
  const calculateRankings = useCallback((forceRecalculate = false): SearchRankingItem[] => {
    if (typeof window === 'undefined') return [];

    const now = Date.now();

    // Check cache first (5-minute cache)
    if (!forceRecalculate) {
      const cachedData = localStorage.getItem(RANKING_CACHE_KEY);
      if (cachedData) {
        const cache: RankingCache = JSON.parse(cachedData);
        if (now - cache.timestamp < FIVE_MINUTES) {
          return cache.rankings;
        }
      }
    }

    const last24h = now - TWENTY_FOUR_HOURS;
    const last48h = now - FORTY_EIGHT_HOURS;

    // Get page view records
    const stored = localStorage.getItem(STORAGE_KEY);
    const records: PageViewRecord[] = stored ? JSON.parse(stored) : [];

    // ========================================
    // 현재 순위: 최근 24시간 (T-24h ~ T)
    // ========================================
    const currentRecords = records.filter((r) => r.timestamp > last24h);
    const currentCountMap = new Map<string, number>();
    currentRecords.forEach((r) => {
      currentCountMap.set(r.symbol, (currentCountMap.get(r.symbol) || 0) + 1);
    });

    // If no view data, return popular stocks as default
    if (currentCountMap.size === 0) {
      const defaultStocks = stocks.slice(0, 10);
      const defaultRankings = defaultStocks.map((stock, index) => ({
        symbol: stock.symbol,
        count: 10 - index,
        rank: index + 1,
        previousRank: null,
        rankChange: null,
      }));
      return defaultRankings;
    }

    // Create current rankings (based on 24h views)
    const currentRankings = Array.from(currentCountMap.entries())
      .map(([symbol, count]) => ({ symbol, count }))
      .sort((a, b) => b.count - a.count);

    // ========================================
    // 전일 순위: 24-48시간 전 (T-48h ~ T-24h)
    // ========================================
    const previousRecords = records.filter(
      (r) => r.timestamp > last48h && r.timestamp <= last24h
    );
    const previousCountMap = new Map<string, number>();
    previousRecords.forEach((r) => {
      previousCountMap.set(r.symbol, (previousCountMap.get(r.symbol) || 0) + 1);
    });

    // Create previous rankings (based on 24-48h views)
    const previousRankings = Array.from(previousCountMap.entries())
      .map(([symbol, count]) => ({ symbol, count }))
      .sort((a, b) => b.count - a.count);

    // Create previous rank map
    const previousRankMap = new Map<string, number>();
    previousRankings.forEach((item, index) => {
      previousRankMap.set(item.symbol, index + 1);
    });

    // Build final rankings with rank changes
    const finalRankings = currentRankings.map((item, index) => {
      const rank = index + 1;
      const previousRank = previousRankMap.get(item.symbol) ?? null;
      // rankChange: 양수면 순위 상승, 음수면 순위 하락
      const rankChange = previousRank !== null ? previousRank - rank : null;
      return {
        symbol: item.symbol,
        count: item.count,
        rank,
        previousRank,
        rankChange,
      };
    });

    // Save to cache
    const cache: RankingCache = {
      rankings: finalRankings,
      timestamp: now,
    };
    localStorage.setItem(RANKING_CACHE_KEY, JSON.stringify(cache));
    lastCalculationRef.current = now;

    return finalRankings;
  }, []);

  // Record a page view
  const recordPageView = useCallback(
    (symbol: string) => {
      if (typeof window === 'undefined') return;

      const now = Date.now();
      const last72h = now - SEVENTY_TWO_HOURS;

      // Get existing records
      const stored = localStorage.getItem(STORAGE_KEY);
      const records: PageViewRecord[] = stored ? JSON.parse(stored) : [];

      // Add new record
      records.push({ symbol, timestamp: now });

      // Clean up old records (keep only last 72h for data retention)
      const cleanedRecords = records.filter((r) => r.timestamp > last72h);

      // Save
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedRecords));

      // Update rankings (force recalculation on new page view)
      setRankings(calculateRankings(true));
    },
    [calculateRankings]
  );

  // Load initial rankings and set up intervals
  useEffect(() => {
    setRankings(calculateRankings());

    // Update rankings every 5 minutes
    const rankingInterval = setInterval(() => {
      setRankings(calculateRankings(true));
    }, FIVE_MINUTES);

    return () => {
      clearInterval(rankingInterval);
    };
  }, [calculateRankings]);

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
