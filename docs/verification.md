# Verification — 2026-11-01

- Active reference assets: 120 (53 additions, 9 unsupported removed from the former 76-entry catalog).
- Supplier identities/descriptions checked against the official trade.xyz specification indexes; ANT is Anthropic, not Ant Group.
- Independent supervisor reviewed catalog/SEO, market caches and ranking durability. Findings were fixed and reviewed again.
- Production Next.js build passed; TypeScript passed; ESLint has no errors (21 pre-existing warnings).
- 18 tests passed, zero skipped, including real isolated Redis Lua integration. Command: `REDIS_TEST_BIN=/tmp/redis-7.4.2/src node --test tests/*.test.mjs` (Redis binaries are local test infrastructure, not a repository dependency).
- Local production HTTP checks passed: Qualcomm/Anthropic details, unsupported VIX/uranium404, sitemap, ticker, QCOM/SNDK candles.
- Browser verification is restricted to Chrome profile ggg. It has no Playwright extension installed; browser automation was not completed. No other profile was used for verification.
- Operational Redis usage/limits were unavailable in the current Vercel CLI account. Command-cost model and deployment caveats are in ranking-cache.md. Production savings are not claimed.
