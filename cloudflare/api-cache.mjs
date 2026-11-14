const limits = new Map([
  ['/api/market/ticker', 3],
  ['/api/market/prices', 3],
  ['/api/market/meta', 60],
  ['/api/market/candles', 120],
  ['/api/ranking', 1800],
]);

function ttlFor(response, maximum) {
  const control = response.headers.get('Cache-Control') ?? '';
  if (response.status !== 200 || response.headers.has('Set-Cookie') ||
      response.headers.get('Vary') === '*' || response.headers.get('X-Data-Stale') === 'true' ||
      response.headers.has('Retry-After') || /\b(no-store|private|no-cache)\b/i.test(control) ||
      !/\bpublic\b/i.test(control)) return 0;
  const seconds = Number(control.match(/\bs-maxage=(\d+)/i)?.[1] ?? 0);
  return Math.min(seconds, maximum);
}

export function createApiCachingFetch(handler, getCache) {
  return async function fetch(request, env, ctx) {
    // Cloudflare overwrites CF-Connecting-IP at its edge. Ignore client-supplied
    // forwarding headers before the existing view-recording rate limiter runs.
    const headers = new Headers(request.headers);
    for (const name of ['x-vercel-forwarded-for', 'x-real-ip', 'x-forwarded-for']) headers.delete(name);
    const address = headers.get('cf-connecting-ip');
    if (address) headers.set('x-real-ip', address);
    const forwarded = new Request(request, { headers });
    const url = new URL(request.url);
    const maximum = limits.get(url.pathname);
    if (request.method !== 'GET' || !maximum || headers.has('Authorization') ||
        headers.has('Range') || headers.has('RSC')) return handler.fetch(forwarded, env, ctx);

    // Different queries and deployments cannot share candle or catalog snapshots.
    url.searchParams.sort();
    url.searchParams.set('__nt_release', env.CF_VERSION_METADATA?.id ?? 'local');
    const key = new Request(url, { method: 'GET' });
    let cache;
    try {
      cache = await getCache();
      const hit = await cache.match(key);
      if (hit) {
        const response = new Response(hit.body, hit);
        response.headers.set('X-Nightticker-CDN', 'HIT');
        return response;
      }
    } catch { /* Cache availability must not prevent serving market data. */ }

    const response = await handler.fetch(forwarded, env, ctx);
    const ttl = ttlFor(response, maximum);
    const result = new Response(response.body, response);
    result.headers.set('X-Nightticker-CDN', ttl && cache ? 'MISS' : 'BYPASS');
    if (ttl && cache) {
      const stored = result.clone();
      // Cache API does not implement stale-while-revalidate; expire at the API's
      // remaining freshness lifetime instead of extending stale snapshots.
      stored.headers.set('Cache-Control', `public, max-age=0, s-maxage=${ttl}`);
      ctx.waitUntil(cache.put(key, stored).catch(() => {}));
    }
    return result;
  };
}
