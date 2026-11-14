import test from 'node:test';
import assert from 'node:assert/strict';
import { createApiCachingFetch } from '../cloudflare/api-cache.mjs';

function setup(response = () => Response.json({ value: 1 }, { headers: { 'Cache-Control': 'public, s-maxage=60' } })) {
  const entries = new Map();
  const requests = [];
  let now = 0;
  const cache = {
    async match(key) {
      const entry = entries.get(key.url);
      return entry && entry.expires > now ? entry.response.clone() : undefined;
    },
    async put(key, value) {
      const ttl = Number(value.headers.get('Cache-Control').match(/s-maxage=(\d+)/)[1]);
      entries.set(key.url, { response: value.clone(), expires: now + ttl * 1000 });
    },
  };
  const fetch = createApiCachingFetch({ fetch: async r => { requests.push(r); return response(); } }, async () => cache);
  const run = async (path, init, release = 'one') => {
    const pending = [];
    const result = await fetch(new Request(`https://www.nightticker.com${path}`, init),
      { CF_VERSION_METADATA: { id: release } }, { waitUntil: p => pending.push(p) });
    await Promise.all(pending);
    return result;
  };
  return { run, requests, entries, advance: ms => { now += ms; } };
}

test('edge cache shares public quotes, expires within three seconds and isolates query and deployment', async () => {
  const app = setup();
  const first = await app.run('/api/market/ticker');
  assert.equal(first.headers.get('X-Nightticker-CDN'), 'MISS');
  assert.equal((await app.run('/api/market/ticker')).headers.get('X-Nightticker-CDN'), 'HIT');
  assert.equal(app.requests.length, 1);
  app.advance(3001);
  assert.equal((await app.run('/api/market/ticker')).headers.get('X-Nightticker-CDN'), 'MISS');
  await app.run('/api/market/ticker', undefined, 'two');
  await app.run('/api/market/candles?symbol=TTWO');
  await app.run('/api/market/candles?symbol=MUU');
  assert.equal(app.requests.length, 5);
});

test('edge cache never stores failed, partial, stale, degraded or private responses', async () => {
  for (const [status, extra] of [
    [503, {}], [207, {}], [200, { 'Cache-Control': 'no-store' }],
    [200, { 'Cache-Control': 'private, s-maxage=60' }], [200, { 'Set-Cookie': 'id=secret' }],
    [200, { 'Retry-After': '30' }], [200, { 'X-Data-Stale': 'true' }], [200, { Vary: '*' }],
  ]) {
    const app = setup(() => Response.json({}, { status, headers: { 'Cache-Control': 'public, s-maxage=60', ...extra } }));
    assert.equal((await app.run('/api/ranking')).headers.get('X-Nightticker-CDN'), 'BYPASS');
    await app.run('/api/ranking');
    assert.equal(app.entries.size, 0);
    assert.equal(app.requests.length, 2);
  }
});

test('view writes, credentials and page requests bypass caching; rate limits use the Cloudflare client address', async () => {
  const app = setup();
  for (const [path, init] of [
    ['/api/ranking', { method: 'POST', body: '{}' }],
    ['/api/ranking', { headers: { Authorization: 'Bearer test' } }],
    ['/api/market/ticker', { headers: { Range: 'bytes=0-5' } }],
    ['/ko/category/in', {}],
  ]) await app.run(path, init);
  await app.run('/api/ranking', { method: 'POST', headers: {
    'cf-connecting-ip': '192.0.2.10', 'x-vercel-forwarded-for': 'forged',
    'x-forwarded-for': 'forged', 'x-real-ip': 'forged',
  } });
  assert.equal(app.entries.size, 0);
  const headers = app.requests.at(-1).headers;
  assert.equal(headers.get('x-real-ip'), '192.0.2.10');
  assert.equal(headers.get('x-forwarded-for'), null);
  assert.equal(headers.get('x-vercel-forwarded-for'), null);
});

test('edge cache failures preserve the application response', async () => {
  const fetch = createApiCachingFetch({ fetch: async () => new Response('available') }, async () => { throw new Error('cache unavailable'); });
  const response = await fetch(new Request('https://www.nightticker.com/api/market/ticker'), {}, { waitUntil() {} });
  assert.equal(await response.text(), 'available');
});
