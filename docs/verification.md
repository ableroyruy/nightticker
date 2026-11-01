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
