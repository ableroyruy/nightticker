'use client';

import { MarketType } from '@/lib/types/market';

const LANGUAGE_KEY = 'nightticker_language';

export type MarketOrder = 'KR_FIRST' | 'US_FIRST';
export type SupportedLanguage = 'en' | 'ko';

export function getSavedLanguage(): SupportedLanguage | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem(LANGUAGE_KEY);
  if (saved === 'en' || saved === 'ko') return saved;
  return null;
}

export function saveLanguage(lang: SupportedLanguage): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANGUAGE_KEY, lang);
  }
}

export function detectBrowserLanguage(): SupportedLanguage {
  if (typeof navigator === 'undefined') return 'en';

  const lang = navigator.language?.toLowerCase() || '';
  if (lang === 'ko' || lang === 'ko-kr' || lang.startsWith('ko-')) {
    return 'ko';
  }
  return 'en';
}

export function getPreferredLanguage(): SupportedLanguage {
  // 1. User saved preference
  const saved = getSavedLanguage();
  if (saved) return saved;

  // 2. Browser language
  return detectBrowserLanguage();
}

export function getMarketOrder(locale: string): MarketOrder {
  // Korean = Korea first, English = US first
  return locale === 'ko' ? 'KR_FIRST' : 'US_FIRST';
}

export function sortMarketsByPreference<T extends { market: MarketType }>(
  items: T[],
  order: MarketOrder
): T[] {
  const orderMap: Record<MarketType, number> =
    order === 'KR_FIRST'
      ? { KR: 0, US: 1, CN: 2, IN: 3, JP: 4, INDEX: 5, ETF: 6, COMMODITY: 7, FX: 8, SPECIAL: 9, SEMICONDUCTOR: 10 }
      : { US: 0, KR: 1, CN: 2, IN: 3, JP: 4, INDEX: 5, ETF: 6, COMMODITY: 7, FX: 8, SPECIAL: 9, SEMICONDUCTOR: 10 };

  return [...items].sort((a, b) => {
    return (orderMap[a.market] ?? 99) - (orderMap[b.market] ?? 99);
  });
}
