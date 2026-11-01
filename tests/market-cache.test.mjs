import test from 'node:test';
import assert from 'node:assert/strict';
import { RequestCache } from '../lib/market/cache.ts';

test('coalesces cold concurrent requests and reuses fresh data', async () => {
  let calls = 0;
  let resolve;
  const cache = new RequestCache(1000, 5000, () => { calls++; return new Promise(done => { resolve = done; }); });
  const requests = Array.from({ length: 50 }, () => cache.get());
  assert.equal(calls, 1);
  resolve({ price: 123 });
  const entries = await Promise.all(requests);
  assert.ok(entries.every(entry => entry.data.price === 123 && !entry.stale));
  await cache.get();
  assert.equal(calls, 1);
});

test('fallback keeps original timestamp, backs off failures, and expires', async () => {
  const originalNow = Date.now;
  let now = 10000;
  Date.now = () => now;
  let fail = false;
  let calls = 0;
  try {
    const cache = new RequestCache(1000, 10000, async () => { calls++; if (fail) throw Error('offline'); return 42; });
    const fresh = await cache.get();
    fail = true; now += 1500;
    const stale = await cache.get();
    assert.equal(stale.timestamp, fresh.timestamp);
    assert.equal(stale.stale, true);
    await cache.get();
    assert.equal(calls, 2);
    now += 10000;
    await assert.rejects(cache.get(), /offline/);
  } finally { Date.now = originalNow; }
});

test('a failed first load never creates an empty successful cache entry', async () => {
  let fail = true;
  const cache = new RequestCache(1000, 10000, async () => { if (fail) throw Error('offline'); return [1]; });
  await assert.rejects(cache.get(), /offline/);
  fail = false;
  assert.deepEqual((await cache.get()).data, [1]);
});
