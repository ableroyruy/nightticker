import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregateRankings, bucketKeys, BUCKET_MS, defaultRankings, MAX_EVENT_AGE_MS, remainingCacheSeconds, validateBatch } from '../lib/ranking/core.ts';

const now = 1_800_000_000_000;
const active = new Set(['NVDA', 'TSLA', 'AAPL']);
const batch = (events = [{ symbol: 'NVDA', timestamp: now }]) => ({ id: 'b068e5c1-5b8a-4911-9270-111111111111', events });

test('accepts bounded active symbols and preserves event occurrence timestamps', () => {
  assert.deepEqual(validateBatch(batch([{ symbol: 'NVDA', timestamp: now - BUCKET_MS }]), active, now), batch([{ symbol: 'NVDA', timestamp: now - BUCKET_MS }]));
  assert.equal(validateBatch(batch([{ symbol: 'DELISTED', timestamp: now }]), active, now), null);
  assert.equal(validateBatch(batch([{ symbol: 'NVDA', timestamp: now - MAX_EVENT_AGE_MS - 1 }]), active, now), null);
  assert.equal(validateBatch(batch([{ symbol: 'NVDA', timestamp: now + 30_001 }]), active, now), null);
  assert.equal(validateBatch(batch(Array(21).fill({ symbol: 'NVDA', timestamp: now })), active, now), null);
  assert.equal(validateBatch({ id: '../arbitrary/key', events: batch().events }, active, now), null);
});

test('24h window remains bounded to 288 five-minute buckets at boundaries', () => {
  for (const offset of [0, 1, BUCKET_MS - 1]) {
    const keys = bucketKeys(now + offset);
    assert.equal(keys.length, 288);
    assert.equal(new Set(keys).size, 288);
    assert.equal(keys[0], `ranking:bucket:${Math.floor((now + offset) / BUCKET_MS) * BUCKET_MS}`);
  }
});

test('aggregation filters retired/untrusted symbols and invalid counts; ties are stable', () => {
  const result = aggregateRankings([{ NVDA: 3, TSLA: '2', AAPL: 2, RETIRED: 1000 }, { NVDA: 1, AAPL: -5 }, { TSLA: 'bad' }], { NVDA: 3, AAPL: 1 }, active);
  assert.deepEqual(result.map(({ symbol, views, rank, previousRank, rankChange }) => ({ symbol, views, rank, previousRank, rankChange })), [
    { symbol: 'NVDA', views: 4, rank: 1, previousRank: 3, rankChange: 2 },
    { symbol: 'AAPL', views: 2, rank: 2, previousRank: 1, rankChange: -1 },
    { symbol: 'TSLA', views: 2, rank: 3, previousRank: null, rankChange: null },
  ]);
});

test('all cache layers retain the snapshot expiry rather than restarting its TTL', () => {
  const value = { rankings: [], lastUpdated: now, expiresAt: now + 1_800_000 };
  assert.equal(remainingCacheSeconds(value, now + 1_799_500), 0);
  assert.equal(remainingCacheSeconds(value, now + 900_000), 900);
  assert.equal(remainingCacheSeconds(value, now + 1_900_000), 0);
  assert.deepEqual(defaultRankings(active).map(item => item.symbol), ['NVDA', 'TSLA', 'AAPL']);
});
