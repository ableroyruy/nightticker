import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as chartFormat from '../lib/chart-format.ts';

// Event-level regression tests. These complement, rather than replace, the required
// real Chrome Profile 6 checks for focus, native IME, layout and assistive technology.
function harness(file, extra = {}, options = {}) {
  const cells = []; let cursor = 0; let changed = false;
  let effects = [];
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in cells)) cells[index] = typeof initial === 'function' ? initial() : initial;
      return [cells[index], value => { const next = typeof value === 'function' ? value(cells[index]) : value; if (cells[index] !== next) { cells[index] = next; changed = true; } }];
    },
    useRef(initial) { const index = cursor++; return cells[index] ??= { current: initial }; },
    useMemo(factory, deps) {
      const index = cursor++;
      if (!cells[index] || deps.some((value, i) => value !== cells[index].deps[i])) cells[index] = { deps, value: factory() };
      return cells[index].value;
    },
    useId() { return `test-${cursor++}`; },
    useEffect(effect, deps) {
      const index = cursor++;
      if (!cells[index] || deps.some((value, i) => value !== cells[index][i])) { effects.push(effect); cells[index] = deps; }
    },
  };
  const jsx = (type, props) => ({ type, props });
  const exports = {};
  const navigation = [];
  const context = {
    exports, console,
    window: options.window ?? { location: { assign: value => navigation.push(value), search: '?category=ETF&source=share', hash: '#ranking' } },
    document: options.document ?? { cookie: '', addEventListener() {}, removeEventListener() {} },
    require(name) {
      if (name in extra) return extra[name];
      if (name === '@/lib/chart-format') return chartFormat;
      if (name === 'react') return react;
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
      if (name === 'next-intl') return { useLocale: () => options.locale ?? 'ko', useTranslations: () => key => key };
      if (name === 'next/navigation') return { useRouter: () => ({ push: value => navigation.push(value) }), usePathname: () => options.pathname ?? '/ko/popular' };
      if (name === '@/lib/utils') return { cn: (...values) => values.filter(value => typeof value === 'string').join(' ') };
      if (name === 'lightweight-charts') return {};
      return new Proxy({}, { get: (_, key) => key === '__esModule' ? true : key });
    },
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText, context, { filename: file });
  return {
    exports, navigation, context,
    render(name, props = {}) {
      let tree; let iterations = 0;
      do { changed = false; cursor = 0; effects = []; tree = exports[name](props); } while (changed && ++iterations < 10);
      return tree;
    },
    effects() { const pending = effects; effects = []; pending.forEach(effect => effect()); },
  };
}
function nodes(tree, predicate) {
  const found = [];
  function visit(node) {
    if (!node || typeof node !== 'object') return;
    if (predicate(node)) found.push(node);
    const children = node.props?.children;
    if (Array.isArray(children)) children.flat(Infinity).forEach(visit);
    else visit(children);
  }
  visit(tree); return found;
}
const byRole = (tree, role) => nodes(tree, node => node.props?.role === role);
const key = (value, extra = {}) => ({ key: value, nativeEvent: { isComposing: false }, keyCode: 0, preventDefault() { this.prevented = true; }, ...extra });
const stocks = Array.from({ length: 30 }, (_, i) => ({ symbol: `T${i}`, name: `Test ${i}`, nameKo: `종목 ${i}`, slug: `test-${i}`, category: 'US' }));
const getTopRankings = () => stocks.map(stock => ({ symbol: stock.symbol, views: 1 }));

