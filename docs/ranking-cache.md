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
ranking (up to 24 hours) or an empty result is returned with `degraded: true`, five-second
CDN cache and a 30-second browser retry. Empty fallback uses `lastUpdated: 0`,
so an outage is not persisted as a fresh ranking. Redis reads have five-second
network aborts and at most one transport retry. Write retries are safe by batch id.
The browser also expires its last-good result after 24 hours, including in an
offline open tab and on return from background visibility.

## Overall and category rankings

Overall plus US/KR/JP/INDEX/ETF/COMMODITY/FX/SPECIAL/SEMICONDUCTOR lists are derived
from the same 288 bucket reads. Semiconductor membership overlaps base categories;
it never increments the overall count again. Category positions and movement are
local to that group. Ties sort by symbol. Zero-view recommendations are never
presented as measured ranks. A legacy snapshot lacking category history produces
an unavailable comparison, not a claimed unchanged rank.

The existing server v3 cache, lease and hourly snapshot keys are retained. Added
JSON fields are compatible with the previous reader, while the browser snapshot
cache is v4. The durable event queue format and batch idempotency are unchanged.
An immutable old hourly snapshot is not overwritten during rollout; the next
hourly snapshot includes category fields. Rollback preserves recorded view events.

One multi-field HSET now publishes all hourly rank fields, rather than one HSET
per symbol. This does not make the larger storage payload free. A fixed fixture
with all 120 symbols and views 120..1 gives:

| Quantity | Overall only | Overall + categories |
|---|---:|---:|
| Raw bucket HGETALL per refresh | 288 | 288 |
| Previous hourly snapshot HGETALL | 1 | 1 |
| Hourly snapshot fields | 120 | 270 |
| Snapshot JSON bytes | 1,227 | 3,615 |
| Ranking response JSON bytes (without common timestamp fields) | 9,292 | 20,929 |
| HSET calls when writing a new hourly snapshot | 120 | 1 |

The fixture includes 30 overlapping semiconductor symbols. JSON bytes are wire
payload measurements, not Redis allocated memory. The publication script uses
GET/SET/EXISTS/HSET/EXPIRE/DEL (six inner commands for a new nonempty snapshot),
with no extra per-category request or key. Existing-hour publication uses four
inner commands. EVAL and actual provider billing must be assessed separately.
Filtering a previously loaded category makes no API or Redis request; scheduled
refreshes still occur. A larger response/storage payload is an explicit tradeoff.

## Price and chart freshness (no Redis)

Prices use a 3-second process TTL and at most 60-second fallback; metadata uses
60 seconds and at most 5 minutes. Candle data uses 2 minutes and at most 10-minute
fallback. Stale responses are marked and not edge cached. Browser quotes are
cleared after 60 seconds without fresh data; missing daily baselines stay unknown.
Candles are 5-minute intervals requested over the last 6 hours. Their visible
captions distinguish the interval from the range and from the 24-hour price change.

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
