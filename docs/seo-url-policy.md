# SEO URL policy and acceptance matrix

This table fixes the intended production policy. Unit checks do not establish that
the current deployed site already follows it; production-server HTTP and bounded
post-deployment crawl checks remain required. The canonical production origin is
`https://www.nightticker.com` (validated against the production site URL setting).
English uses the unprefixed path; ko/ja/zh/pt/es use their respective prefixes.
Explicit `/en` aliases for home, static documents, rankings, favorites and market
documents all use 308 redirects to the unprefixed English path. Queries are
preserved and the English locale cookie is set, including when a visitor has a
different language cookie or Accept-Language header. Automatic language selection
without an explicit English prefix remains separate, temporary locale negotiation.

| Route class | HTTP | Index directive | Canonical | Sitemap | Purpose |
| --- | --- | --- | --- | --- | --- |
| `/` and each localized home | 200 | index allowed | same language home | yes | Search and public market discovery |
| `/stock/{supported-slug}` | 200 | index allowed | same language, lowercase stable slug | yes | Verified reference instrument facts, original description and quote context |
| `/category/{category}` for nine nonempty categories | 200 | index allowed | same language lowercase category | yes | Crawlable instrument directory and category-specific content |
| `/popular`, `/gainers`, `/losers` | 200 | index allowed | same language base route | yes | Public ranking or performance context; quotes/rankings can be missing or delayed |
| `/popular?category={selection}` | 200, retain query | index allowed, duplicate canonical | same language `/popular` without query | no | Shareable interactive selection; no redirect deleting filter state |
| Other tracking/query variants of public documents | same document | follows base document | base document without tracking/query | no | Avoid query duplicates; do not strip functional queries via redirect |
| `/favorites` in all languages | 200 | **noindex, follow** | same language `/favorites` | **no** | Personal browser state; keep crawlable so noindex can be read |
| Fifteen fixed public routes per language (home included) | 200 | index allowed | same language base route | yes | Public market guidance, data explanation, service and legal information |
| Unsupported/unknown stock or category | **404** | not indexable | no successful replacement document | **no** | Do not substitute another asset or send to home |
| Unsupported stock Open Graph/Twitter image URL | **404** | not an indexable document | not applicable | **no** | Do not return a successful “Not Found” picture |
| Case/default-English/trailing-slash market path alias | redirect to canonical path | alias is not a sitemap document | redirect destination | **no** | Preserve query; permanent path normalization is separate from locale negotiation |
| API routes | API-specific | not a public HTML index target | not applicable | **no** | robots excludes `/api/`; required core document content is server-rendered |
| Static assets, robots, sitemap, share images | resource-specific | not included as HTML content documents | not applicable | **no** | JS/CSS/images remain crawlable; robots links production sitemap |

The fixed public route allowlist is: home, gainers, losers, popular,
overnight-prices, weekend-prices, holiday-prices, us-market-hours,
korea-market-hours, how-data-works, what-is-hyperliquid, about, disclaimer,
privacy, terms. These pages have public explanatory/legal content and are not
personal state or filter copies. If a future page is merely an empty shell or
fails the HTTP/content gate, its inclusion must be reconsidered rather than being
included automatically because a file exists.

With the reviewed 120 active instruments, nine nonempty categories and 15 fixed
public routes, the expected sitemap is **(120 + 9 + 15) × 6 = 864 URLs**. This count
is a consequence of the allowlist, not a target to maintain by inventing URLs.
Sitemap entries use absolute canonical URLs with no query or default `/en` prefix.
Each includes the six reciprocal language alternatives and `x-default` pointing
to the English document. Every language alternate must itself be an allowed,
working, indexable canonical URL.

## Content revision and crawl hints

There is currently no per-document/per-language revision manifest. Consequently
`lastmod` is omitted. A shared build/request date or a fixed date assigned to every
URL is not evidence that each document changed. To add lastmod later, record a
content revision with a traceable change/commit and verify its applicability to
that exact route and language. Quote ticks, cache refreshes and deployment time
alone are not that evidence. `changefreq` and `priority` are also omitted; they do
not guarantee a crawl interval or ranking benefit.

## Canonical, language and redirect checks

- All six language versions use self-canonical and reciprocal hreflang. Repeated
  English supplier text is marked `lang="en"` and does not replace the localized
  core explanation. A localized summary is not presented as a full translation.
- `/popular?category=…` remains usable when directly opened, refreshed, shared,
  switched between languages and navigated with browser history. Canonical is a
  document-duplication signal, not a command to discard the filter state.
- Market-path case normalization and site-wide default-English prefix removal use permanent
  path redirects while cloning the URL to preserve query values. Other locale
  negotiation is handled separately. Verify real server responses with cookie and
  Accept-Language combinations, with no loops or accidental language changes.
- Verify final production origin, protocol and host; preview deployment domains
  must not accidentally replace the production canonical or sitemap origin.
- A noindex page remains readable to crawlers. Do not add `/favorites` to robots
  disallow and thereby prevent the noindex directive from being fetched.

## Initial HTML and structured data gate

The stock document must include its name, localized product context, quote unit,
source and internal navigation in initial server HTML without depending on API
access. Product source text remains visible in full; factual review by another
reviewer is recorded separately. The body and metadata must identify ADS, preferred
stock, ETF, pre-IPO and regional equities accurately. Missing market data must not
be described as a current verified quote. Trading hours, closures and maintenance
must not be replaced with a guarantee of uninterrupted trading.

FAQ JSON-LD must match the displayed questions and answers. Breadcrumb URLs must
match canonical paths. Website/organization schema may use only supported language
and endpoint information; do not invent a site-search endpoint or promise rich
results. JSON script serialization must escape `<` to prevent source content from
terminating the script block.

## Verification and remaining operational evidence

Run `node --test tests/seo-routing.test.mjs tests/catalog-seo.test.mjs` for routing,
metadata, policy exclusions and reciprocal sitemap links. These VM/unit tests are
not substitutes for a production build and HTTP rendering tests. Before final
approval, crawl the generated XML with bounded concurrency, verify all 864 final
responses/canonicals/language alternatives, inspect robots/noindex and representative
initial HTML and JSON-LD, and repeat representative requests after production
Git-linked deployment. Failures, browser gaps and production measurements must be
reported rather than inferred from unit test success.
