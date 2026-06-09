import { MetadataRoute } from 'next';
import { getAllSymbols } from '@/lib/markets/stocks';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nightticker.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const symbols = getAllSymbols();
  const locales = ['en', 'ko'];

  // Static pages
  const staticPages = [
    '',
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
          },
        },
      });
    }
  }

  // Add market pages for each locale
  for (const locale of locales) {
    for (const symbol of symbols) {
      const prefix = locale === 'en' ? '' : `/${locale}`;
      routes.push({
        url: `${baseUrl}${prefix}/markets/${symbol}`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 0.9,
        alternates: {
          languages: {
            en: `${baseUrl}/markets/${symbol}`,
            ko: `${baseUrl}/ko/markets/${symbol}`,
          },
        },
      });
    }
  }

  return routes;
}