test('search ignores composing Enter, scrolls active results and retains focus on Escape', () => {
  const h = harness('components/market/StockSearch.tsx', {
    '@/lib/markets/stocks': { stocks }, '@/lib/context/SearchRankingContext': { useSearchRanking: () => ({ getTopRankings }) },
  });
  let tree = h.render('StockSearch');
  byRole(tree, 'combobox')[0].props.onFocus();
  tree = h.render('StockSearch');
  let input = byRole(tree, 'combobox')[0];
  assert.equal(input.props['aria-expanded'], true);
  input.props.onCompositionStart();
  input.props.onKeyDown(key('Enter'));
  assert.equal(h.navigation.length, 0);
  input.props.onCompositionEnd();
  input.props.onKeyDown(key('Enter', { nativeEvent: { isComposing: true } }));
  input.props.onKeyDown(key('Enter', { keyCode: 229 }));
  assert.equal(h.navigation.length, 0);
  for (let i = 0; i < 25; i++) {
    input.props.onKeyDown(key('ArrowDown'));
    tree = h.render('StockSearch'); input = byRole(tree, 'combobox')[0];
  }
  const selected = byRole(tree, 'option').find(node => node.props['aria-selected']);
  assert.equal(selected.props.id, input.props['aria-activedescendant']);
  let scrolled = false;
  selected.props.ref({ scrollIntoView: options => { assert.equal(options.block, 'nearest'); scrolled = true; } });
  h.effects();
  assert.ok(scrolled, 'offscreen active result is requested into view');
  input.props.onKeyDown(key('Escape'));
  tree = h.render('StockSearch');
  assert.equal(byRole(tree, 'combobox')[0].props['aria-expanded'], false);
  assert.equal(byRole(tree, 'combobox')[0].props.onBlur, undefined, 'no delayed blur timer steals focus');
  byRole(tree, 'combobox')[0].props.onKeyDown(key('ArrowDown'));
  tree = h.render('StockSearch');
  byRole(tree, 'combobox')[0].props.onKeyDown(key('Enter'));
  assert.deepEqual(h.navigation, ['/ko/stock/test-0']);
});

test('search Tab is not trapped and zero results never create a negative active index', () => {
  const h = harness('components/market/StockSearch.tsx', { '@/lib/markets/stocks': { stocks }, '@/lib/context/SearchRankingContext': { useSearchRanking: () => ({ getTopRankings }) } });
  let tree = h.render('StockSearch');
  byRole(tree, 'combobox')[0].props.onChange({ target: { value: 'does-not-exist' } });
  tree = h.render('StockSearch');
  const input = byRole(tree, 'combobox')[0];
  input.props.onKeyDown(key('ArrowUp'));
  input.props.onKeyDown(key('Enter'));
  assert.equal(h.navigation.length, 0);
  assert.equal(input.props['aria-activedescendant'], undefined);
  const tab = key('Tab'); input.props.onKeyDown(tab);
  assert.equal(tab.prevented, undefined);
  tree = h.render('StockSearch');
  assert.equal(byRole(tree, 'combobox')[0].props['aria-expanded'], false);
});

test('locale switches preserve category/query/hash and do not mistake /korea for /ko', () => {
  const h = harness('components/layout/LanguageSwitcher.tsx');
  const destination = h.exports.localeDestination;
  assert.equal(destination('/ko/popular', 'es', '?category=ETF&source=share', '#ranking'), '/es/popular?category=ETF&source=share#ranking');
  assert.equal(destination('/es/popular', 'en', '?category=KR'), '/popular?category=KR');
  assert.equal(destination('/korea-market-hours', 'ja'), '/ja/korea-market-hours');
  assert.equal(destination('/ko', 'en'), '/');
  assert.equal(destination('/', 'pt'), '/pt');
  const tree = h.render('LanguageSwitcher');
  const trigger = nodes(tree, node => node.props?.['aria-expanded'] === false)[0];
  trigger.props.onClick();
  const opened = h.render('LanguageSwitcher');
  const spanish = nodes(opened, node => node.type === 'button' && node.props.lang === 'es')[0];
  spanish.props.onClick();
  assert.equal(h.navigation[0], '/es/popular?category=ETF&source=share#ranking');
});

test('favorite toggle exposes localized pressed state and never activates the card', () => {
  for (const locale of ['en', 'ko', 'ja', 'zh', 'pt', 'es']) {
    let toggled = 0; let prevented = 0; let stopped = 0;
    const h = harness('components/ui/favorite-button.tsx', {}, { locale });
    const tree = h.render('FavoriteButton', { isFavorite: true, onToggle: () => toggled++ });
    assert.equal(tree.props['aria-pressed'], true);
    assert.ok(tree.props['aria-label']);
    tree.props.onClick({ preventDefault: () => prevented++, stopPropagation: () => stopped++ });
    assert.equal(toggled, 1); assert.equal(prevented, 1); assert.equal(stopped, 1);
  }
});

