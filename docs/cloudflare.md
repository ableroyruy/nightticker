# Cloudflare deployment

The existing `nightticker` Worker in account
`b3d3658581bd5bc5dfe0d9f411c3a9c3` serves
`https://nightticker.lemoningz55.workers.dev`. GitHub main builds production;
other branches build isolated Previews.

- Build: `npm ci` then `npm run build:cloudflare`.
- Local Workers verification: `npm run preview:cloudflare`.
- Production deploy: `npm run deploy:cloudflare`.
- Branch deploy: `npx wrangler preview` after the same build.

Both production and preview build settings must use `npm run build:cloudflare`.
The build populates prerendered page data into Workers static assets; no R2 or
ISR service is required. Do not add runtime page revalidation without replacing
the read-only cache. Live quotes and candles use uncached API routes.

Production is connected to the existing `UPSTASH_REDIS_REST_URL` and
`UPSTASH_REDIS_REST_TOKEN` as Worker secrets, preserving measured rankings and
view history. Transfer credentials from the existing Upstash database; creating
a replacement empty database loses history. Previews intentionally do not share
production Redis. Never commit secrets or include them in build logs.

The registrar is Namecheap. Cloudflare nameservers for `nightticker.com` are
`courtney.ns.cloudflare.com` and `kellen.ns.cloudflare.com`. Preserve the Google
verification TXT and all three original CAA records. Both apex and www custom
domains target the same Worker; Next redirects apex to www.

Retain the existing Vercel project and database for rollback. Its former DNS
records are apex CNAME `3f47cd565ec6ba4c.vercel-dns-017.com` and wildcard CNAME
`cname.vercel-dns-017.com`, with former nameservers `ns1.vercel-dns.com` and
`ns2.vercel-dns.com`. Vercel is currently paused for usage limits, so restoring
those records alone does not restore service until the pause is resolved.

## CDN

`public/_headers` sets one-year immutable browser caching for hashed Next assets;
public branding assets use one-day browser and 30-day CDN lifetimes. Static
assets are served directly by Workers Assets. `cloudflare/worker.mjs` wraps
OpenNext with a Cache API layer for explicitly public JSON GET endpoints only.
It avoids Next rendering and upstream/Redis reads on hits, but a cached API
request still invokes the small Worker wrapper. Cache entries are local to each
Cloudflare data center and isolated by deployed version and full query.

The API response controls freshness: quotes 3s, metadata 60s, candles 120s,
healthy ranking snapshots up to 30m. Errors, partial/stale/degraded data, private
responses, authorization and POST view recording bypass caching. HTML is kept
out of this cache because locale cookies and RSC navigation affect responses.
`X-Nightticker-CDN: HIT|MISS|BYPASS` makes API verification visible.

## Candle request isolation

Candle requests keep their own upstream concurrency limit (five) and never wait
on another HTTP request's promises or semaphore callbacks. Only completed candle
snapshots are shared in isolate memory: fresh for two minutes, delayed fallback
for at most ten minutes. The existing CDN still shares successful batch responses.
A global queue/shared in-flight cache previously stranded overlapping requests
and produced Cloudflare 1101: “the Worker's code had hung and would never generate
a response.” Client retries alone could not fix this failure.

`tests/candle-api.test.mjs` holds one request's upstream work indefinitely and
requires an overlapping request to finish independently. Test this behavior when
changing the concurrency limit or restoring request coalescing.
