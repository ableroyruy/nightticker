import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(path, dependencies = {}, env = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { exports, process: { env }, require: name => {
    if (name in dependencies) return dependencies[name];
    if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
    return new Proxy({}, { get: (_, key) => key === '__esModule' ? true : key });
  } }, { filename: path });
  return exports;
}
const site = load('lib/seo/site.ts');
const staticMetadata = load('lib/seo/static-metadata.ts', { './site': site });
const catalog = load('lib/markets/stocks.ts');
const languages = ['en', 'ko', 'ja', 'zh', 'pt', 'es'];
const notFound = () => { throw new Error('NOT_FOUND'); };

test('market URL normalization is idempotent and preserves locale while removing default prefix', () => {
  for (const [input, expected] of [
    ['/stock/QUALCOMM', '/stock/qualcomm'], ['/ko/stock/Qualcomm', '/ko/stock/qualcomm'],
    ['/ZH/CATEGORY/SPECIAL/', '/zh/category/special'], ['/en/stock/qualcomm', '/stock/qualcomm'],
    ['/category/US', '/category/us'], ['/stock/qualcomm', null], ['/api/market/PRICES', null], ['/other/SomeCase', null],
  ]) {
    assert.equal(site.canonicalMarketPath(input), expected);
    if (expected) assert.equal(site.canonicalMarketPath(expected), null);
  }
});

test('permanent redirect preserves query and does not run locale negotiation first', () => {
  let localizations = 0;
  const proxy = load('proxy.ts', {
    './lib/seo/site': site,
    './lib/i18n': { locales: languages, defaultLocale: 'en' },
    'next-intl/middleware': { default: () => () => { localizations++; return 'localized'; } },
    'next/server': { NextResponse: { redirect: (url, status) => ({ url: url.toString(), status, cookies: { values: {}, set(key, value) { this.values[key] = value; } } }) } },
  }).default;
  const request = raw => {
    const url = new URL(raw);
    url.clone = () => new URL(url);
    return { nextUrl: url };
  };
  const response = proxy(request('https://www.nightticker.com/ko/stock/QUALCOMM?source=share&category=us'));
  assert.equal(response.status, 308);
  assert.equal(response.url, 'https://www.nightticker.com/ko/stock/qualcomm?source=share&category=us');
  assert.equal(localizations, 0);
  const english = proxy(request('https://www.nightticker.com/en/stock/QUALCOMM?source=share'));
  assert.equal(english.url, 'https://www.nightticker.com/stock/qualcomm?source=share');
  assert.equal(english.cookies.values.NEXT_LOCALE, 'en');
  for (const [path, destination] of [
    ['/en/popular?category=KR', '/popular?category=KR'],
    ['/en/about?source=share', '/about?source=share'],
    ['/en/favorites', '/favorites'], ['/en', '/'], ['/en/', '/'],
  ]) {
    const result = proxy(request(`https://www.nightticker.com${path}`));
    assert.equal(result.status, 308);
    assert.equal(result.url, `https://www.nightticker.com${destination}`);
    assert.equal(result.cookies.values.NEXT_LOCALE, 'en');
  }
  assert.equal(localizations, 0);
  assert.equal(proxy(request('https://www.nightticker.com/ko/stock/qualcomm')), 'localized');
});

test('metadata uses absolute single-brand titles and six reciprocal canonical alternates', async () => {
  const metadata = site.pageMetadata('en', '/how-data-works', 'How Data Works - NightTicker Price Source | NightTicker', 'Description');
  assert.equal(metadata.title.absolute, 'How Data Works - NightTicker Price Source');
  assert.equal((metadata.title.absolute.match(/NightTicker/g) || []).length, 1);
  assert.equal(metadata.alternates.languages['x-default'], 'https://www.nightticker.com/how-data-works');
  for (const route of ['about', 'how-data-works', 'what-is-hyperliquid', 'privacy', 'terms', 'us-market-hours', 'korea-market-hours', 'overnight-prices', 'weekend-prices', 'holiday-prices', 'gainers', 'losers', 'popular']) {
    const results = languages.map(locale => staticMetadata.staticPageMetadata(locale, route));
    for (let index = 0; index < languages.length; index++) {
      const locale = languages[index];
      const current = results[index];
      assert.equal(current.alternates.canonical, site.localizedUrl(locale, `/${route}`));
      for (const language of languages) assert.equal(current.alternates.languages[language], site.localizedUrl(language, `/${route}`));
      assert.ok(current.description.length > 15);
      assert.ok(current.title.absolute);
    }
    assert.equal(new Set(results.map(value => value.description)).size, 6, `${route} has six localized descriptions`);
  }
});

