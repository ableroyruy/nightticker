import type { MetadataRoute } from 'next';
import type { StockCategory } from '@/lib/providers/types';
import { getAllSlugs, getStocksByCategory, getStocksBySectorForCategory } from '@/lib/markets/stocks';
import { languageAlternates, localizedUrl, SEO_LOCALES } from '@/lib/seo/site';

// No per-route content revision evidence is maintained yet. Omit lastmod rather
// than implying that every document changed at a shared request/build date.
const categories = ['us', 'kr', 'jp', 'index', 'etf', 'commodity', 'fx', 'special', 'semiconductor'];
const staticPages = ['', '/gainers', '/losers', '/popular', '/overnight-prices', '/weekend-prices', '/holiday-prices', '/us-market-hours', '/korea-market-hours', '/how-data-works', '/what-is-hyperliquid', '/about', '/disclaimer', '/privacy', '/terms'];
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [...staticPages, ...categories.filter(category => category === 'semiconductor' ? getStocksBySectorForCategory('Semiconductors').length > 0 : getStocksByCategory(category.toUpperCase() as StockCategory).length > 0).map(category => `/category/${category}`), ...getAllSlugs().map(slug => `/stock/${slug}`)];
  return SEO_LOCALES.flatMap(locale => paths.map(path => ({
    url: localizedUrl(locale, path),
    alternates: { languages: languageAlternates(path) },
  })));
}
