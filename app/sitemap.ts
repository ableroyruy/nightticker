import { MetadataRoute } from 'next';
import { getAllSlugs } from '@/lib/markets/stocks';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nightticker.com';

// Category slugs that have stocks
const categories = ['us', 'kr', 'jp', 'index', 'etf', 'commodity', 'fx', 'special', 'semiconductor'];

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getAllSlugs();
  const locales = ['en', 'ko', 'ja', 'zh', 'pt', 'es'];

  // Static pages
  const staticPages = [
    '',
    '/favorites',
    '/gainers',
    '/losers',
    '/overnight-prices',
    '/weekend-prices',
    '/holiday-prices',
    '/us-market-hours',
    '/korea-market-hours',
    '/how-data-works',
    '/what-is-hyperliquid',
    '/about',
    '/disclaimer',
    '/privacy',
    '/terms',
  ];

  const routes: MetadataRoute.Sitemap = [];

  // Add static pages for each locale
  for (const locale of locales) {
    for (const page of staticPages) {
      const prefix = locale === 'en' ? '' : `/${locale}`;
      routes.push({
        url: `${baseUrl}${prefix}${page}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: page === '' ? 1.0 : 0.8,
        alternates: {
          languages: {
            en: `${baseUrl}${page}`,
            ko: `${baseUrl}/ko${page}`,
            ja: `${baseUrl}/ja${page}`,
            zh: `${baseUrl}/zh${page}`,
            pt: `${baseUrl}/pt${page}`,
            es: `${baseUrl}/es${page}`,
          },
        },
      });
    }
  }

  // Add category pages for each locale
  for (const locale of locales) {
    for (const category of categories) {
      const prefix = locale === 'en' ? '' : `/${locale}`;
      routes.push({
        url: `${baseUrl}${prefix}/category/${category}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.85,
        alternates: {
          languages: {
            en: `${baseUrl}/category/${category}`,
            ko: `${baseUrl}/ko/category/${category}`,
            ja: `${baseUrl}/ja/category/${category}`,
            zh: `${baseUrl}/zh/category/${category}`,
            pt: `${baseUrl}/pt/category/${category}`,
            es: `${baseUrl}/es/category/${category}`,
          },
        },
      });
    }
  }

  // Add stock pages for each locale
  for (const locale of locales) {
    for (const slug of slugs) {
      const prefix = locale === 'en' ? '' : `/${locale}`;
      routes.push({
        url: `${baseUrl}${prefix}/stock/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 0.9,
        alternates: {
          languages: {
            en: `${baseUrl}/stock/${slug}`,
            ko: `${baseUrl}/ko/stock/${slug}`,
            ja: `${baseUrl}/ja/stock/${slug}`,
            zh: `${baseUrl}/zh/stock/${slug}`,
            pt: `${baseUrl}/pt/stock/${slug}`,
            es: `${baseUrl}/es/stock/${slug}`,
          },
        },
      });
    }
  }

  return routes;
}
