# XYZ catalog review — 2026-11-14

Cross-checked the live `metaAndAssetCtxs` and `allMids` (`dex: xyz`) against the official specification and pre-IPO indexes. The approved snapshot is in `tests/fixtures/xyz-markets-2026-11-14.json`.

- All 122 currently active XYZ reference markets are included (previously 120). Added TTWO (Take-Two Interactive) and MUU (Direxion Daily MU Bull 2X Shares). All 120 existing markets remain supported; no active market was deleted merely to change the catalog.
- All 22 upstream retired markets are excluded, including TTF, VOL, IBIDEN, YMTC, ACN, INNOLIGHT, AMEC, CATL, SNAP, NU, MELI, STX and PANW. None were reintroduced from stale descriptions.
- Chinese Stocks (`CN`) contains BABA, MINIMAX, ZHIPU, CXMT, UNITREE, SHEIN, CAMBRICON and GIGADEV. Alibaba remains an NYSE ADS referencing a Chinese company. KSTR remains an ETF; Taiwan equities are not reclassified as China.
- Reclassification applies to home, desktop/mobile navigation, category pages, gainers/losers, favorites, badges, popularity scopes, internal links, six-language metadata and sitemap. Existing favorites are normalized by symbol, preserving order and saved timestamps. Ranking cache versions change; measured view buckets are retained and new-category historical rank movement remains unavailable until a real snapshot exists.
- Index labels follow supplier specifications: XYZ100, Korea 200 and Japan 225. Existing `nasdaq-100`, `kospi-200` and `nikkei-225` detail URLs are retained for saved links. These labels do not claim that every provider reference is an official licensed exchange index. All five active index markets remain included; no additional active index exists in the upstream universe.
- MSTR now displays Strategy. Korean names for listed Chinese equities no longer carry the legacy special-market suffix. Diesel description now matches the provider's DIESEL specification.
- MUU is marked as a daily 2x leveraged ETF in all six languages, with daily reset/compounding disclosure. Its fund identity is cross-checked at https://finance.yahoo.com/quote/MUU/ and TTWO at https://www.take2games.com/ir . The two new markets are not yet listed in the supplier specification index, so their detail pages link the supporting product reference rather than claiming a nonexistent supplier specification.
- Sitemap contains 882 canonical language URLs: `(15 informational/list pages + 10 categories + 122 markets) × 6 languages`. Google recrawling and actual indexing are controlled by the search engine and are not claimed as completed.

Sources:
- https://api.hyperliquid.xyz/info
- https://docs.trade.xyz/perpetuals/specifications-and-schedules/specification-index
- https://docs.trade.xyz/perpetuals/specifications-and-schedules/pre-ipo-specification-index
- https://docs.trade.xyz/perpetuals/markets/equity-indices

# XYZ catalog review — 2026-11-01

Source: https://docs.trade.xyz/perpetuals/specifications-and-schedules/specification-index

Cross-checked against live `metaAndAssetCtxs` and `allMids` (`dex: xyz`).
53 additions, 120 active reference markets, 9 unsupported markets removed; their detail and image URLs return 404.
All new markets carry the supplier specification description on the detail page.
ANT is Anthropic (not Ant Group) and OURA is Oura; both are explicitly marked pre-IPO per https://docs.trade.xyz/perpetuals/specifications-and-schedules/pre-ipo-specification-index .
HO is the provider DIESEL market (New York Harbor ULSD per U.S. gallon). DRAM is the Roundhill Memory ETF.
Non-US/KR/JP equities use the existing SPECIAL category (other reference assets); descriptions identify their underlying exchange and currency conversion. This is not a claim that they are unlisted.
SKHY is a Nasdaq ADS representing one tenth of a Korean common share; SKHX remains the existing separate market. PURRDAT references PURR, BIRD references Smartbird, QNT references Quantinuum. BOT references a closed-end investment company. SOXL/KORU are daily 3x and SNXX daily 2x funds; daily reset/compounding is disclosed.

Removed unsupported markets: URANIUM, ALUMINIUM, DXY, VIX, CORN, WHEAT, KRW, H100, IBOV.

Catalog additions are manually reviewed, not automatically published from upstream symbols. Runtime market metadata also filters newly retired instruments from prices.
