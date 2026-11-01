import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(path, dependencies = {}) {
  const context = { exports: {}, require: name => {
    if (name in dependencies) return dependencies[name];
    if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
    throw Error(`Unexpected runtime dependency ${name}`);
  } };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, context);
  return context.exports;
}
const { stocks } = load('lib/markets/stocks.ts');
const facts = JSON.parse(fs.readFileSync('lib/markets/product-facts.json', 'utf8'));
const topics = JSON.parse(fs.readFileSync('lib/markets/product-topics.json', 'utf8'));
const info = load('lib/markets/product-info.ts', { './product-facts.json': facts, './product-topics.json': topics });
const { ProductInfo } = load('components/stock/ProductInfo.tsx', { '@/lib/markets/product-info': info });
const locales = ['en', 'ko', 'ja', 'zh', 'pt', 'es'];
const stock = symbol => stocks.find(value => value.symbol === symbol);

function collect(node, predicate, result = []) {
  if (!node || typeof node !== 'object') return result;
  if (predicate(node)) result.push(node);
  for (const child of Object.values(node)) {
    if (Array.isArray(child)) child.forEach(value => collect(value, predicate, result));
    else if (child && typeof child === 'object') collect(child, predicate, result);
  }
  return result;
}

test('reviewed product content covers all 120 active markets in all six locales', () => {
  assert.equal(stocks.length, 120);
  assert.equal(Object.keys(facts).length, 120);
  for (const item of stocks) {
    assert.ok(item.description.length > 50, `${item.symbol} keeps full supplier text`);
    for (const locale of locales) {
      const product = info.getProductInfo(item, locale);
      assert.equal(product.locale, locale);
      for (const field of ['name', 'heading', 'country', 'productType', 'underlying', 'exchange', 'quoteUnit']) assert.ok(product[field]?.length, `${item.symbol}/${locale}/${field}`);
      assert.equal(product.sourceDescription, item.description, 'original supplier description is preserved');
      assert.ok(product.overview.length > 40, `${item.symbol}/${locale} overview`);
      assert.ok(!JSON.stringify(product).includes('xyz:'), 'internal API symbol is not user-facing');
      const tree = ProductInfo({ stock: item, locale });
      const paragraphs = collect(tree, node => node.type === 'p');
      assert.ok(paragraphs.some(node => node.props.children === item.description), 'full original description remains in server HTML');
      if (locale !== 'en') {
        assert.ok(paragraphs.some(node => node.props.children === product.overview), 'localized overview is server rendered');
        assert.notEqual(product.overview, info.getProductInfo(item, 'en').overview);
      }
    }
  }
});

test('country and product metadata are independent of legacy SPECIAL navigation keys', () => {
  const expected = { MINIMAX: 'HK', ZHIPU: 'HK', CXMT: 'CN', CAMBRICON: 'CN', GIGADEV: 'CN', UNITREE: 'CN', RELIANCE: 'IN', JIO: 'IN' };
  for (const [symbol, country] of Object.entries(expected)) {
    assert.equal(stock(symbol).category, 'SPECIAL', 'favorite and navigation category remains stable');
    const product = info.getProductInfo(stock(symbol), 'ko');
    assert.equal(product.countryCode, country);
    assert.equal(product.kind, 'equity');
    assert.ok(!product.productType.includes('특수'));
  }
});

test('ADS ratios, pre-IPO status, daily leverage and FX units cannot be confused', () => {
  for (const [symbol, ratio] of Object.entries({ SKHY: 0.1, TSM: 5, UMC: 5, BABA: 8, ARM: 1, NOK: 1 })) {
    assert.equal(info.getProductFacts(symbol).adsRatio, ratio);
    for (const locale of locales) assert.ok(info.getProductInfo(stock(symbol), locale).notes.some(note => note.includes(String(ratio))));
  }
  for (const symbol of ['ANT', 'OURA']) for (const locale of locales) {
    const product = info.getProductInfo(stock(symbol), locale);
    assert.equal(product.kind, 'pre-ipo');
    assert.ok(!product.exchange.includes('Nasdaq'), 'a proposed symbol is not shown as a completed listing');
    assert.ok(product.sourceUrl.endsWith('pre-ipo-specification-index'));
    assert.ok(product.notes.length > 0);
  }
  for (const [symbol, leverage] of Object.entries({ SOXL: 3, KORU: 3, SNXX: 2 })) {
    assert.equal(info.getProductFacts(symbol).dailyLeverage, leverage);
    for (const locale of locales) assert.ok(info.getProductInfo(stock(symbol), locale).notes.some(note => note.includes(String(leverage))));
  }
  assert.equal(info.getProductInfo(stock('JPY'), 'en').quoteUnit, 'JPY per 1 USD');
  assert.equal(info.getProductInfo(stock('HO'), 'en').quoteUnit, 'USD per US gallon');
  assert.equal(info.getProductInfo(stock('KR200'), 'en').quoteUnit, 'Index points (KRW)');
  assert.ok(info.getProductInfo(stock('SMSN'), 'ko').notes.some(note => note.includes('KRW')));
});
