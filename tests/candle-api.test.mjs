import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { RequestCache } from '../lib/market/cache.ts';

function route(load, symbols = ['AAPL']) {
  const code = ts.transpileModule(fs.readFileSync('app/api/market/candles/route.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const context = { exports: {}, require: name => {
    if (name === 'next/server') return { NextResponse: { json: (body, init = {}) => ({ body, status: init.status ?? 200, headers: init.headers }) } };
    if (name.includes('stocks')) return { stocks: symbols.map(symbol => ({ hyperliquidSymbol: `xyz:${symbol}` })) };
    if (name.includes('market/data')) return { info: load, stripSymbol: symbol => symbol.replace(/^xyz:/i, '').toUpperCase() };
    if (name.includes('market/cache')) return { RequestCache };
    throw Error(name);
  } };
  vm.runInNewContext(code, context);
  return query => context.exports.GET({ nextUrl: new URL(`https://test/api/market/candles?${query}`) });
}
const raw = [{ t: 1000000, o: '1', h: '2', l: '1', c: '2', v: '4' }];
test('candle API rejects unknown symbols before upstream and does not cache outages as empty success', async () => {
  let calls = 0;
  let fail = true;
  const get = route(async () => { calls++; if (fail) throw Error('offline'); return raw; });
  assert.equal((await get('symbol=UNKNOWN')).status, 400);
  assert.equal(calls, 0);
  const failed = await get('symbol=AAPL');
  assert.equal(failed.status, 503);
  assert.equal(failed.headers['Cache-Control'], 'no-store');
  fail = false;
  const success = await get('symbol=xyz%3Aaapl');
  assert.equal(success.status, 200);
  assert.equal(success.body.length, 1);
  assert.equal(calls, 2);
});
test('candle API shares per-symbol fetches across requests and caps global concurrency', async () => {
  let running = 0, peak = 0, calls = 0;
  const symbols = Array.from({ length: 10 }, (_, i) => `S${i}`);
  const get = route(async () => {
    calls++; running++; peak = Math.max(peak, running);
    await new Promise(resolve => setTimeout(resolve, 5));
    running--; return raw;
  }, symbols);
  const results = await Promise.all(Array.from({ length: 10 }, () => get(`symbols=${symbols.join(',')}`)));
  assert.ok(results.every(result => result.status === 200));
  assert.equal(calls, 10);
  assert.equal(peak, 5);
});