test('chart distinguishes localized loading, empty, failure, delayed data and recovery', () => {
  const texts = new Set();
  for (const locale of ['en', 'ko', 'ja', 'zh', 'pt', 'es']) {
    const h = harness('components/market/MiniChart.tsx', {}, { locale });
    const loading = h.render('MiniChart', { candles: [], loading: true });
    assert.equal(loading.props['aria-busy'], true);
    const empty = h.render('MiniChart', { candles: [], error: 'No chart data' });
    const failed = h.render('MiniChart', { candles: [], error: 'Chart data temporarily unavailable' });
    assert.notEqual(empty.props.children, failed.props.children);
    texts.add(empty.props.children);
    const candles = [{ time: 1, open: 1, high: 2, low: 1, close: 2, volume: 1 }];
    const delayed = h.render('MiniChart', { candles, error: 'Chart data is delayed' });
    assert.equal(byRole(delayed, 'status').length, 1);
    const recovered = h.render('MiniChart', { candles });
    assert.equal(byRole(recovered, 'status').length, 0);
    assert.ok(nodes(recovered, node => node.type === 'span' && node.props.className === 'sr-only').length);
  }
  assert.equal(texts.size, 6);
});


test('empty rankings offer exploration without presenting fabricated rank numbers', () => {
  const h = harness('components/market/StockSearch.tsx', { '@/lib/markets/stocks': { stocks }, '@/lib/context/SearchRankingContext': { useSearchRanking: () => ({ getTopRankings: () => [] }) } });
  let tree = h.render('StockSearch');
  byRole(tree, 'combobox')[0].props.onFocus();
  tree = h.render('StockSearch');
  assert.equal(byRole(tree, 'option').length, 6);
  assert.match(JSON.stringify(tree), /종목 둘러보기/);
  assert.ok(!nodes(tree, node => node.props?.children === 'popular').length);
  assert.ok(!nodes(tree, node => node.type === 'span' && typeof node.props.children === 'number').length);
});

test('mobile navigation exposes state, focuses a link, and Escape returns focus', () => {
  let firstFocused = 0; let triggerFocused = 0;
  const h = harness('components/layout/Header.tsx', { '@/lib/markets/stocks': {} }, { window: { matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) } });
  let tree = h.render('Header');
  const trigger = nodes(tree, node => node.props?.['aria-controls'] && node.props?.['aria-expanded'] === false)[0];
  trigger.props.ref.current = { focus: () => triggerFocused++, contains: target => target === 'trigger' };
  trigger.props.onClick();
  tree = h.render('Header');
  const nav = nodes(tree, node => node.type === 'nav' && node.props.id)[0];
  nav.props.ref.current = { querySelector: () => ({ focus: () => firstFocused++ }) };
  h.effects();
  assert.equal(firstFocused, 1);
  assert.ok(nav.props.className.includes('overflow-y-auto'));
  const escape = key('Escape'); nav.props.onKeyDown(escape);
  assert.equal(triggerFocused, 1);
  tree = h.render('Header');
  assert.equal(nodes(tree, node => node.type === 'nav' && node.props.id).length, 0);
  assert.equal(nodes(tree, node => node.props?.['aria-controls'] === trigger.props['aria-controls'])[0].props['aria-expanded'], false);
});

test('chart interval captions match the API five-minute candles and six-hour window', () => {
  const api = fs.readFileSync('app/api/market/candles/route.ts', 'utf8');
  assert.match(api, /interval: '5m'/);
  assert.match(api, /startTime: now - 6 \* 3600000/);
  const expected = {
    ko: ['5분 · 6시간', '5분 캔들 · 최근 6시간'],
    en: ['5 min · 6 hours', '5-minute candles · Last 6 hours'],
    ja: ['5分足 · 6時間', '5分足 · 過去6時間'],
    zh: ['5分钟 · 6小时', '5分钟K线 · 最近6小时'],
    pt: ['5 min · 6 horas', 'Velas de 5 min · Últimas 6 horas'],
    es: ['5 min · 6 horas', 'Velas de 5 min · Últimas 6 horas'],
  };
  const candles = [{ time: 1, open: 1, high: 2, low: 1, close: 2, volume: 1 }];
  for (const [locale, captions] of Object.entries(expected)) {
    const h = harness('components/market/MiniChart.tsx', {}, { locale });
    for (const [index, variant] of ['compact', 'detail'].entries()) {
      const tree = h.render('MiniChart', { candles, variant, autoResize: true, height: 48 });
      const caption = nodes(tree, node => node.type === 'figcaption')[0];
      assert.ok(JSON.stringify(caption).includes(captions[index]));
      assert.ok(tree.props['aria-label'].includes(locale === 'en' ? 'five' : locale === 'pt' || locale === 'es' ? 'cinco' : '5'));
      assert.equal(nodes(tree, node => node.props.ref && node.props['aria-hidden'] === 'true')[0].props.style.height, 48);
    }
  }
});
