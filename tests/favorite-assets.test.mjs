import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeFavoriteAssets } from '../lib/markets/favorite-assets.ts';

const catalog = [{ symbol: 'NVDA', category: 'US', name: 'NVIDIA', nameKo: '엔비디아', slug: 'nvidia' }, { symbol: 'SMSN', category: 'KR', name: 'Samsung', nameKo: '삼성전자', slug: 'samsung' }];

test('restores old sector favorites by symbol, deduplicates and replaces obsolete route metadata', () => {
  const stored = [{ symbol: 'nvda', market: 'SEMICONDUCTOR', slug: 'old', name: 'old', addedAt: 5 }, { symbol: 'NVDA', market: 'US', addedAt: 9 }, { symbol: 'SMSN', market: 'SEMICONDUCTOR' }, { symbol: 'RETIRED' }, null, 123];
  const original = JSON.stringify(stored);
  const result = normalizeFavoriteAssets(stored, catalog, 100);
  assert.deepEqual(result.map(item => [item.symbol, item.market, item.slug, item.addedAt]), [['NVDA', 'US', 'nvidia', 5], ['SMSN', 'KR', 'samsung', 100]]);
  assert.equal(result[0].nameKo, '엔비디아');
  assert.equal(JSON.stringify(stored), original, 'normalization never mutates backup data');
});

test('malformed storage cannot introduce assets and normalization is idempotent', () => {
  for (const value of [null, {}, 'broken', 0]) assert.deepEqual(normalizeFavoriteAssets(value, catalog), []);
  const value = normalizeFavoriteAssets([{ symbol: 'NVDA', addedAt: NaN }, { symbol: {} }], catalog, 100);
  assert.deepEqual(normalizeFavoriteAssets(value, catalog, 200), value);
});
