import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function loadModule(path, dependencies = {}) {
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const context = {
    exports: {}, process: { env: {} },
    require: name => {
      if (name in dependencies) return dependencies[name];
      if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }), Fragment: 'fragment' };
      // Client components are deliberately not executed by these server-HTML tests.
      return new Proxy({}, { get: (_, key) => key === '__esModule' ? true : key });
    },
  };
  vm.runInNewContext(code, context, { filename: path });
  return context.exports;
}
const catalog = loadModule('lib/markets/stocks.ts');
const site = loadModule('lib/seo/site.ts');
const productInfo = loadModule('lib/markets/product-info.ts', {
  './product-facts.json': { default: JSON.parse(fs.readFileSync('lib/markets/product-facts.json', 'utf8')) },
  './product-topics.json': { default: JSON.parse(fs.readFileSync('lib/markets/product-topics.json', 'utf8')) },
});
const guide = loadModule('lib/seo/reference-guide.ts', { './site': site });
const removed = ['uranium', 'aluminium', 'dollar-index', 'vix', 'corn', 'wheat', 'krw', 'h100', 'bovespa'];
const locales = ['en', 'ko', 'ja', 'zh', 'pt', 'es'];
const page = loadModule('app/[locale]/stock/[slug]/page.tsx', {
  '@/lib/markets/stocks': catalog,
  '@/lib/seo/site': site,
  '@/lib/markets/product-info': productInfo,
  '@/lib/seo/reference-guide': guide,
  'next/navigation': { notFound: () => { throw new Error('NEXT_NOT_FOUND'); } },
  'next-intl/server': { setRequestLocale: () => {} },
});

function collect(node, predicate, result = []) {
  if (!node || typeof node !== 'object') return result;
  if (predicate(node)) result.push(node);
  for (const child of Object.values(node)) {
    if (Array.isArray(child)) child.forEach(value => collect(value, predicate, result));
    else if (child && typeof child === 'object') collect(child, predicate, result);
  }
  return result;
}