test('home metadata has six localized versions without adding a visible heading', async () => {
  const home = load('app/[locale]/page.tsx', { '@/lib/seo/site': site });
  const results = await Promise.all(languages.map(locale => home.generateMetadata({ params: Promise.resolve({ locale }) })));
  assert.equal(new Set(results.map(item => item.description)).size, 6);
  assert.doesNotMatch(fs.readFileSync('app/[locale]/page.tsx', 'utf8'), /<h1\b/);
  assert.doesNotMatch(fs.readFileSync('components/pages/HomePage.tsx', 'utf8'), /<h1\b/);
  assert.doesNotMatch(fs.readFileSync('app/layout.tsx', 'utf8'), /template:\s*['"]%s/);
});

test('category metadata follows the active catalog in all six languages, with no obsolete special assets', async () => {
  const category = load('app/[locale]/category/[category]/page.tsx', { '@/lib/seo/site': site, '@/lib/markets/stocks': catalog, 'next/navigation': { notFound } });
  for (const locale of languages) {
    const meta = await category.generateMetadata({ params: Promise.resolve({ locale, category: 'SPECIAL' }) });
    assert.equal(meta.alternates.canonical, site.localizedUrl(locale, '/category/special'));
    assert.doesNotMatch(`${meta.title.absolute} ${meta.description}`, /H100|DRAM/);
  }
  await assert.rejects(category.generateMetadata({ params: Promise.resolve({ locale: 'en', category: 'missing' }) }), /NOT_FOUND/);
});

test('crawler policy permits JS/CSS and structured data has only supported languages and no fictitious search endpoint', () => {
  const robots = load('app/robots.ts', { '@/lib/seo/site': site }).default();
  assert.deepEqual([...robots.rules.disallow], ['/api/']);
  const jsonLd = load('components/seo/JsonLd.tsx', { '@/lib/seo/site': site }).JsonLd({ type: 'website', locale: 'zh' });
  const data = JSON.parse(jsonLd.props.dangerouslySetInnerHTML.__html);
  assert.deepEqual([...data.inLanguage], languages);
  assert.equal(data.potentialAction, undefined);
});

test('sitemap excludes personal watchlists and query duplicates; favorites are noindex', async () => {
  const sitemap = load('app/sitemap.ts', { '@/lib/seo/site': site, '@/lib/markets/stocks': catalog }).default();
  assert.equal(sitemap.length, (15 + 9 + 120) * 6);
  assert.ok(sitemap.every(item => !item.url.includes('?') && !item.url.endsWith('/favorites')));
  const favorites = load('app/[locale]/favorites/page.tsx', { '@/lib/seo/static-metadata': staticMetadata });
  const meta = await favorites.generateMetadata({ params: Promise.resolve({ locale: 'es' }) });
  assert.equal(meta.robots.index, false);
  assert.equal(meta.robots.follow, true);
});


test('every sitemap document agrees with its index policy, canonical and reciprocal language URLs', async () => {
  const sitemap = load('app/sitemap.ts', { '@/lib/seo/site': site, '@/lib/markets/stocks': catalog }).default();
  const listed = new Set(sitemap.map(item => item.url));
  for (const entry of sitemap) {
    const url = new URL(entry.url);
    assert.equal(url.origin, site.SITE_URL);
    assert.equal(url.search, '');
    assert.equal(url.hash, '');
    assert.doesNotMatch(url.pathname, /^\/en(?:\/|$)/);
    assert.equal(site.canonicalMarketPath(url.pathname), null);
    assert.ok(!('lastModified' in entry), 'omit dates without per-route evidence');
    assert.ok(!('changeFrequency' in entry) && !('priority' in entry));
    for (const language of languages) {
      const alternate = entry.alternates.languages[language];
      assert.ok(listed.has(alternate), `${language} alternate is itself indexable`);
      const counterpart = sitemap.find(item => item.url === alternate);
      assert.ok(Object.values(counterpart.alternates.languages).includes(entry.url), 'reciprocal language links');
    }
    assert.equal(entry.alternates.languages['x-default'], entry.alternates.languages.en);
  }
  const favorites = load('app/[locale]/favorites/page.tsx', { '@/lib/seo/static-metadata': staticMetadata });
  const robots = load('app/robots.ts', { '@/lib/seo/site': site }).default();
  for (const locale of languages) {
    const meta = await favorites.generateMetadata({ params: Promise.resolve({ locale }) });
    assert.equal(meta.robots.index, false);
    assert.ok(!listed.has(meta.alternates.canonical));
    assert.ok(!robots.rules.disallow.some(path => new URL(meta.alternates.canonical).pathname.startsWith(path)), 'crawlers can read favorites noindex');
  }
});

test('ranking filter URLs retain selection while canonical stays in the same language', async () => {
  const popular = load('app/[locale]/popular/page.tsx', { '@/lib/seo/static-metadata': staticMetadata });
  for (const locale of languages) {
    const meta = await popular.generateMetadata({ params: Promise.resolve({ locale }), searchParams: Promise.resolve({ category: 'semiconductor' }) });
    assert.equal(meta.alternates.canonical, site.localizedUrl(locale, '/popular'));
    assert.ok(!meta.alternates.canonical.includes('?'));
    assert.equal(site.canonicalMarketPath(`${locale === 'en' ? '' : '/' + locale}/popular`), null, 'proxy does not redirect filter pages to erase queries');
  }
});
