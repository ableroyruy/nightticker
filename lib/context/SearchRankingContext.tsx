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

// Default popular stocks (fallback)
const DEFAULT_POPULAR_STOCKS = [
  'NVDA', 'TSLA', 'AAPL', 'SMSN', 'SP500',
  'MSFT', 'GOOGL', 'AMZN', 'META', 'AMD',
];

export interface SearchRankingItem {
  symbol: string;
  views: number;
  rank: number;
  previousRank: number | null;
  rankChange: number | null;
}

interface SearchRankingContextValue {
  rankings: SearchRankingItem[];
  recordPageView: (symbol: string) => void;
  getTopRankings: (limit?: number) => SearchRankingItem[];
  isLoading: boolean;
}

const SearchRankingContext = createContext<SearchRankingContextValue | null>(null);

// Get default rankings
const getDefaultRankings = (): SearchRankingItem[] => {
  return DEFAULT_POPULAR_STOCKS.map((symbol, index) => ({
    symbol,
    views: 0,
    rank: index + 1,
    previousRank: null,
    rankChange: null,
  }));
};

// Local storage cache key - v2 to invalidate old cache
const CACHE_KEY = 'nightticker_ranking_cache_v2';
const CACHE_TTL = 30 * 60 * 1000; // 30 minute cache

interface CachedData {
  rankings: SearchRankingItem[];
  timestamp: number;
}

// Load from cache
const loadCache = (): SearchRankingItem[] | null => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const data: CachedData = JSON.parse(cached);
      // Use cache if less than 30 minutes old
      if (Date.now() - data.timestamp < CACHE_TTL) {
        return data.rankings;
      }
    }
  } catch (e) {
    console.error('Cache load error:', e);
  }
  return null;
};

// Save to cache
const saveCache = (rankings: SearchRankingItem[], timestamp: number): void => {
  if (typeof window === 'undefined') return;
  try {
    const data: CachedData = { rankings, timestamp };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Cache save error:', e);
  }
};

export function SearchRankingProvider({ children }: { children: ReactNode }) {
  const [rankings, setRankings] = useState<SearchRankingItem[]>(getDefaultRankings);
  const [isLoading, setIsLoading] = useState(true);
  const pendingViewsRef = useRef<string[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch rankings from API with retry
  const fetchRankings = useCallback(async function fetchWithRetry(retryCount = 0): Promise<SearchRankingItem[] | null> {
    const maxRetries = 2;
    try {
      const response = await fetch('/api/ranking');
      if (response.ok) {
        const data = await response.json();
        if (data.rankings && data.rankings.length > 0) {
          setRankings(data.rankings);
          saveCache(data.rankings, data.lastUpdated);
          return data.rankings;
        }
      } else {
        console.error('Fetch rankings failed:', response.status, response.statusText);
      }
    } catch (e) {
      console.error('Fetch rankings error:', e);
      // Retry on network error
      if (retryCount < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)));
        return fetchWithRetry(retryCount + 1);
      }
    }
    return null;
  }, []);

  // Flush pending views to server
  const flushPendingViews = useCallback(async () => {
    if (pendingViewsRef.current.length === 0) return;

    const views = [...pendingViewsRef.current];
    pendingViewsRef.current = [];

    // Send each view (could batch but keeping simple)
    for (const symbol of views) {
      try {
        await fetch('/api/ranking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol }),
        });
      } catch (e) {
        console.error('Record view error:', e);
      }
    }

    // Rankings refresh on their own 30-minute schedule.
  }, []);

  // Record a page view (debounced)
  const recordPageView = useCallback(
    (symbol: string) => {
      pendingViewsRef.current.push(symbol);

      // Debounce: flush after 2 seconds of no new views
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
      flushTimeoutRef.current = setTimeout(() => {
        flushPendingViews();
      }, 2000);
    },
    [flushPendingViews]
  );

  // Initialize
  useEffect(() => {
    // Try cache first for instant display
    let cancelled = false;
    Promise.resolve().then(async () => {
      if (cancelled) return;
      const cached = loadCache();
      if (cached && cached.length > 0) {
        setRankings(cached);
      } else {
        await fetchRankings();
      }
      if (!cancelled) setIsLoading(false);
    });

    // Refresh every 30 minutes
    const interval = setInterval(() => {
      fetchRankings();
    }, CACHE_TTL);

    // Cleanup
    return () => {
      cancelled = true;
      clearInterval(interval);
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
        // Flush any pending views on unmount
        flushPendingViews();
      }
    };
  }, [fetchRankings, flushPendingViews]);

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
      isLoading,
    }),
    [rankings, recordPageView, getTopRankings, isLoading]
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