test('catalog has 120 unique active markets and excludes nine unsupported markets', () => {
  assert.equal(catalog.stocks.length, 120);
  assert.equal(catalog.archivedStocks, undefined);
  assert.equal(catalog.allStocks, undefined);
  for (const key of ['symbol', 'slug', 'hyperliquidSymbol']) {
    assert.equal(new Set(catalog.stocks.map(stock => stock[key])).size, 120, `unique ${key}`);
  }
  for (const stock of catalog.stocks) {
    assert.match(stock.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(stock.hyperliquidSymbol, `xyz:${stock.symbol}`);
    assert.equal(catalog.getStockBySlug(stock.slug), stock);
  }
  const newMarkets = catalog.stocks.filter(stock => stock.description);
  const additions = 'SNDK CRCL USAR LITE PURRDAT BIRD CBRS MINIMAX BB QNT NOK SMH BE ZHIPU QCOM STRC BOT AMAT GIGADEV SHAZ SKHY KSTR CXMT GEV KORU UNITREE LYTE NCLD SOXL MAGS IREN NET CRWD RDDT AAOI MRNA XBI SHEIN BMNR SNXX CVX TLT HO OURA LRCX UMC CAMBRICON TWST GLW RELIANCE JIO ANT ICE'.split(' ');
  assert.equal(additions.length, 53);
  for (const symbol of additions) {
    const stock = catalog.stocks.find(stock => stock.symbol === symbol);
    assert.ok(stock, `${symbol} is available`);
    assert.ok(stock.description?.length > 60, `${symbol} has a product description`);
  }
  assert.equal(new Set(newMarkets.map(stock => stock.description)).size, newMarkets.length);
  for (const slug of removed) assert.equal(catalog.getStockBySlug(slug), undefined);
});

test('all active detail pages have matching multilingual canonical and hreflang', async () => {
  const params = await page.generateStaticParams();
  assert.equal(params.length, 120 * 6);
  for (const stock of catalog.stocks) {
    for (const locale of locales) {
      const metadata = await page.generateMetadata({ params: Promise.resolve({ locale, slug: stock.slug }) });
      const prefix = locale === 'en' ? '' : `/${locale}`;
      assert.equal(metadata.alternates.canonical, `https://www.nightticker.com${prefix}/stock/${stock.slug}`);
      for (const language of locales) {
        const languagePrefix = language === 'en' ? '' : `/${language}`;
        assert.equal(metadata.alternates.languages[language], `https://www.nightticker.com${languagePrefix}/stock/${stock.slug}`);
      }
      assert.ok(metadata.title && metadata.description);

    }
  }
  await assert.rejects(page.generateMetadata({ params: Promise.resolve({ locale: 'en', slug: 'nonexistent-market' }) }), /NEXT_NOT_FOUND/);
});

test('sitemap includes every active language URL and excludes unsupported details', () => {
  const sitemap = loadModule('app/sitemap.ts', { '@/lib/markets/stocks': catalog, '@/lib/seo/site': site }).default();
  const urls = new Set(sitemap.map(entry => entry.url));
  assert.equal(urls.size, sitemap.length, 'no duplicate sitemap URLs');
  for (const stock of catalog.stocks) for (const locale of locales) {
    const prefix = locale === 'en' ? '' : `/${locale}`;
    assert.ok(urls.has(`https://www.nightticker.com${prefix}/stock/${stock.slug}`));
  }
  for (const slug of removed) assert.ok(!sitemap.some(entry => entry.url.endsWith(`/stock/${slug}`)));
  assert.ok(sitemap.every(entry => !('lastModified' in entry) && !('changeFrequency' in entry) && !('priority' in entry)), 'unproven revision dates and crawl-frequency hints are omitted');
});

test('unsupported details return 404 while active server HTML includes product context', async () => {
  for (const slug of removed) {
    await assert.rejects(page.generateMetadata({ params: Promise.resolve({ locale: 'en', slug }) }), /NEXT_NOT_FOUND/);
    await assert.rejects(page.default({ params: Promise.resolve({ locale: 'en', slug }) }), /NEXT_NOT_FOUND/);
  }
  const active = await page.default({ params: Promise.resolve({ locale: 'en', slug: 'qualcomm' }) });
  assert.equal(collect(active, node => node.type === 'MarketPriceCard').length, 1);
  assert.equal(collect(active, node => node.type === 'script').length, 2);
  assert.match(JSON.stringify(active), /QUALCOMM/);
  assert.match(JSON.stringify(active), /derivatives market/);
});

test('unsupported sharing image URLs return 404 instead of a successful Not Found image', async () => {
  for (const path of ['opengraph-image', 'twitter-image']) {
    const image = loadModule(`app/[locale]/stock/[slug]/${path}.tsx`, {
      '@/lib/markets/stocks': catalog,
      'next/navigation': { notFound: () => { throw new Error('NEXT_NOT_FOUND'); } },
    });
    for (const slug of removed) {
      await assert.rejects(image.default({ params: Promise.resolve({ locale: 'en', slug }) }), /NEXT_NOT_FOUND/);
    }
  }
});

test('saved unsupported favorites are hidden on both home and favorites page', () => {
  const favorites = [
    { symbol: 'URANIUM', market: 'COMMODITY', slug: 'uranium', name: 'Uranium' },
    { symbol: 'AAPL', market: 'US', slug: 'apple', name: 'Apple' },
  ];
  const dependencies = {
    '@/lib/markets/stocks': catalog,
    '@/lib/format-market': loadModule('lib/format-market.ts'),
    '@/lib/context/FavoritesContext': { useFavorites: () => ({ favorites, isLoaded: true }) },
    '@/lib/hooks/useHyperliquidTicker': { useHyperliquidTicker: () => ({ tickers: {}, status: 'connected', lastUpdate: null }) },
    'next-intl': { useLocale: () => 'en', useTranslations: () => key => key },
    react: { useState: initial => [initial, () => {}] },
    '@/lib/utils': { cn: () => '' },
  };
  for (const [path, name, props] of [
    ['components/sections/FavoritesSection.tsx', 'FavoritesSection', { tickers: {} }],
    ['components/pages/FavoritesPage.tsx', 'FavoritesPage', {}],
  ]) {
    const loadedModule = loadModule(path, dependencies);
    const tree = loadedModule[name](props);
    const cards = collect(tree, node => node.type === 'AssetCard');
    assert.equal(cards.length, 1, `${name} has no unsupported asset card`);
    assert.equal(cards[0].props.asset.symbol, 'AAPL');
  }
});
