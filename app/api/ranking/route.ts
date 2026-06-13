import { put, list } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

const BLOB_NAME = 'ranking-v2.json';
const FIVE_MINUTES_MS = 5 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const TWENTY_FIVE_HOURS_MS = 25 * 60 * 60 * 1000;

// Default popular stocks for cold start
const DEFAULT_POPULAR_STOCKS = [
  'NVDA', 'TSLA', 'AAPL', 'SMSN', 'SP500',
  'MSFT', 'GOOGL', 'AMZN', 'META', 'AMD',
];

// 5-minute bucket: { timestamp: bucketStartTime, counts: { symbol: count } }
interface Bucket {
  timestamp: number;
  counts: Record<string, number>;
}

// Previous ranking snapshot for rank change calculation
interface RankSnapshot {
  ranks: Record<string, number>;
  timestamp: number;
}

interface RankingData {
  buckets: Bucket[];
  previousSnapshot: RankSnapshot | null;
  lastUpdated: number;
}

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

// Load data from Vercel Blob
async function loadData(): Promise<RankingData> {
  try {
    const { blobs } = await list({ prefix: BLOB_NAME });
    if (blobs.length === 0) {
      return { buckets: [], previousSnapshot: null, lastUpdated: 0 };
    }

    const response = await fetch(blobs[0].url);
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.error('Failed to load ranking data:', e);
  }
  return { buckets: [], previousSnapshot: null, lastUpdated: 0 };
}

// Save data to Vercel Blob
async function saveData(data: RankingData): Promise<void> {
  await put(BLOB_NAME, JSON.stringify(data), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

// Calculate rankings from buckets (last 24 hours)
function calculateRankings(data: RankingData): RankingItem[] {
  const now = Date.now();
  const cutoff24h = now - TWENTY_FOUR_HOURS_MS;

  // Sum up views from all buckets within 24 hours
  const viewCounts: Record<string, number> = {};

  data.buckets
    .filter((bucket) => bucket.timestamp > cutoff24h)
    .forEach((bucket) => {
      Object.entries(bucket.counts).forEach(([symbol, count]) => {
        viewCounts[symbol] = (viewCounts[symbol] || 0) + count;
      });
    });

  // If no data, return defaults
  if (Object.keys(viewCounts).length === 0) {
    return DEFAULT_POPULAR_STOCKS.map((symbol, index) => ({
      symbol,
      views: 0,
      rank: index + 1,
      previousRank: null,
      rankChange: null,
    }));
  }

  // Sort by view count (descending)
  const sorted = Object.entries(viewCounts).sort((a, b) => b[1] - a[1]);

  return sorted.map(([symbol, views], index) => {
    const rank = index + 1;
    const previousRank = data.previousSnapshot?.ranks[symbol] ?? null;
    const rankChange = previousRank !== null ? previousRank - rank : null;

    return {
      symbol,
      views,
      rank,
      previousRank,
      rankChange,
    };
  });
}

// GET - Fetch rankings
export async function GET() {
  try {
    const data = await loadData();
    const rankings = calculateRankings(data);

    return NextResponse.json({
      rankings,
      lastUpdated: data.lastUpdated,
    });
  } catch (error) {
    console.error('GET ranking error:', error);
    // Return defaults on error
    return NextResponse.json({
      rankings: DEFAULT_POPULAR_STOCKS.map((symbol, index) => ({
        symbol,
        views: 0,
        rank: index + 1,
        previousRank: null,
        rankChange: null,
      })),
      lastUpdated: 0,
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
    const cutoff25h = now - TWENTY_FIVE_HOURS_MS;

    // Load current data
    const data = await loadData();

    // Clean old buckets (keep 25 hours)
    data.buckets = data.buckets.filter((b) => b.timestamp > cutoff25h);

    // Find or create current bucket
    let currentBucket = data.buckets.find((b) => b.timestamp === currentBucketTime);
    if (!currentBucket) {
      currentBucket = { timestamp: currentBucketTime, counts: {} };
      data.buckets.push(currentBucket);
    }

    // Increment view count for symbol
    currentBucket.counts[symbol] = (currentBucket.counts[symbol] || 0) + 1;

    // Update previous snapshot every 5 minutes (when a new bucket is created)
    // This captures the ranking state before this bucket's data
    const lastSnapshotTime = data.previousSnapshot?.timestamp || 0;
    if (currentBucketTime > lastSnapshotTime) {
      // Calculate rankings WITHOUT the current bucket to get previous state
      const bucketsWithoutCurrent = data.buckets.filter(
        (b) => b.timestamp < currentBucketTime && b.timestamp > now - TWENTY_FOUR_HOURS_MS
      );
      const tempData = { ...data, buckets: bucketsWithoutCurrent };
      const previousRankings = calculateRankings(tempData);

      const ranks: Record<string, number> = {};
      previousRankings.forEach((item) => {
        ranks[item.symbol] = item.rank;
      });
      data.previousSnapshot = { ranks, timestamp: currentBucketTime };
    }

    data.lastUpdated = now;
    await saveData(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST ranking error:', error);
    return NextResponse.json({ error: 'Failed to record view' }, { status: 500 });
  }
}
