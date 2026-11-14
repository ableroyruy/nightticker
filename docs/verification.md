# CDN and Indian category follow-up — 2026-11-14

- Reviewed all four remaining SPECIAL entries against supplier specifications and pre-IPO status. RELIANCE and converted JIO move to IN; live pre-IPO ANT and OURA remain SPECIAL. Country menus, filters, badges, rankings, favorites migration and six-language metadata include India. Sitemap now has 888 canonical entries.
- Public API edge cache honors remaining API freshness: quotes/prices at most 3s, metadata 60s, candles 120s, healthy ranking snapshots at most 30m. Writes, credentials, partial/error/stale/degraded/private responses bypass cache. Query and Worker version isolate cache entries; client address forwarding is normalized at the Cloudflare edge.
- Local workerd verifies MISS then HIT for quotes, metadata and candles; degraded rankings bypass caching. Quote requests measured 338ms then 6ms. Hashed static files receive one-year immutable browser caching; logos/icons/banners receive one day in browsers and 30 days on CDN.
- All 888 sitemap URLs pass local workerd HTTP/canonical checks. Next/OpenNext build and TypeScript pass. ESLint has zero errors and 14 existing warnings. Automated tests: 73 total, 72 passed, one Redis integration skip. Compressed Worker is 2,621 KiB, within the free limit. Tests cover cache freshness, isolation, failure recovery, writes/credentials, trusted addresses and category/favorites migration.

# Catalog and Chinese category release — 2026-11-14

- Production Next.js 16.4.6 and OpenNext 1.20.17 builds and TypeScript passed. ESLint reports no errors and 14 existing warnings.
- Automated suite: 68 tests, 67 passed, one existing Redis integration test skipped because local Redis binaries are unavailable. Catalog lifecycle, Chinese classification, favorites migration, measured category rankings, all six locales, canonical/hreflang and sitemap are covered.
- Local production HTTP checks passed for the Chinese category, both additions, all five indices, live ticker, both new candle symbols and the 882-entry sitemap. Live TTWO and MUU quotes are positive.
- Real Chrome verification used ggg (Profile 6) with the matching extension token. Chinese category shows eight rows, quotes and Chinese badges. At 390px width the mobile menu navigates to Chinese Stocks and the document has no horizontal overflow. A mobile screenshot was visually inspected. Local ranking is degraded without production Redis credentials; production ranking requires the existing Upstash secrets.
- Existing Vercel project confirmed via GitHub deployment status: `able-s-projects1/nightticker`, source `40e734c3aecf439f2475bf48161443d2edad3973`, serves `www.nightticker.com`. Vercel is paused for Function Invocations until 2026-12-11.
- Existing Cloudflare target confirmed: `nightticker.lemoningz55.workers.dev`, account ID `b3d3658581bd5bc5dfe0d9f411c3a9c3`, connected to `ableroyruy/nightticker` main. Its existing automatic OpenNext build succeeded; the paused local vinext experiment is not part of this release.
- Explicit Cloudflare config replaces automatic migration, with isolated preview bindings and read-only static prerender cache. Local workerd checks pass for CN, TTWO, MUU, sitemap, social images, Apple icon and apex-to-www 308 redirect. Dry-run Worker gzip is 2,619 KiB, below the free-plan 3 MiB limit.
- Published via merged PR #1 at main `8510895f490678de10ca9a1537347f9cdd14b0a4`; Cloudflare production build `a129883f-82e8-40e5-aa0f-d30b0ad01228` succeeded. Zone is active and its universal SSL certificate is active. HTTPS on www returns 200 through Cloudflare; apex is configured to redirect to www. Existing Upstash credentials still require authenticated access before ranking storage can be connected.

# Verification — 2026-11-01

## Current uncommitted improvement release

- Reviewed plan: docs/implementation-review-plan.md. Design/UI/SEO plan revisions
  were approved; independent technical review findings were corrected and reviewed
  again. These are not substitutes for actual browser or deployment checks.
