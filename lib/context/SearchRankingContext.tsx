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

// Storage key
const STORAGE_KEY = 'nightticker_ranking_v3';

// Time constants
const ONE_HOUR_MS = 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const FIVE_MINUTES_MS = 5 * 60 * 1000;

// Default popular stocks (cold start fallback)
const DEFAULT_POPULAR_STOCKS = [
  'NVDA', 'TSLA', 'AAPL', 'SMSN', 'SP500',
  'MSFT', 'GOOGL', 'AMZN', 'META', 'AMD',
];

// Types
interface ViewRecord {
  symbol: string;
  timestamp: number;
}

interface RankSnapshot {
  ranks: Record<string, number>; // symbol -> rank
  timestamp: number;
}

interface StorageData {
  views: ViewRecord[];
  snapshot24h: RankSnapshot | null; // 24시간 전 스냅샷 (순위 변동 비교용)
  lastSnapshot: RankSnapshot | null; // 마지막 유효 스냅샷 (폴백용)
  version: number;
}

export interface SearchRankingItem {
  symbol: string;
  score: number;
  rank: number;
  previousRank: number | null;
  rankChange: number | null;
}

interface SearchRankingContextValue {
  rankings: SearchRankingItem[];
  recordPageView: (symbol: string) => void;
  getTopRankings: (limit?: number) => SearchRankingItem[];
}

const SearchRankingContext = createContext<SearchRankingContextValue | null>(null);

// Create empty storage data
const createEmptyData = (): StorageData => ({
  views: [],
  snapshot24h: null,
  lastSnapshot: null,
  version: 3,
});

// Load data from localStorage
const loadData = (): StorageData => {
  if (typeof window === 'undefined') return createEmptyData();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (data.version === 3) {
        return data;
      }
    }

    // Migration from v2 or earlier - start fresh but keep any existing views
    // Clean up old keys
    localStorage.removeItem('nightticker_ranking_v2');
    localStorage.removeItem('nightticker_page_views');
    localStorage.removeItem('nightticker_ranking_cache');
  } catch (e) {
    console.error('Failed to load ranking data:', e);
  }

  return createEmptyData();
};

// Save data to localStorage
const saveData = (data: StorageData): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save ranking data:', e);
  }
};

// Calculate rankings from view records
const calculateRankingsFromViews = (
  views: ViewRecord[],
  snapshot24h: RankSnapshot | null
): SearchRankingItem[] => {
  const now = Date.now();
  const cutoff24h = now - TWENTY_FOUR_HOURS_MS;

  // Count views in last 24 hours with time decay
  const scores: Record<string, number> = {};

  views
    .filter((v) => v.timestamp > cutoff24h)
    .forEach((v) => {
      // Time decay: recent views worth more (half-life = 6 hours)
      const hoursAgo = (now - v.timestamp) / ONE_HOUR_MS;
      const weight = Math.pow(0.5, hoursAgo / 6);
      scores[v.symbol] = (scores[v.symbol] || 0) + weight;
    });

  // Sort by score
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1]);

  // Build rankings with rank change
  return sorted.map(([symbol, score], index) => {
    const rank = index + 1;
    const previousRank = snapshot24h?.ranks[symbol] ?? null;

    // rankChange: positive = moved up, negative = moved down
    // e.g., was rank 5, now rank 2 → change = 5 - 2 = +3 (moved up 3 positions)
    const rankChange = previousRank !== null ? previousRank - rank : null;

    return {
      symbol,
      score: Math.round(score * 100) / 100,
      rank,
      previousRank,
      rankChange,
    };
  });
};

// Get default rankings for cold start
const getDefaultRankings = (): SearchRankingItem[] => {
  return DEFAULT_POPULAR_STOCKS.map((symbol, index) => ({
    symbol,
    score: DEFAULT_POPULAR_STOCKS.length - index,
    rank: index + 1,
    previousRank: null,
    rankChange: null,
  }));
};

export function SearchRankingProvider({ children }: { children: ReactNode }) {
  const [rankings, setRankings] = useState<SearchRankingItem[]>([]);
  const [storageData, setStorageData] = useState<StorageData>(createEmptyData);

  // Calculate and update rankings
  const updateRankings = useCallback((data: StorageData): StorageData => {
    const now = Date.now();
    const cutoff72h = now - (72 * ONE_HOUR_MS);
    const cutoff24h = now - TWENTY_FOUR_HOURS_MS;

    // Clean old views (keep 72 hours for data retention)
    const cleanedViews = data.views.filter((v) => v.timestamp > cutoff72h);

    // Calculate current rankings
    let currentRankings = calculateRankingsFromViews(cleanedViews, data.snapshot24h);

    // Fallback chain if no current data
    if (currentRankings.length === 0) {
      // Fallback 1: Use last valid snapshot
      if (data.lastSnapshot && Object.keys(data.lastSnapshot.ranks).length > 0) {
        currentRankings = Object.entries(data.lastSnapshot.ranks)
          .sort((a, b) => a[1] - b[1]) // Sort by rank (ascending)
          .map(([symbol, rank]) => ({
            symbol,
            score: 100 - rank, // Approximate score from rank
            rank,
            previousRank: null,
            rankChange: null,
          }));
      }
      // Fallback 2: Default popular stocks
      else {
        currentRankings = getDefaultRankings();
      }
    }

    // Update 24h snapshot if needed (for rank change comparison)
    let newSnapshot24h = data.snapshot24h;

    // Create/update 24h snapshot if:
    // 1. No snapshot exists, or
    // 2. Snapshot is older than 24 hours
    if (!newSnapshot24h || now - newSnapshot24h.timestamp > TWENTY_FOUR_HOURS_MS) {
      // Use current rankings as the new 24h snapshot
      const newRanks: Record<string, number> = {};
      currentRankings.forEach((item) => {
        newRanks[item.symbol] = item.rank;
      });
      newSnapshot24h = {
        ranks: newRanks,
        timestamp: now,
      };
    }

    // Always save the last valid snapshot (for fallback)
    let newLastSnapshot = data.lastSnapshot;
    if (currentRankings.length > 0) {
      const ranks: Record<string, number> = {};
      currentRankings.forEach((item) => {
        ranks[item.symbol] = item.rank;
      });
      newLastSnapshot = {
        ranks,
        timestamp: now,
      };
    }

    // Update state
    setRankings(currentRankings);

    // Return updated data
    return {
      views: cleanedViews,
      snapshot24h: newSnapshot24h,
      lastSnapshot: newLastSnapshot,
      version: 3,
    };
  }, []);

  // Record a page view
  const recordPageView = useCallback(
    (symbol: string) => {
      if (typeof window === 'undefined') return;

      setStorageData((prevData) => {
        // Add new view
        const newViews = [
          ...prevData.views,
          { symbol, timestamp: Date.now() },
        ];

        const newData: StorageData = {
          ...prevData,
          views: newViews,
        };

        // Recalculate rankings
        const updatedData = updateRankings(newData);

        // Save to storage
        saveData(updatedData);

        return updatedData;
      });
    },
    [updateRankings]
  );

  // Initialize on mount
  useEffect(() => {
    const data = loadData();
    const updatedData = updateRankings(data);

    if (JSON.stringify(data) !== JSON.stringify(updatedData)) {
      saveData(updatedData);
    }
    setStorageData(updatedData);

    // Refresh every 5 minutes
    const interval = setInterval(() => {
      setStorageData((prevData) => {
        const updatedData = updateRankings(prevData);
        saveData(updatedData);
        return updatedData;
      });
    }, FIVE_MINUTES_MS);

    return () => clearInterval(interval);
  }, [updateRankings]);

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
