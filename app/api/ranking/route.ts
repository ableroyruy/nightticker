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
const SNAPSHOT_TTL_SECONDS = 25 * 60 * 60; // 25 hours TTL
const CACHE_TTL_SECONDS = 5 * 60; // 5 minutes cache
const CACHE_KEY = 'ranking:cache';

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

// ===== In-memory cache for GET (reduces Redis reads) =====
let memoryCache: { data: { rankings: RankingItem[]; lastUpdated: number } | null; expires: number } = {
  data: null,
  expires: 0,
};
const MEMORY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes memory cache

// ===== In-memory write buffer (reduces Redis writes) =====
const writeBuffer: Map<string, number> = new Map();
let lastFlushTime = Date.now();
const FLUSH_INTERVAL_MS = 5 * 60 * 1000; // Flush every 5 minutes
const FLUSH_THRESHOLD = 100; // Or when buffer has 100+ items

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

// GET - Fetch rankings (with server-side cache)
export async function GET() {
  try {
    const now = Date.now();

    // 1. Check memory cache first (0 Redis calls)
    if (memoryCache.data && now < memoryCache.expires) {
      return NextResponse.json(memoryCache.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      });
    }

    // 2. Check Redis cache (1 Redis call)
    const cached = await redis.get(CACHE_KEY) as { rankings: RankingItem[]; lastUpdated: number } | null;
    if (cached) {
      // Update memory cache
      memoryCache = { data: cached, expires: now + MEMORY_CACHE_TTL_MS };
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      });
    }

    // 3. Cache miss - aggregate from buckets
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

    // If no data, return defaults (but don't cache defaults)
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

    const response = { rankings, lastUpdated: now };

    // Cache the result for 5 minutes in Redis
    await redis.set(CACHE_KEY, JSON.stringify(response), { ex: CACHE_TTL_SECONDS });

    // Also update memory cache
    memoryCache = { data: response, expires: now + MEMORY_CACHE_TTL_MS };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
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

// Flush write buffer to Redis
async function flushWriteBuffer(): Promise<void> {
  if (writeBuffer.size === 0) return;

  const now = Date.now();
  const currentBucketTime = getBucketTimestamp(now);
  const bucketKey = getBucketKey(currentBucketTime);

  // Batch all writes into a single pipeline
  const pipeline = redis.pipeline();
  for (const [symbol, count] of writeBuffer) {
    pipeline.hincrby(bucketKey, symbol, count);
  }
  pipeline.expire(bucketKey, BUCKET_TTL_SECONDS);
  await pipeline.exec();

  // Clear buffer and update flush time
  writeBuffer.clear();
  lastFlushTime = now;
}

// POST - Record a page view (with write buffering)
export async function POST(request: NextRequest) {
  try {
    const { symbol } = await request.json();

    if (!symbol || typeof symbol !== 'string') {
      return NextResponse.json({ error: 'Invalid symbol' }, { status: 400 });
    }

    const now = Date.now();

    // Add to write buffer (no Redis call)
    writeBuffer.set(symbol, (writeBuffer.get(symbol) || 0) + 1);

    // Check if we should flush the buffer
    const shouldFlush =
      writeBuffer.size >= FLUSH_THRESHOLD ||
      now - lastFlushTime >= FLUSH_INTERVAL_MS;

    if (shouldFlush) {
      // Flush buffer to Redis (batched writes)
      await flushWriteBuffer();

      // Check if we need to save hourly snapshot (only on flush)
      const currentHourTimestamp = getHourTimestamp(now);
      const snapshotKey = getSnapshotKey(currentHourTimestamp);
      const snapshotExists = await redis.exists(snapshotKey);

      if (!snapshotExists) {
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
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST ranking error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to record view', message }, { status: 500 });
  }
}

// Helper to get current rankings from cache (for saving as snapshot)
async function getCurrentRankings(): Promise<RankingItem[]> {
  // Try cache first (1 Redis call instead of 288)
  const cached = await redis.get(CACHE_KEY) as { rankings: RankingItem[]; lastUpdated: number } | null;
  if (cached && cached.rankings) {
    return cached.rankings;
  }
  return [];
}
