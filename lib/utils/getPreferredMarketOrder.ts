'use client';

import { MarketType } from '@/lib/types/market';

const MARKET_PREFERENCE_KEY = 'nightticker_market_preference';

export type MarketOrder = 'KR_FIRST' | 'US_FIRST';

export function detectUserMarketPreference(): MarketOrder {
  // Check localStorage first
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(MARKET_PREFERENCE_KEY);
    if (stored === 'KR_FIRST' || stored === 'US_FIRST') {
      return stored;
    }
  }

  // Check browser language
  if (typeof navigator !== 'undefined') {
    const lang = navigator.language?.toLowerCase() || '';
    if (lang === 'ko' || lang === 'ko-kr' || lang.startsWith('ko-')) {
      return 'KR_FIRST';
    }
  }

  // Check timezone
  if (typeof Intl !== 'undefined') {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone === 'Asia/Seoul') {
        return 'KR_FIRST';
      }
    } catch {
      // Ignore timezone detection errors
    }
  }

  // Default to US first
  return 'US_FIRST';
}

export function saveMarketPreference(preference: MarketOrder): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MARKET_PREFERENCE_KEY, preference);
  }
}

export function getMarketOrder(locale: string): MarketOrder {
  // If locale is explicitly set to Korean, prefer Korean market
  if (locale === 'ko') {
    return 'KR_FIRST';
  }

  // Otherwise, detect from browser settings
  return detectUserMarketPreference();
}

export function sortMarketsByPreference<T extends { market: MarketType }>(
  items: T[],
  order: MarketOrder
): T[] {
  const orderMap: Record<MarketType, number> =
    order === 'KR_FIRST'
      ? { KR: 0, US: 1, CRYPTO: 2 }
      : { US: 0, KR: 1, CRYPTO: 2 };

  return [...items].sort((a, b) => {
    return (orderMap[a.market] ?? 3) - (orderMap[b.market] ?? 3);
  });
}
