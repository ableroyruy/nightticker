export const RANKING_TTL_MS = 30 * 60 * 1000;
export const MAX_RANKING_AGE_MS = 24 * 60 * 60 * 1000;
export function usableRankingTimestamp(timestamp: number, now = Date.now()): boolean {
  return Number.isFinite(timestamp) && timestamp > 0 && timestamp <= now && now - timestamp < MAX_RANKING_AGE_MS;
}
export const BUCKET_MS = 5 * 60 * 1000;
export const MAX_BATCH_SIZE = 20;
export const MAX_EVENT_AGE_MS = 60 * 60 * 1000;
export const DEFAULT_SYMBOLS = ['NVDA', 'TSLA', 'AAPL', 'SMSN', 'SP500', 'MSFT', 'GOOGL', 'AMZN', 'META', 'AMD'];

export interface RankingItem {
  symbol: string;
  views: number;
  rank: number;
  previousRank: number | null;
  rankChange: number | null;
}
export interface RankingData {
  categoryRankings?: CategoryRankings;
  rankings: RankingItem[];
  lastUpdated: number;
  expiresAt: number;
  degraded?: boolean;
}
export interface ViewEvent { symbol: string; timestamp: number }
export interface ViewBatch { id: string; events: ViewEvent[] }

export function validateBatch(value: unknown, active: Set<string>, now: number): ViewBatch | null {
  if (!value || typeof value !== 'object') return null;
  const batch = value as Partial<ViewBatch>;
  if (typeof batch.id !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(batch.id)) return null;
  if (!Array.isArray(batch.events) || batch.events.length < 1 || batch.events.length > MAX_BATCH_SIZE) return null;
  for (const event of batch.events) {
    if (!event || typeof event.symbol !== 'string' || !active.has(event.symbol) ||
      !Number.isSafeInteger(event.timestamp) || event.timestamp < now - MAX_EVENT_AGE_MS || event.timestamp > now + 30_000) return null;
  }
  return { id: batch.id, events: batch.events.map(({ symbol, timestamp }) => ({ symbol, timestamp })) };
}

export function bucketKeys(now: number): string[] {
  const keys: string[] = [];
  const start = Math.floor(now / BUCKET_MS) * BUCKET_MS;
  // Preserve the existing 5-minute approximation of the rolling 24h window.
  for (let time = start; time > now - 24 * 60 * 60 * 1000; time -= BUCKET_MS) keys.push(`ranking:bucket:${time}`);
  return keys;
}

export function aggregateRankings(buckets: unknown[], previous: Record<string, unknown> | null, active: Set<string>): RankingItem[] {
  const counts = new Map<string, number>();
  for (const bucket of buckets) {
    if (!bucket || typeof bucket !== 'object' || Array.isArray(bucket)) continue;
    for (const [symbol, raw] of Object.entries(bucket)) {
      const count = Number(raw);
      if (active.has(symbol) && Number.isSafeInteger(count) && count > 0) counts.set(symbol, (counts.get(symbol) || 0) + count);
    }
  }
  return [...counts].sort(([a, av], [b, bv]) => bv - av || a.localeCompare(b)).map(([symbol, views], index) => {
    const prior = Number(previous?.[symbol]);
    const previousRank = Number.isSafeInteger(prior) && prior > 0 ? prior : null;
    return { symbol, views, rank: index + 1, previousRank, rankChange: previousRank === null ? null : previousRank - index - 1 };
  });
}

export function defaultRankings(active: Set<string>): RankingItem[] {
  return DEFAULT_SYMBOLS.filter(symbol => active.has(symbol)).map((symbol, index) => ({
    symbol, views: 0, rank: index + 1, previousRank: null, rankChange: null,
  }));
}

export function remainingCacheSeconds(data: RankingData, now: number): number {
  return Math.max(0, Math.floor((data.expiresAt - now) / 1000));
}

export const RANKING_CATEGORIES = ['US', 'KR', 'JP', 'INDEX', 'ETF', 'COMMODITY', 'FX', 'SPECIAL', 'SEMICONDUCTOR'] as const;
export type RankingCategory = typeof RANKING_CATEGORIES[number];
export type CategoryRankings = Record<RankingCategory, RankingItem[]>;
interface CatalogEntry { symbol: string; category: string; sector?: string }

/** One recorded view contributes to overall and applicable category rankings.
 * Category positions are calculated within that group, never copied from overall.
 */
export function buildCategoryRankings(rankings: RankingItem[], catalog: readonly CatalogEntry[], previous: Record<string, unknown> | null = null): CategoryRankings {
  const bySymbol = new Map(catalog.map(stock => [stock.symbol, stock]));
  const ordered = rankings.filter(item => bySymbol.has(item.symbol) && Number.isSafeInteger(item.views) && item.views > 0)
    .sort((a, b) => b.views - a.views || a.symbol.localeCompare(b.symbol));
  return Object.fromEntries(RANKING_CATEGORIES.map(category => [category, ordered.filter(item => {
    const stock = bySymbol.get(item.symbol)!;
    return category === 'SEMICONDUCTOR' ? stock.sector === 'Semiconductors' : stock.category === category;
  }).map((item, index) => {
    const prior = Number(previous?.[`${category}:${item.symbol}`]);
    const previousRank = Number.isSafeInteger(prior) && prior > 0 ? prior : null;
    return { ...item, rank: index + 1, previousRank, rankChange: previousRank === null ? null : previousRank - index - 1 };
  })])) as CategoryRankings;
}
