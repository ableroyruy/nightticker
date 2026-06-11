'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'nightticker_search_ranking';
const RANKING_SNAPSHOT_KEY = 'nightticker_search_ranking_snapshot';

interface SearchRecord {
  symbol: string;
  timestamp: number;
}

interface RankingSnapshot {
  rankings: { symbol: string; count: number }[];
  timestamp: number;
}

interface SearchRankingItem {
  symbol: string;
  count: number;
  rank: number;
  previousRank: number | null;
  rankChange: number | null;
}

export function useSearchRanking() {
  const [rankings, setRankings] = useState<SearchRankingItem[]>([]);

  // Load and calculate rankings
  const calculateRankings = useCallback(() => {
    if (typeof window === 'undefined') return [];

    const now = Date.now();
    const last24h = now - 24 * 60 * 60 * 1000;
    const last48h = now - 48 * 60 * 60 * 1000;

    // Get search records
    const stored = localStorage.getItem(STORAGE_KEY);
    const records: SearchRecord[] = stored ? JSON.parse(stored) : [];

    // Filter records from last 24h
    const recentRecords = records.filter((r) => r.timestamp > last24h);

    // Count searches per symbol
    const countMap = new Map<string, number>();
    recentRecords.forEach((r) => {
      countMap.set(r.symbol, (countMap.get(r.symbol) || 0) + 1);
    });

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
    const finalRankings: SearchRankingItem[] = currentRankings.map(
      (item, index) => {
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
      }
    );

    return finalRankings;
  }, []);

  // Record a search
  const recordSearch = useCallback((symbol: string) => {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    const last48h = now - 48 * 60 * 60 * 1000;

    // Get existing records
    const stored = localStorage.getItem(STORAGE_KEY);
    const records: SearchRecord[] = stored ? JSON.parse(stored) : [];

    // Add new record
    records.push({ symbol, timestamp: now });

    // Clean up old records (keep only last 48h)
    const cleanedRecords = records.filter((r) => r.timestamp > last48h);

    // Save
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedRecords));

    // Update rankings
    setRankings(calculateRankings());
  }, [calculateRankings]);

  // Save snapshot every hour (for 48h comparison)
  const saveSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    const last24h = now - 24 * 60 * 60 * 1000;

    const stored = localStorage.getItem(STORAGE_KEY);
    const records: SearchRecord[] = stored ? JSON.parse(stored) : [];

    // Filter for 24h
    const recentRecords = records.filter((r) => r.timestamp > last24h);

    // Count
    const countMap = new Map<string, number>();
    recentRecords.forEach((r) => {
      countMap.set(r.symbol, (countMap.get(r.symbol) || 0) + 1);
    });

    const rankings = Array.from(countMap.entries())
      .map(([symbol, count]) => ({ symbol, count }))
      .sort((a, b) => b.count - a.count);

    const snapshot: RankingSnapshot = {
      rankings,
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

  return {
    rankings,
    recordSearch,
    getTopRankings,
  };
}
