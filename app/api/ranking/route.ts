import { put, head, list } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

const BLOB_NAME = 'ranking-data.json';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

// Default popular stocks for cold start
const DEFAULT_POPULAR_STOCKS = [
  'NVDA', 'TSLA', 'AAPL', 'SMSN', 'SP500',
  'MSFT', 'GOOGL', 'AMZN', 'META', 'AMD',
];

interface ViewRecord {
  symbol: string;
  timestamp: number;
}

interface RankSnapshot {
  ranks: Record<string, number>;
  timestamp: number;
}

interface RankingData {
  views: ViewRecord[];
  snapshot24h: RankSnapshot | null;
  lastUpdated: number;
}

interface RankingItem {
  symbol: string;
  score: number;
  rank: number;
  previousRank: number | null;
  rankChange: number | null;
}

// Load data from Vercel Blob
async function loadData(): Promise<RankingData> {
  try {
    const { blobs } = await list({ prefix: BLOB_NAME });
    if (blobs.length === 0) {
      return { views: [], snapshot24h: null, lastUpdated: 0 };
    }

    const response = await fetch(blobs[0].url);
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.error('Failed to load ranking data:', e);
  }
  return { views: [], snapshot24h: null, lastUpdated: 0 };
}

// Save data to Vercel Blob
async function saveData(data: RankingData): Promise<void> {
  try {
    await put(BLOB_NAME, JSON.stringify(data), {
      access: 'public',
      addRandomSuffix: false,
    });
  } catch (e) {
    console.error('Failed to save ranking data:', e);
  }
}

// Calculate rankings from views
function calculateRankings(data: RankingData): RankingItem[] {
  const now = Date.now();
  const cutoff24h = now - TWENTY_FOUR_HOURS_MS;

  // Count views with time decay
  const scores: Record<string, number> = {};

  data.views
    .filter((v) => v.timestamp > cutoff24h)
    .forEach((v) => {
      const hoursAgo = (now - v.timestamp) / ONE_HOUR_MS;
      const weight = Math.pow(0.5, hoursAgo / 6); // Half-life = 6 hours
      scores[v.symbol] = (scores[v.symbol] || 0) + weight;
    });

  // If no data, return defaults
  if (Object.keys(scores).length === 0) {
    // Use snapshot if available
    if (data.snapshot24h && Object.keys(data.snapshot24h.ranks).length > 0) {
      return Object.entries(data.snapshot24h.ranks)
        .sort((a, b) => a[1] - b[1])
        .map(([symbol, rank]) => ({
          symbol,
          score: 100 - rank,
          rank,
          previousRank: null,
          rankChange: null,
        }));
    }
    // Default stocks
    return DEFAULT_POPULAR_STOCKS.map((symbol, index) => ({
      symbol,
      score: DEFAULT_POPULAR_STOCKS.length - index,
      rank: index + 1,
      previousRank: null,
      rankChange: null,
    }));
  }

  // Sort and build rankings
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  return sorted.map(([symbol, score], index) => {
    const rank = index + 1;
    const previousRank = data.snapshot24h?.ranks[symbol] ?? null;
    const rankChange = previousRank !== null ? previousRank - rank : null;

    return {
      symbol,
      score: Math.round(score * 100) / 100,
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
        score: DEFAULT_POPULAR_STOCKS.length - index,
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
    const cutoff72h = now - (72 * ONE_HOUR_MS);

    // Load current data
    const data = await loadData();

    // Add new view
    data.views.push({ symbol, timestamp: now });

    // Clean old views (keep 72 hours)
    data.views = data.views.filter((v) => v.timestamp > cutoff72h);

    // Update 24h snapshot if needed
    if (!data.snapshot24h || now - data.snapshot24h.timestamp > TWENTY_FOUR_HOURS_MS) {
      const rankings = calculateRankings(data);
      const ranks: Record<string, number> = {};
      rankings.forEach((item) => {
        ranks[item.symbol] = item.rank;
      });
      data.snapshot24h = { ranks, timestamp: now };
    }

    data.lastUpdated = now;

    // Save (debounced - only save every 10 seconds to reduce writes)
    const shouldSave = now - data.lastUpdated > 10000 || data.views.length % 10 === 0;
    if (shouldSave) {
      await saveData(data);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST ranking error:', error);
    return NextResponse.json({ error: 'Failed to record view' }, { status: 500 });
  }
}
