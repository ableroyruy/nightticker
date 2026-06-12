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

// Storage keys
const STORAGE_KEY = 'nightticker_ranking_v2';
const LEGACY_STORAGE_KEY = 'nightticker_page_views';
const LEGACY_CACHE_KEY = 'nightticker_ranking_cache';

// Time constants
const ONE_HOUR_MS = 60 * 60 * 1000;
const FIVE_MINUTES_MS = 5 * 60 * 1000;
const MAX_BUCKETS = 72; // 72 hours of data

// Scoring constants
const HALF_LIFE_HOURS = 6; // Time weight half-life
const EMA_ALPHA = 0.3; // Smoothing factor (30% new data)

// Default popular stocks for cold start (based on typical market interest)
const DEFAULT_POPULAR_STOCKS = [
  'NVDA', 'TSLA', 'AAPL', 'SMSN', 'SP500',
  'MSFT', 'GOOGL', 'AMZN', 'META', 'AMD',
];

// Types
interface HourlyBucket {
  hour: number; // Unix hour (timestamp / 3600000)
  counts: Record<string, number>; // symbol -> view count
}

interface RankingData {
  buckets: HourlyBucket[];
  smoothedScores: Record<string, number>;
  previousRanks: Record<string, number>;
  lastCalculation: number;
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
  isUsingFallback: boolean;
}

const SearchRankingContext = createContext<SearchRankingContextValue | null>(null);

// Calculate time weight using exponential decay
const getTimeWeight = (hoursAgo: number): number => {
  return Math.pow(0.5, hoursAgo / HALF_LIFE_HOURS);
};

// Get current Unix hour
const getCurrentHour = (): number => Math.floor(Date.now() / ONE_HOUR_MS);

// Initialize empty ranking data
const createEmptyData = (): RankingData => ({
  buckets: [],
  smoothedScores: {},
  previousRanks: {},
  lastCalculation: 0,
  version: 2,
});

// Load ranking data from storage
const loadRankingData = (): RankingData => {
  if (typeof window === 'undefined') return createEmptyData();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: RankingData = JSON.parse(stored);
      if (data.version === 2) {
        return data;
      }
    }

    // Migrate from legacy format if exists
    const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyData) {
      const records: { symbol: string; timestamp: number }[] = JSON.parse(legacyData);
      const currentHour = getCurrentHour();
      const bucketMap = new Map<number, Record<string, number>>();

      records.forEach((record) => {
        const recordHour = Math.floor(record.timestamp / ONE_HOUR_MS);
        if (currentHour - recordHour <= MAX_BUCKETS) {
          const bucket = bucketMap.get(recordHour) || {};
          bucket[record.symbol] = (bucket[record.symbol] || 0) + 1;
          bucketMap.set(recordHour, bucket);
        }
      });

      const buckets: HourlyBucket[] = Array.from(bucketMap.entries())
        .map(([hour, counts]) => ({ hour, counts }))
        .sort((a, b) => b.hour - a.hour);

      // Load previous smoothed scores from legacy cache
      let smoothedScores: Record<string, number> = {};
      let previousRanks: Record<string, number> = {};
      const legacyCache = localStorage.getItem(LEGACY_CACHE_KEY);
      if (legacyCache) {
        const cache = JSON.parse(legacyCache);
        if (cache.rankings) {
          cache.rankings.forEach((item: { symbol: string; count: number; rank: number }) => {
            smoothedScores[item.symbol] = item.count;
            previousRanks[item.symbol] = item.rank;
          });
        }
      }

      const migratedData: RankingData = {
        buckets,
        smoothedScores,
        previousRanks,
        lastCalculation: Date.now(),
        version: 2,
      };

      // Save migrated data and clean up legacy
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedData));
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.removeItem(LEGACY_CACHE_KEY);

      return migratedData;
    }
  } catch (e) {
    console.error('Failed to load ranking data:', e);
  }

  return createEmptyData();
};

// Save ranking data to storage
const saveRankingData = (data: RankingData): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save ranking data:', e);
  }
};

