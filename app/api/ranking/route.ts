import { createHash, randomUUID } from 'node:crypto';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';
import { stocks } from '@/lib/markets/stocks';
import { aggregateRankings, bucketKeys, BUCKET_MS, buildCategoryRankings, remainingCacheSeconds, RANKING_TTL_MS, usableRankingTimestamp, validateBatch, type RankingData } from '@/lib/ranking/core';
import { PUBLISH_SCRIPT, RECORD_BATCH_SCRIPT, RELEASE_SCRIPT } from '@/lib/ranking/scripts';

const CACHE_KEY = 'ranking:cache:v3';
const LOCK_KEY = 'ranking:refresh:v3';
const active = new Set(stocks.map(stock => stock.symbol));
let redisInstance: Redis | null = null;
function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Ranking storage unavailable');
  return redisInstance ??= new Redis({ url, token, retry: { retries: 1, backoff: () => 200 }, signal: () => AbortSignal.timeout(5000) });
}

let memoryCache: RankingData | null = null;
let inFlight: Promise<RankingData> | null = null;
let retryAfter = 0;

function fallback(now: number): RankingData {
  const recent = memoryCache && usableRankingTimestamp(memoryCache.lastUpdated, now) ? memoryCache : null;
  const rankings = (recent?.rankings ?? []).filter(item => active.has(item.symbol) && item.views > 0);
  return { rankings, categoryRankings: recent?.categoryRankings ?? buildCategoryRankings(rankings, stocks), lastUpdated: recent?.lastUpdated ?? 0, expiresAt: now, degraded: true };
}

async function loadRankings(): Promise<RankingData> {
  const now = Date.now();
  const redis = getRedis();
  const cached = await redis.get<RankingData>(CACHE_KEY);
  if (cached?.rankings && Number.isFinite(cached.expiresAt)) {
    cached.rankings = cached.rankings.filter(item => active.has(item.symbol) && Number.isSafeInteger(item.views) && item.views > 0);
    cached.categoryRankings ??= buildCategoryRankings(cached.rankings, stocks);
    memoryCache = cached;
    if (now < cached.expiresAt) return cached;
  }

  const owner = randomUUID();
  const acquired = await redis.set(LOCK_KEY, owner, { nx: true, ex: 30 });
  if (!acquired) {
    // Do not fan out 288 reads while another instance rebuilds the snapshot.
    retryAfter = now + 5_000;
    return fallback(now);
  }
  try {
    const keys = bucketKeys(now);
    const hour = Math.floor(now / 3_600_000) * 3_600_000;
    const pipeline = redis.pipeline();
    for (const key of keys) pipeline.hgetall(key);
    pipeline.hgetall(`ranking:snapshot:${hour - 3_600_000}`);
    const results = await pipeline.exec();
    const previous = results.pop() as Record<string, unknown> | null;
    const ranked = aggregateRankings(results, previous, active);
    const data: RankingData = {
      rankings: ranked,
      categoryRankings: buildCategoryRankings(ranked, stocks, previous),
      lastUpdated: now,
      expiresAt: now + RANKING_TTL_MS,
    };
    const snapshot = Object.fromEntries([
      ...data.rankings.map(item => [item.symbol, item.rank]),
      ...Object.entries(data.categoryRankings!).flatMap(([category, items]) => items.map(item => [`${category}:${item.symbol}`, item.rank])),
    ]);
    const published = await redis.eval(PUBLISH_SCRIPT, [LOCK_KEY, CACHE_KEY, `ranking:snapshot:${hour}`], [owner, JSON.stringify(data), JSON.stringify(snapshot)]);
    if (published !== 1) {
      retryAfter = Date.now() + 5_000;
      return fallback(Date.now());
    }
    memoryCache = data;
    return data;
  } catch (error) {
    // Lease expiry also recovers the lock if Redis is unreachable during release.
    await redis.eval(RELEASE_SCRIPT, [LOCK_KEY], [owner]).catch(() => undefined);
    throw error;
  }
}

export async function GET() {
  let data: RankingData;
  const now = Date.now();
  if (memoryCache && now < memoryCache.expiresAt) data = memoryCache;
  else if (now < retryAfter) data = fallback(now);
  else {
    inFlight ??= loadRankings().finally(() => { inFlight = null; });
    try {
      data = await inFlight;
    } catch {
      retryAfter = Date.now() + 30_000;
      data = fallback(Date.now());
    }
  }
  const ttl = remainingCacheSeconds(data, Date.now());
  return NextResponse.json(data, { headers: {
    // Cache only the remaining lifetime, never renew an old snapshot for 30m.
    'Cache-Control': `public, max-age=0, s-maxage=${data.degraded ? 5 : ttl}, stale-while-revalidate=60`,
    ...(data.degraded ? { 'Retry-After': '30' } : {}),
  } });
}

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') && request.headers.get('origin') !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
  // Bound parsing work as well as Redis work, including requests without Content-Length.
  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > 8192) return NextResponse.json({ error: 'Request too large' }, { status: 413 });
  let raw: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return NextResponse.json({ error: 'Invalid batch' }, { status: 400 });
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) {
        await reader.cancel();
        return NextResponse.json({ error: 'Request too large' }, { status: 413 });
      }
      chunks.push(value);
    }
    raw = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return NextResponse.json({ error: 'Invalid batch' }, { status: 400 });
  }
  const now = Date.now();
  // Keep old deployed browser tabs working during the rollout. New clients always
  // send stable batch ids; the legacy endpoint cannot provide retry deduplication.
  if (raw && typeof raw === 'object' && 'symbol' in raw && !('events' in raw)) {
    raw = { id: randomUUID(), events: [{ symbol: raw.symbol, timestamp: now }] };
  }
  const batch = validateBatch(raw, active, now);
  if (!batch) return NextResponse.json({ error: 'Invalid batch' }, { status: 400 });

  const bucketMap = new Map<string, number>();
  const keys = [`ranking:batch:${batch.id}`];
  // Hash the platform-provided client address; no raw address is stored in Redis.
  // Deployments behind another proxy must overwrite this header at their trusted edge.
  const address = request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const digest = (value: string) => createHash('sha256').update(value).digest('hex');
  keys.push(`ranking:rate:${digest(address)}:${Math.floor(now / 60_000)}`);
  const counts = new Map<string, { key: number; symbol: string; count: number }>();
  for (const event of batch.events) {
    const bucket = `ranking:bucket:${Math.floor(event.timestamp / BUCKET_MS) * BUCKET_MS}`;
    if (!bucketMap.has(bucket)) { keys.push(bucket); bucketMap.set(bucket, keys.length); }
    const key = bucketMap.get(bucket)!;
    const group = `${key}:${event.symbol}`;
    const item = counts.get(group) ?? { key, symbol: event.symbol, count: 0 };
    item.count++;
    counts.set(group, item);
  }
  try {
    const result = await getRedis().eval(RECORD_BATCH_SCRIPT, keys, [digest(JSON.stringify(batch.events)), batch.events.length, 120, JSON.stringify([...counts.values()])]);
    if (result === -1) return NextResponse.json({ error: 'Too many views' }, { status: 429, headers: { 'Retry-After': '60' } });
    if (result === -2) return NextResponse.json({ error: 'Batch id conflict' }, { status: 409 });
    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Ranking storage unavailable' }, { status: 503, headers: { 'Retry-After': '30', 'Cache-Control': 'no-store' } });
  }
}
