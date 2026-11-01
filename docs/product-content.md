# Reviewed product content

The 120 active markets remain a static reviewed catalog. No unsupported market,
category ID, favorite key, slug or runtime source was added for this content work.

Supplier facts were reviewed from:

- https://docs.trade.xyz/perpetuals/specifications-and-schedules/specification-index
- https://docs.trade.xyz/perpetuals/specifications-and-schedules/pre-ipo-specification-index

`product-facts.json` stores underlying product type, underlying region, listing,
quote unit, source text, known ADS ratios, currency conversion, daily fund leverage
and pre-IPO status. Region means the underlying equity or fund exposure, not a claim
about issuer tax domicile or the location of the derivatives venue. U.S.-listed
regional ETFs therefore identify their Korean/Japanese/Taiwanese/Brazilian/Chinese
exposure separately from their U.S. listing. Legacy SPECIAL navigation keys remain
unchanged; Chinese and Indian equities are displayed as equity references with
correct region/listing rather than described as an unknown special instrument.

Source aliases CL/WTIOIL, HO/DIESEL, SMSN/SAMSUNG and SKHX/SKHYNIX are resolved
without changing public symbols or URLs. SKHY is separate from SKHX: its ADS ratio
is 0.1 common share. Other disclosed ADS ratios include TSM/UMC 5, BABA 8, ARM/NOK 1.
ANT and OURA remain pre-IPO; proposed Nasdaq symbols in supplier descriptions are
not displayed as completed listings in the structured listing field.

Each of the 120 markets has meaningful static content in six languages. Localized
summaries, product labels, quote units and notes are derived from the reviewed
facts and translated activity/fund-exposure phrases. They are summaries, not a claim
of a verbatim translation of every source paragraph. The complete English supplier
description remains in server-rendered HTML (the primary English paragraph, or an
always-visible English source section in other languages). Previously verified supplier
descriptions were retained unchanged. No internal `xyz:` API identifiers appear in
the product component. All content is static; rendering makes no API or Redis calls.

SOXL/KORU fund leverage is daily 3x and SNXX daily 2x. Localized notes distinguish
fund daily reset/compounding from derivatives margin leverage. STRC is preferred
stock, BOT a closed-end investment company, and ASML a New York Registry Share.
FX orientation (notably JPY per USD), commodity units and native index-point units
are preserved rather than formatting every product as USD per share.

Run `node --test tests/product-info.test.mjs` to validate all 720 localized product
renders, full source retention, absence of internal API identifiers, country/type
separation and the ADS/pre-IPO/leverage/FX edge cases.
