import test from 'node:test';
import assert from 'node:assert/strict';
import { formatMarketPrice, formatMarketChange, marketDirection, getLocalizedAssetName, toMarketAsset } from '../lib/format-market.ts';

test('price precision preserves FX and small quotes consistently', () => {
  assert.equal(formatMarketPrice(1.08573, false), '1.08573');
  assert.equal(formatMarketPrice(0.00012345), '$0.00012345');
  assert.equal(formatMarketPrice(1234.5678), '$1,234.5678');
  assert.equal(formatMarketPrice(100), '$100.00');
  assert.equal(formatMarketPrice(0), '$0.00');
  assert.equal(formatMarketPrice(null), '—');
  assert.equal(formatMarketPrice(Infinity), '—');
});
test('changes use sign before currency and never show negative rounded zero', () => {
  assert.equal(formatMarketChange(-12.5, 'amount'), '-$12.50');
  assert.equal(formatMarketChange(12.5, 'amount'), '+$12.50');
  assert.equal(formatMarketChange(0, 'amount'), '$0.00');
  assert.equal(formatMarketChange(-0, 'amount'), '$0.00');
  assert.equal(formatMarketChange(-0.000000001, 'amount'), '$0.00');
  assert.equal(formatMarketChange(-0.004, 'percent'), '0.00%');
  assert.equal(marketDirection(-0.004), 0);
  assert.equal(formatMarketChange(-0.005, 'percent'), '-0.01%');
  assert.equal(formatMarketChange(0.00001, 'amount', false), '+0.00001');
  assert.equal(formatMarketChange(NaN), '—');
});
test('canonical mapping carries every language through list and favorites views', () => {
  const stock = { symbol: 'TEST', name: 'English', nameKo: '한국어', nameJa: '日本語', nameZh: '中文', namePt: 'Português', nameEs: 'Español', slug: 'test', category: 'ETF', hyperliquidSymbol: 'xyz:TEST' };
  const asset = toMarketAsset(stock, { price: 1, prevDayPx: null, change24h: null, changePercent24h: null });
  for (const locale of ['ko', 'ja', 'zh', 'pt', 'es']) assert.equal(getLocalizedAssetName(asset, locale), stock[`name${locale[0].toUpperCase()}${locale.slice(1)}`]);
  assert.equal(getLocalizedAssetName(asset, 'unknown'), 'English');
  assert.equal(getLocalizedAssetName({ name: 'Fallback', nameJa: '' }, 'ja'), 'Fallback');
  assert.equal(asset.market, 'ETF');
  assert.equal(asset.changePercent24h, null);
  assert.equal(toMarketAsset(stock).price, null);
});
