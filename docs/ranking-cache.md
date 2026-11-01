# Ranking storage and cache

Market prices and candles do not use Redis. Popularity rankings retain the existing
five-minute-bucket approximation of a rolling 24-hour window and refresh at most
once per 30-minute snapshot under a valid refresh lease.

## Durability and bounds

- The browser batches up to 20 active-stock page views, starts delivery after two
  seconds, and flushes on visibility/pagehide with `keepalive`. Pending batches are
  saved in tab session storage, capped at 10 batches and one hour of age.
- A stable batch UUID and payload digest make retries idempotent for two hours.
  A batch freezes before its first send and is never appended to afterward.
- Redis atomically checks deduplication and the client-address quota, increments
  grouped symbol/bucket counts, sets expiries, and acknowledges the batch. An HTTP
  success means Redis has accepted the writes, rather than process memory.
- There is no durable-delivery guarantee before the server accepts a batch: browser
  termination, disabled storage, queue limits, and extended outages can lose views.
- Inputs are bounded to 8 KiB, 20 events, registered active symbols, and one-hour-old
  timestamps (with 30 seconds clock skew allowance). Each address may record 120
  events per server minute. Retries already committed consume no new quota.
- Old browser clients may still send `{symbol}` during rollout. Those requests are
  stored immediately but cannot have retry deduplication without a stable id.
- Trusted proxy infrastructure must overwrite client address headers. Vercel's
  `x-vercel-forwarded-for` takes precedence, then `x-real-ip`, then `x-forwarded-for`.
  Without an address all clients share the `unknown` quota. This must be verified
  for a self-hosted deployment before traffic rollout. An address is only stored
  as a SHA-256 digest. Rate limiting bounds legitimate identifiers; it is not a
  substitute for upstream traffic controls against distributed abuse.

## Read protection

Browser storage, CDN, process memory, and Redis snapshots all use the snapshot's
absolute `expiresAt`. A cache hit does not start another 30-minute freshness period.
A process shares concurrent refreshes. A 30-second Redis lease prevents multiple
instances from concurrently aggregating 288 bucket hashes. Publishing checks lease
ownership atomically, retains an hourly rank snapshot, and releases the lease.
An expired worker cannot overwrite a later worker's result. Empty rankings are
cached too, preventing repeated cold-start aggregation. Snapshot storage lasts
25 hours to support degraded fallback; freshness remains 30 minutes.

On Redis failure the process backs off reads for 30 seconds. A recent last-good
ranking (up to 24 hours) or defaults is returned with `degraded: true`, five-second
CDN cache and a 30-second browser retry. Default fallback uses `lastUpdated: 0`,
so an outage is not persisted as a fresh ranking. Redis reads have five-second
network aborts and at most one transport retry. Write retries are safe by batch id.

## Budget model and operational verification

Retaining the existing bucket aggregation avoids a risky rolling-total migration.
At 48 refreshes/day a continuously used deployment performs 13,824 bucket HGETALL
commands/day, plus 48 previous-snapshot reads and cache/lease/publication work.
Different language pages share the API URL and snapshot. A healthy process cache
hit makes zero Redis calls; a CDN hit never reaches that process.

A newly accepted write batch executes a dedup GET, quota GET, one HINCRBY for each
distinct symbol/bucket pair, one EXPIRE for each touched bucket, dedup SET, quota
INCRBY and quota EXPIRE. With G groups and B buckets this is 5 + G + B internal Redis
commands, plus EVAL itself if billed separately. A duplicate uses only the dedup GET
inside EVAL. Twenty same-symbol views in one bucket therefore cost seven internal
commands rather than forty HINCRBY/EXPIRE operations with individual durable writes.
Pipelining and EVAL reduce transport round trips; they must not be claimed to make
all inner commands free. Confirm actual Upstash billing and script metering in the
account's usage dashboard. Read misses also incur snapshot GET and lease SET; this
is traffic-dependent and must be measured.

Production credentials, account limits, traffic volumes, edge-cache hit rates and
usage history were not available locally. No production Redis commands were issued
for verification, and a production savings percentage is intentionally not claimed.
Before rollout, record those baselines, verify trusted address forwarding, and check
usage after enabling durable writes. The prior broken memory buffer was dropping
views, so its write count is not a valid accuracy-equivalent baseline.

## Local verification

Run `node --test tests/ranking.test.mjs` on Node with TypeScript stripping support.
For the Lua integration test, set `REDIS_TEST_BIN` to a directory containing
`redis-server` and `redis-cli`, then run `node --test tests/ranking*.test.mjs`.
The integration test uses its own temporary directory and Unix socket, exercises
concurrent retry deduplication, quota rejection, bucket expiry, lease ownership and
immutable hourly snapshots, and never connects to production Redis.
