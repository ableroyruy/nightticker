import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function route(load, symbols = ['AAPL'], clock = Date) {
  const code = ts.transpileModule(fs.readFileSync('app/api/market/candles/route.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const context = { exports: {}, Date: clock, require: name => {
    if (name === 'next/server') return { NextResponse: { json: (body, init = {}) => ({ body, status: init.status ?? 200, headers: init.headers }) } };
    if (name.includes('stocks')) return { stocks: symbols.map(symbol => ({ hyperliquidSymbol: `xyz:${symbol}` })) };
    if (name.includes('market/data')) return { info: load, stripSymbol: symbol => symbol.replace(/^xyz:/i, '').toUpperCase() };
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
test('overlapping candle requests own their I/O and cannot block behind another request', async () => {
  let releaseFirst;
  const blocked = new Promise(resolve => { releaseFirst = resolve; });
  let firstCalls = 0;
  let calls = 0;
  const symbols = Array.from({ length: 10 }, (_, i) => `S${i}`);
  const get = route(async () => {
    calls++;
    if (calls <= 5) { firstCalls++; await blocked; }
    return raw;
  }, symbols);
  const first = get(`symbols=${symbols.join(',')}`);
  await Promise.resolve();
  assert.equal(firstCalls, 5, 'each request starts at most five upstream calls');
  // The first request deliberately never completes until the second does.
  // A shared pending cache or global semaphore deadlocks this request.
  let timeout;
  try {
    const second = await Promise.race([
      get(`symbols=${symbols.join(',')}`),
      new Promise((_, reject) => { timeout = setTimeout(() => reject(Error('second request waited on first request I/O')), 1000); }),
    ]);
    assert.equal(second.status, 200);
    assert.equal(Object.keys(second.body).length, 10);
  } finally { clearTimeout(timeout); releaseFirst(); }
  assert.equal((await first).status, 200);
  const count = calls;
  assert.equal((await get(`symbols=${symbols.join(',')}`)).status, 200);
  assert.equal(calls, count, 'completed snapshots are still shared across requests');
});

test('separate symbol batches each have capacity while another batch is blocked', async () => {
  let release;
  const blocked = new Promise(resolve => { release = resolve; });
  const symbols = Array.from({ length: 10 }, (_, i) => `S${i}`);
  const get = route(async body => {
    if (Number(body.req.coin.slice(5)) < 5) await blocked;
    return raw;
  }, symbols);
  const first = get(`symbols=${symbols.slice(0, 5).join(',')}`);
  let timeout;
  try {
    const second = await Promise.race([
      get(`symbols=${symbols.slice(5).join(',')}`),
      new Promise((_, reject) => { timeout = setTimeout(() => reject(Error('independent batch starved')), 1000); }),
    ]);
    assert.equal(second.status, 200);
  } finally { clearTimeout(timeout); release(); }
  assert.equal((await first).status, 200);
});

test('completed candle snapshots have bounded stale fallback and partial failures stay uncached', async () => {
  let now = Date.now(), fail = false;
  class Clock extends Date { static now() { return now; } }
  const get = route(async body => {
    if (body.req.coin === 'xyz:BAD' || fail) throw Error('upstream timeout');
    return raw;
  }, ['AAPL', 'BAD'], Clock);
  const partial = await get('symbols=AAPL,BAD');
  assert.equal(partial.status, 207);
  assert.equal(partial.body.AAPL.length, 1);
  assert.equal(partial.headers['Cache-Control'], 'no-store');
  now += 121000;
  fail = true;
  const stale = await get('symbol=AAPL');
  assert.equal(stale.status, 200);
  assert.equal(stale.body.length, 1);
  assert.equal(stale.headers['X-Data-Stale'], 'true');
  assert.equal(stale.headers['Cache-Control'], 'no-store');
  now += 480000;
  assert.equal((await get('symbol=AAPL')).status, 503, 'expired snapshots cannot masquerade as current data');
});
