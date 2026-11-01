import type { Metadata } from 'next';

export const SEO_LOCALES = ['en', 'ko', 'ja', 'zh', 'pt', 'es'] as const;
export type SeoLocale = typeof SEO_LOCALES[number];
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nightticker.com').replace(/\/+$/, '');
const ogLocales: Record<SeoLocale, string> = { en: 'en_US', ko: 'ko_KR', ja: 'ja_JP', zh: 'zh_CN', pt: 'pt_BR', es: 'es_ES' };
export function seoLocale(value: string): SeoLocale {
  return SEO_LOCALES.includes(value as SeoLocale) ? value as SeoLocale : 'en';
}
export function localizedUrl(locale: string, pathname = ''): string {
  const path = pathname === '/' ? '' : pathname.replace(/\/+$/, '');
  return `${SITE_URL}${locale === 'en' ? '' : `/${seoLocale(locale)}`}${path}`;
}
export function languageAlternates(pathname = ''): Record<string, string> {
  return Object.fromEntries([...SEO_LOCALES.map(locale => [locale, localizedUrl(locale, pathname)]), ['x-default', localizedUrl('en', pathname)]]);
}
export function pageMetadata(locale: string, pathname: string, title: string, description: string, keywords?: string[]): Metadata {
  const language = seoLocale(locale);
  const brand = language === 'ko' ? '나이트티커' : language === 'ja' ? 'ナイトティッカー' : 'NightTicker';
  // Titles passed by older routes may already include the localized brand.
  const withoutSuffix = title.replace(/\s*\|\s*(?:NightTicker|나이트티커|ナイトティッカー)$/i, '');
  const brandedTitle = /NightTicker|나이트티커|ナイトティッカー/i.test(withoutSuffix) ? withoutSuffix : `${withoutSuffix} | ${brand}`;
  return {
    title: { absolute: brandedTitle },
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: localizedUrl(language, pathname), languages: languageAlternates(pathname) },
    openGraph: { type: 'website', title: brandedTitle, description, url: localizedUrl(language, pathname), siteName: brand, locale: ogLocales[language], alternateLocale: SEO_LOCALES.filter(item => item !== language).map(item => ogLocales[item]) },
    twitter: { card: 'summary_large_image', title: brandedTitle, description },
  };
}

// Only canonical market paths are case-insensitive. Preserve the locale and query
// in the caller's URL object; do not lowercase arbitrary slugs or API paths.
export function canonicalMarketPath(pathname: string): string | null {
  const match = pathname.match(/^\/(?:((?:en|ko|ja|zh|pt|es))\/)?(stock|category)\/([^/]+)\/?$/i);
  if (!match) return null;
  const [, rawLocale, section, slug] = match;
  const locale = rawLocale?.toLowerCase();
  const prefix = locale && locale !== 'en' ? `/${locale}` : '';
  const canonical = `${prefix}/${section.toLowerCase()}/${slug.toLowerCase()}`;
  return pathname === canonical ? null : canonical;
}