- Overall plus 9 category ranking groups share the existing event and bucket data.
  No fabricated zero-view ranking, category-switch aggregation request, or extra
  per-category Redis key was introduced. Cache compatibility and age limits are
  covered by regression tests. Budget/payload tradeoffs: docs/ranking-cache.md.
- All 120 source descriptions were independently compared with the supplier's
  specification rows, including aliases and two live pre-IPO entries; the existing
  HO description retains equivalent alias wording. See docs/product-source-review.md.
- Full descriptions stay visible in all locales. Detail hierarchy is title, price,
  rank, chart, product explanation. Chart captions show five-minute candles over
  six hours, with compact labels in cards and localized labels in all six languages.
- 64 tests passed with zero skipped, including isolated real Redis Lua execution,
  category grouping/history, cache recovery/expiry, favorites migration failures,
  search/IME event behavior, language query retention, chart axes/resize/cleanup,
  small-price precision, Korean midnight and New York repeated DST hours.
- ESLint: zero errors, 14 pre-existing warnings. Final production build passed,
  including TypeScript and 882 generated pages, with detailed chart axes included.
- Local production crawl: all 864 unique sitemap URLs returned 200, self-canonical,
  seven language alternate links, and initial product HTML for stock pages, with
  concurrency limited to four. Personal pages, filter queries and unsupported
  symbols are excluded. Sitemap has no unsupported modification dates.
- Lowercase market redirects preserve queries; unsupported details return 404;
  favorites expose noindex. The final English static-prefix redirect was corrected
  from 307 to 308; `/en/popular?category=KR` now passes the real HTTP recheck with
  a conflicting Korean language cookie and Japanese Accept-Language header.
- Detail-only chart price/time axes, a subtle horizontal grid, supplier-derived
  quote unit, browser timezone/UTC offsets, date range and separately labelled
  last-candle price are implemented. Compact axes remain hidden. No market API,
  Redis path or new package was introduced for charts. An independent technical
  review found a DST-label-spacing defect; it was fixed, regression tested and
  reviewed again. Actual narrow-screen axis readability still requires ggg.
- Rollback baseline: commit `11ddb4b`, successful existing Vercel deployment
  `GCmwrhKhHy1SH2TaKBExrfS9Exsz` in `able-s-projects1/nightticker`.
- **Not complete:** ggg (Profile 6) has no matching Playwright extension in its
  profile settings and extension tools did not connect. Native AppleScript JS is
  disabled as well. No alternative profile was used. Actual layout, native IME,
  keyboard/VoiceOver/zoom and browser network interaction remain unverified.
- **Release decision:** after being informed that actual ggg verification remained
  incomplete, the user explicitly directed committing, pushing and deploying
  immediately. Proceed with the recorded browser limitation; do not represent
  automated tests or HTTP checks as completed visual/browser verification.

## Previously deployed catalog/cache release

- Active reference assets: 120 (53 additions, 9 unsupported removed from the former 76-entry catalog).
- Supplier identities/descriptions checked against the official trade.xyz specification indexes; ANT is Anthropic, not Ant Group.
- Independent supervisor reviewed catalog/SEO, market caches and ranking durability. Findings were fixed and reviewed again.
- Production Next.js build passed; TypeScript passed; ESLint has no errors (21 pre-existing warnings).
- 18 tests passed, zero skipped, including real isolated Redis Lua integration. Command: `REDIS_TEST_BIN=/tmp/redis-7.4.2/src node --test tests/*.test.mjs` (Redis binaries are local test infrastructure, not a repository dependency).
- Local production HTTP checks passed: Qualcomm/Anthropic details, unsupported VIX/uranium404, sitemap, ticker, QCOM/SNDK candles.
- Browser verification is restricted to Chrome profile ggg. It has no Playwright extension installed; browser automation was not completed. No other profile was used for verification.
- Operational Redis usage/limits were unavailable in the current Vercel CLI account. Command-cost model and deployment caveats are in ranking-cache.md. Production savings are not claimed.
