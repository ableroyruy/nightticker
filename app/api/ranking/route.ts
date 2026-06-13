import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const BUCKET_TTL_SECONDS = 25 * 60 * 60; // 25 hours TTL
const SNAPSHOT_TTL_SECONDS = 25 * 60 * 60; // 25 hours TTL for snapshots

// Default popular stocks for cold start
const DEFAULT_POPULAR_STOCKS = [
  'NVDA', 'TSLA', 'AAPL', 'SMSN', 'SP500',
  'MSFT', 'GOOGL', 'AMZN', 'META', 'AMD',
];

interface RankingItem {
  symbol: string;
  views: number;
  rank: number;
  previousRank: number | null;
  rankChange: number | null;
}

// Get the start of the current 5-minute bucket
function getBucketTimestamp(timestamp: number): number {
  return Math.floor(timestamp / FIVE_MINUTES_MS) * FIVE_MINUTES_MS;
}

// Get the start of the current hour
function getHourTimestamp(timestamp: number): number {
  return Math.floor(timestamp / ONE_HOUR_MS) * ONE_HOUR_MS;
}

// Get bucket key for Redis
function getBucketKey(timestamp: number): string {
  return `ranking:bucket:${timestamp}`;
}

// Get hourly snapshot key for Redis
function getSnapshotKey(timestamp: number): string {
  return `ranking:snapshot:${timestamp}`;
}

// GET - Fetch rankings
export async function GET() {
  try {
    const now = Date.now();
    const cutoff24h = now - TWENTY_FOUR_HOURS_MS;

    // Get all bucket keys from last 24 hours
    const bucketKeys: string[] = [];
    let bucketTime = getBucketTimestamp(now);
    while (bucketTime > cutoff24h) {
      bucketKeys.push(getBucketKey(bucketTime));
      bucketTime -= FIVE_MINUTES_MS;
    }

    // Fetch all buckets in parallel (pipeline)
    const pipeline = redis.pipeline();
    bucketKeys.forEach((key) => pipeline.hgetall(key));
    const results = await pipeline.exec();

    // Aggregate view counts
    const viewCounts: Record<string, number> = {};
    results.forEach((result) => {
      if (result && typeof result === 'object') {
        Object.entries(result).forEach(([symbol, count]) => {
          const numCount = typeof count === 'number' ? count : parseInt(count as string, 10);
          if (!isNaN(numCount)) {
            viewCounts[symbol] = (viewCounts[symbol] || 0) + numCount;
          }
        });
      }
    });

    // Get previous rankings from 1 hour ago snapshot
    const previousHourTimestamp = getHourTimestamp(now) - ONE_HOUR_MS;
    const previousSnapshotKey = getSnapshotKey(previousHourTimestamp);
    const previousRanks = (await redis.hgetall(previousSnapshotKey)) as Record<string, number> | null;

    // If no data, return defaults
    if (Object.keys(viewCounts).length === 0) {
      return NextResponse.json(
        {
          rankings: DEFAULT_POPULAR_STOCKS.map((symbol, index) => ({
            symbol,
            views: 0,
            rank: index + 1,
            previousRank: null,
            rankChange: null,
          })),
          lastUpdated: now,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          },
        }
      );
    }

    // Sort by view count (descending)
    const sorted = Object.entries(viewCounts).sort((a, b) => b[1] - a[1]);

    const rankings: RankingItem[] = sorted.map(([symbol, views], index) => {
      const rank = index + 1;
      const prevRank = previousRanks?.[symbol];
      const previousRank = prevRank !== undefined ? Number(prevRank) : null;
      const rankChange = previousRank !== null ? previousRank - rank : null;

      return { symbol, views, rank, previousRank, rankChange };
    });

    return NextResponse.json(
      { rankings, lastUpdated: now },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('GET ranking error:', error);
    return NextResponse.json({
      rankings: DEFAULT_POPULAR_STOCKS.map((symbol, index) => ({
        symbol,
        views: 0,
        rank: index + 1,
        previousRank: null,
        rankChange: null,
      })),
      lastUpdated: Date.now(),
    });
  }
}

// POST - Record a page view
export async function POST(request: NextRequest) {
  try {
    const { symbol } = await request.json();

    if (!symbol || typeof symbol !== 'string') {
      return NextResponse.json({ error: 'Invalid symbol' }, { status: 400 });
    }

    const now = Date.now();
    const currentBucketTime = getBucketTimestamp(now);
    const bucketKey = getBucketKey(currentBucketTime);

    // Check if we need to save hourly snapshot
    const currentHourTimestamp = getHourTimestamp(now);
    const snapshotKey = getSnapshotKey(currentHourTimestamp);
    const snapshotExists = await redis.exists(snapshotKey);

    if (!snapshotExists) {
      // New hour - save current rankings as hourly snapshot
      const currentRankings = await getCurrentRankings();
      if (currentRankings.length > 0) {
        const snapshotData: Record<string, number> = {};
        currentRankings.forEach((item) => {
          snapshotData[item.symbol] = item.rank;
        });
        await redis.hset(snapshotKey, snapshotData);
        await redis.expire(snapshotKey, SNAPSHOT_TTL_SECONDS);
      }
    }

    // Increment view count for symbol in current bucket
    await redis.hincrby(bucketKey, symbol, 1);

    // Set TTL on bucket (25 hours)
    await redis.expire(bucketKey, BUCKET_TTL_SECONDS);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST ranking error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to record view', message }, { status: 500 });
  }
}

// Helper to get current rankings (for saving as previous)
async function getCurrentRankings(): Promise<RankingItem[]> {
  const now = Date.now();
  const cutoff24h = now - TWENTY_FOUR_HOURS_MS;

  const bucketKeys: string[] = [];
  let bucketTime = getBucketTimestamp(now);
  while (bucketTime > cutoff24h) {
    bucketKeys.push(getBucketKey(bucketTime));
    bucketTime -= FIVE_MINUTES_MS;
  }

  const pipeline = redis.pipeline();
  bucketKeys.forEach((key) => pipeline.hgetall(key));
  const results = await pipeline.exec();

  const viewCounts: Record<string, number> = {};
  results.forEach((result) => {
    if (result && typeof result === 'object') {
      Object.entries(result).forEach(([symbol, count]) => {
        const numCount = typeof count === 'number' ? count : parseInt(count as string, 10);
        if (!isNaN(numCount)) {
          viewCounts[symbol] = (viewCounts[symbol] || 0) + numCount;
        }
      });
    }
  });

  if (Object.keys(viewCounts).length === 0) {
    return [];
  }

  const sorted = Object.entries(viewCounts).sort((a, b) => b[1] - a[1]);
  return sorted.map(([symbol, views], index) => ({
    symbol,
    views,
    rank: index + 1,
    previousRank: null,
    rankChange: null,
  }));
}