export function SearchRankingProvider({ children }: { children: ReactNode }) {
  const [rankings, setRankings] = useState<SearchRankingItem[]>([]);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [rankingData, setRankingData] = useState<RankingData>(createEmptyData);

  // Calculate rankings with time-weighted scoring and EMA smoothing
  const calculateRankings = useCallback(
    (data: RankingData, forceRecalculate = false): { rankings: SearchRankingItem[]; updatedData: RankingData; usingFallback: boolean } => {
      const now = Date.now();
      const currentHour = getCurrentHour();

      // Check if we can use cached calculation (5-minute cache)
      if (!forceRecalculate && now - data.lastCalculation < FIVE_MINUTES_MS) {
        // Reconstruct rankings from smoothed scores
        const cachedRankings = Object.entries(data.smoothedScores)
          .sort((a, b) => b[1] - a[1])
          .map(([symbol, score], index) => {
            const rank = index + 1;
            const previousRank = data.previousRanks[symbol] ?? null;
            const rankChange = previousRank !== null ? previousRank - rank : null;
            return { symbol, score, rank, previousRank, rankChange };
          });

        if (cachedRankings.length > 0) {
          return { rankings: cachedRankings, updatedData: data, usingFallback: false };
        }
      }

      // Filter valid buckets (within 72 hours)
      const validBuckets = data.buckets.filter((b) => currentHour - b.hour <= MAX_BUCKETS);

      // Calculate time-weighted scores
      const weightedScores: Record<string, number> = {};
      let hasRecentData = false;

      validBuckets.forEach((bucket) => {
        const hoursAgo = currentHour - bucket.hour;
        const weight = getTimeWeight(hoursAgo);

        // Check if we have data within last 24 hours
        if (hoursAgo <= 24) {
          hasRecentData = true;
        }

        Object.entries(bucket.counts).forEach(([symbol, count]) => {
          weightedScores[symbol] = (weightedScores[symbol] || 0) + count * weight;
        });
      });

      // Determine fallback strategy
      let finalScores = weightedScores;
      let usingFallback = false;

      if (Object.keys(weightedScores).length === 0) {
        // Fallback 1: Use previous smoothed scores
        if (Object.keys(data.smoothedScores).length > 0) {
          finalScores = { ...data.smoothedScores };
          usingFallback = true;
        }
        // Fallback 2: Use default popular stocks
        else {
          DEFAULT_POPULAR_STOCKS.forEach((symbol, i) => {
            finalScores[symbol] = DEFAULT_POPULAR_STOCKS.length - i;
          });
          usingFallback = true;
        }
      } else if (!hasRecentData) {
        // Have old data but nothing recent - blend with previous scores
        Object.entries(data.smoothedScores).forEach(([symbol, score]) => {
          if (!(symbol in finalScores)) {
            finalScores[symbol] = score * 0.5; // Decay old scores
          }
        });
      }

      // Apply EMA smoothing (only if we have real data)
      const newSmoothedScores: Record<string, number> = {};

      Object.entries(finalScores).forEach(([symbol, score]) => {
        const prevSmoothed = data.smoothedScores[symbol];
        if (usingFallback || prevSmoothed === undefined) {
          // No smoothing for fallback or new entries
          newSmoothedScores[symbol] = score;
        } else {
          // EMA: new_value = alpha * current + (1 - alpha) * previous
          newSmoothedScores[symbol] = EMA_ALPHA * score + (1 - EMA_ALPHA) * prevSmoothed;
        }
      });

      // Build rankings
      const newRankings = Object.entries(newSmoothedScores)
        .sort((a, b) => b[1] - a[1])
        .map(([symbol, score], index) => {
          const rank = index + 1;
          const previousRank = data.previousRanks[symbol] ?? null;
          const rankChange = previousRank !== null ? previousRank - rank : null;
          return {
            symbol,
            score: Math.round(score * 100) / 100,
            rank,
            previousRank,
            rankChange,
          };
        });

      // Update previous ranks for next calculation
      const newPreviousRanks: Record<string, number> = {};
      newRankings.forEach((item) => {
        newPreviousRanks[item.symbol] = item.rank;
      });

      const updatedData: RankingData = {
        buckets: validBuckets,
        smoothedScores: newSmoothedScores,
        previousRanks: newPreviousRanks,
        lastCalculation: now,
        version: 2,
      };

      return { rankings: newRankings, updatedData, usingFallback };
    },
    []
  );

  // Record a page view
  const recordPageView = useCallback(
    (symbol: string) => {
      if (typeof window === 'undefined') return;

      const currentHour = getCurrentHour();

      setRankingData((prevData) => {
        // Find or create current hour bucket
        let buckets = [...prevData.buckets];
        let currentBucket = buckets.find((b) => b.hour === currentHour);

        if (currentBucket) {
          // Update existing bucket
          currentBucket = {
            ...currentBucket,
            counts: {
              ...currentBucket.counts,
              [symbol]: (currentBucket.counts[symbol] || 0) + 1,
            },
          };
          buckets = buckets.map((b) => (b.hour === currentHour ? currentBucket! : b));
        } else {
          // Create new bucket
          currentBucket = {
            hour: currentHour,
            counts: { [symbol]: 1 },
          };
          buckets = [currentBucket, ...buckets];
        }

        // Keep only valid buckets
        buckets = buckets
          .filter((b) => currentHour - b.hour <= MAX_BUCKETS)
          .sort((a, b) => b.hour - a.hour);

        const newData: RankingData = {
          ...prevData,
          buckets,
          lastCalculation: 0, // Force recalculation
        };

        // Calculate new rankings
        const { rankings: newRankings, updatedData, usingFallback } = calculateRankings(newData, true);

        // Save to storage
        saveRankingData(updatedData);

        // Update state
        setRankings(newRankings);
        setIsUsingFallback(usingFallback);

        return updatedData;
      });
    },
    [calculateRankings]
  );

  // Load initial data and set up intervals
  useEffect(() => {
    const data = loadRankingData();
    setRankingData(data);

    const { rankings: initialRankings, updatedData, usingFallback } = calculateRankings(data);
    setRankings(initialRankings);
    setIsUsingFallback(usingFallback);

    if (updatedData !== data) {
      saveRankingData(updatedData);
      setRankingData(updatedData);
    }

    // Update rankings every 5 minutes
    const interval = setInterval(() => {
      setRankingData((prevData) => {
        const { rankings: newRankings, updatedData, usingFallback } = calculateRankings(prevData, true);
        setRankings(newRankings);
        setIsUsingFallback(usingFallback);
        saveRankingData(updatedData);
        return updatedData;
      });
    }, FIVE_MINUTES_MS);

    return () => clearInterval(interval);
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
      isUsingFallback,
    }),
    [rankings, recordPageView, getTopRankings, isUsingFallback]
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
