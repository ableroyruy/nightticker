import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as rankingCore from '../lib/ranking/core.ts';
import { normalizeFavoriteAssets } from '../lib/markets/favorite-assets.ts';

// Exercise the real providers' effects and state across storage failures and
// background-tab time advancement, without real network calls or wall-clock waits.
function providerHarness(file, storage, initialTime = 1_800_000_000_000) {
  const cells = []; let cursor = 0; let effects = []; let now = initialTime;
  const timers = new Map(); const listeners = new Map(); let timerId = 0;
  const stocks = [{ symbol: 'NVDA', name: 'NVIDIA', nameKo: '엔비디아', slug: 'nvidia', category: 'US', sector: 'Semiconductors' }];
  const react = {
    createContext: () => ({ Provider: 'provider' }),
    useState(initial) { const i = cursor++; if (!(i in cells)) cells[i] = typeof initial === 'function' ? initial() : initial; return [cells[i], value => { cells[i] = typeof value === 'function' ? value(cells[i]) : value; }]; },
    useRef(initial) { const i = cursor++; return cells[i] ??= { current: initial }; },
    useCallback(fn, deps) { const i = cursor++; if (!cells[i] || deps.some((value, j) => value !== cells[i].deps[j])) cells[i] = { deps, value: fn }; return cells[i].value; },
    useMemo(fn, deps) { const i = cursor++; if (!cells[i] || deps.some((value, j) => value !== cells[i].deps[j])) cells[i] = { deps, value: fn() }; return cells[i].value; },
    useEffect(fn, deps) { const i = cursor++; if (!cells[i] || deps.some((value, j) => value !== cells[i].deps[j])) { cells[i]?.cleanup?.(); effects.push(() => { cells[i] = { deps, cleanup: fn() }; }); } },
  };
  const exports = {};
  class FakeDate extends Date { static now() { return now; } }
  const core = { ...rankingCore, usableRankingTimestamp: (timestamp, time = now) => rankingCore.usableRankingTimestamp(timestamp, time) };
  const context = {
    exports, Date: FakeDate, localStorage: storage, sessionStorage: { getItem: () => null, setItem() {} },
    console: { error() {} },
    document: { addEventListener: (name, fn) => { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn); }, removeEventListener: (name, fn) => listeners.get(name)?.delete(fn) },
    window: { addEventListener() {}, removeEventListener() {} },
    setTimeout: (fn, delay) => { timers.set(++timerId, { fn, delay }); return timerId; }, clearTimeout: id => timers.delete(id),
    fetch: async () => { throw new Error('offline'); }, AbortSignal, crypto: { randomUUID: () => '00000000-0000-0000-0000-000000000000' },
    require(name) {
      if (name === 'react') return react;
      if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }) };
      if (name === '@/lib/markets/stocks') return { stocks };
      if (name === '@/lib/ranking/core') return core;
      if (name === '@/lib/markets/favorite-assets') return { normalizeFavoriteAssets };
      throw new Error(`Unexpected import ${name}`);
    },
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText, context);
  return {
    render(name) { cursor = 0; return exports[name]({ children: null }).props.value; },
    async effects() { const pending = effects; effects = []; pending.forEach(fn => fn()); await Promise.resolve(); await Promise.resolve(); },
    advance(time) { now = time; }, listeners, timers,
  };
}

const now = 1_800_000_000_000;
const cache = { rankings: [null, { symbol: 'DELISTED', views: 999 }, { symbol: 'NVDA', views: 3, rank: 99 }], categoryRankings: { US: [null, { symbol: 'NVDA', previousRank: 2 }] }, lastUpdated: now, expiresAt: now + 1_800_000 };

test('corrupted ranking entries do not block cached initialization or future refresh', async () => {
  const h = providerHarness('lib/context/SearchRankingContext.tsx', { getItem: () => JSON.stringify(cache), setItem() {} });
  h.render('SearchRankingProvider'); await h.effects();
  const state = h.render('SearchRankingProvider');
  assert.equal(state.isLoading, false);
  assert.equal(state.rankings.length, 1);
  assert.equal(state.rankings[0].symbol, 'NVDA');
  assert.equal(state.rankings[0].rank, 1);
  assert.ok([...h.timers.values()].some(timer => timer.delay === 1_800_000));
});

test('background visibility check removes ranking and category data at hard stale limit', async () => {
  const h = providerHarness('lib/context/SearchRankingContext.tsx', { getItem: () => JSON.stringify(cache), setItem() {} });
  h.render('SearchRankingProvider'); await h.effects();
  h.render('SearchRankingProvider'); await h.effects();
  h.advance(now + rankingCore.MAX_RANKING_AGE_MS);
  for (const listener of h.listeners.get('visibilitychange')) listener();
  const state = h.render('SearchRankingProvider');
  assert.equal(state.rankings.length, 0);
  assert.equal(state.getCategoryRankings('US').length, 0);
  assert.equal(state.lastUpdated, 0);
  assert.equal(state.rankingStatus, 'degraded');
});

test('favorites remain visible when backup fails and original storage is never overwritten', async () => {
  const raw = JSON.stringify([{ symbol: 'nvda', market: 'US', name: 'Old', slug: 'old', addedAt: 123 }]);
  const writes = [];
  const h = providerHarness('lib/context/FavoritesContext.tsx', {
    getItem: key => key === 'nightticker_favorites' ? raw : null,
    setItem(key, value) { writes.push({ key, value }); throw new Error('quota exceeded'); },
  });
  h.render('FavoritesProvider'); await h.effects();
  const state = h.render('FavoritesProvider'); await h.effects();
  assert.equal(state.isLoaded, true);
  assert.equal(state.favorites.length, 1);
  assert.equal(state.favorites[0].symbol, 'NVDA');
  assert.deepEqual(writes.map(item => item.key), ['nightticker_favorites_before_normalization_v1']);
  state.removeFavorite('NVDA', 'US');
  h.render('FavoritesProvider'); await h.effects();
  assert.equal(writes.length, 1, 'read-only session must not overwrite original after interactions');
});
