import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { measuredRankings, rankingMovement, formatRankingUpdatedAt } from '../lib/ranking/presentation.ts';

const locales = ['en', 'ko', 'ja', 'zh', 'pt', 'es'];
test('unavailable previous rank and unchanged rank have distinct visible labels in all six languages', () => {
  for (const locale of locales) {
    const unknown = rankingMovement(null, locale);
    const flat = rankingMovement(0, locale);
    assert.notEqual(unknown.text, flat.text);
    assert.equal(unknown.direction, null);
    assert.equal(flat.direction, 0);
    assert.notEqual(unknown.text, '—');
    assert.notEqual(flat.text, '—');
  }
  assert.deepEqual(rankingMovement(3, 'ko'), { text: '3', direction: 1 });
  assert.deepEqual(rankingMovement(-3, 'ko'), { text: '3', direction: -1 });
  assert.equal(rankingMovement(NaN, 'en').direction, null);
});
test('updated labels include date, so yesterday with the same clock time cannot look current', () => {
  const timestamp = Date.UTC(2026, 10, 1, 3, 20);
  for (const locale of locales) {
    const current = formatRankingUpdatedAt(timestamp, locale);
    assert.match(current, /2026/);
    assert.notEqual(current, formatRankingUpdatedAt(timestamp - 86400000, locale));
  }
  for (const invalid of [0, -1, Infinity, NaN, 1e20]) assert.equal(formatRankingUpdatedAt(invalid, 'en'), '—');
});
test('recommended zero-view items are never measured ranks', () => {
  const items = [
    { symbol: 'DEFAULT', views: 0, rank: 1 },
    { symbol: 'MEASURED', views: 4, rank: 2 },
    { symbol: 'BAD', views: NaN, rank: 3 },
    { symbol: 'BAD_RANK', views: 2, rank: 0 },
  ];
  assert.deepEqual(measuredRankings(items).map(item => item.symbol), ['MEASURED']);
  assert.deepEqual(measuredRankings(items, 0), []);
});
test('both live ticker components render no manufactured rank when real views are unavailable', () => {
  const require = createRequire(import.meta.url);
  const source = fs.readFileSync('components/market/TrendingTicker.tsx', 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const stock = { symbol: 'AAPL', hyperliquidSymbol: 'xyz:AAPL', slug: 'apple', name: 'Apple', category: 'US' };
  let rankings = [{ symbol: 'AAPL', views: 0, rank: 1 }];
  const context = { exports: {}, require: name => {
    if (name === 'react/jsx-runtime') return require(name);
    if (name === 'react') return { useEffect: () => {}, useState: () => [0, () => {}], useMemo: fn => fn() };
    if (name === 'next-intl') return { useLocale: () => 'en', useTranslations: () => key => key };
    if (name === 'next/link') return { default: 'a' };
    if (name === 'framer-motion') return { motion: { div: 'div' }, AnimatePresence: 'div', useReducedMotion: () => true };
    if (name.includes('SearchRankingContext')) return { useSearchRanking: () => ({ getTopRankings: () => rankings }) };
    if (name.includes('useHyperliquidTicker')) return { useHyperliquidTicker: () => ({ tickers: {} }) };
    if (name.includes('markets/stocks')) return { stocks: [stock], getStockBySymbol: symbol => symbol === stock.symbol ? stock : undefined };
    if (name.includes('ranking/presentation')) return { measuredRankings };
    if (name.includes('format-market')) return { getLocalizedAssetName: value => value.name };
    if (name.includes('price-change')) return { PriceChange: () => null };
    if (name.includes('utils')) return { cn: (...values) => values.filter(Boolean).join(' ') };
    throw Error(name);
  } };
  vm.runInNewContext(code, context);
  assert.equal(context.exports.TrendingTicker({}), null);
  assert.equal(context.exports.TrendingMarquee({}), null);
  rankings = [{ symbol: 'AAPL', views: 5, rank: 1 }];
  assert.notEqual(context.exports.TrendingTicker({}), null);
  assert.notEqual(context.exports.TrendingMarquee({}), null);
});
