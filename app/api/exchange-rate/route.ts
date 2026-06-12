import { NextResponse } from 'next/server';
import { CurrencyCode, currencyList } from '@/lib/constants/currencies';
import { ExchangeRate, ExchangeRateResponse } from '@/lib/types/exchange-rate';

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const FREECURRENCY_API_KEY = process.env.FREECURRENCY_API_KEY;
const FREECURRENCY_API_URL = 'https://api.freecurrencyapi.com/v1/latest';

// In-memory cache
interface CacheData {
  rates: Record<CurrencyCode, number>;
  previousRates: Record<CurrencyCode, number> | null;
  lastFetch: number;
  lastPreviousUpdate: number;
}

let cache: CacheData = {
  rates: {
    USD: 1,
    KRW: 1380,
    JPY: 157,
    CNY: 7.24,
    EUR: 0.92,
    BRL: 5.1,
  },
  previousRates: null,
  lastFetch: 0,
  lastPreviousUpdate: 0,
};

// Fallback rates (used when API is unavailable)
const fallbackRates: Record<CurrencyCode, number> = {
  USD: 1,
  KRW: 1380,
  JPY: 157,
  CNY: 7.24,
  EUR: 0.92,
  BRL: 5.1,
};

async function fetchRatesFromAPI(): Promise<Record<CurrencyCode, number> | null> {
  if (!FREECURRENCY_API_KEY) {
    console.warn('FREECURRENCY_API_KEY not set, using fallback rates');
    return null;
  }

  try {
    const currencies = currencyList.filter((c) => c !== 'USD').join(',');
    const url = `${FREECURRENCY_API_URL}?apikey=${FREECURRENCY_API_KEY}&base_currency=USD&currencies=${currencies}`;

    const response = await fetch(url, {
      next: { revalidate: CACHE_DURATION / 1000 },
    });

    if (!response.ok) {
      console.error('Exchange rate API error:', response.status);
      return null;
    }

    const data = await response.json();
    const rates: Partial<Record<CurrencyCode, number>> = { USD: 1 };

    for (const code of currencyList) {
      if (code === 'USD') continue;
      if (data.data && data.data[code]) {
        rates[code] = data.data[code];
      }
    }

    return rates as Record<CurrencyCode, number>;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    return null;
  }
}

export async function GET() {
  const now = Date.now();
  const shouldRefresh = now - cache.lastFetch > CACHE_DURATION;

  if (shouldRefresh) {
    const newRates = await fetchRatesFromAPI();

    if (newRates) {
      // Update previous rates every 24 hours for change calculation
      const shouldUpdatePrevious = now - cache.lastPreviousUpdate > 24 * 60 * 60 * 1000;

      if (shouldUpdatePrevious || !cache.previousRates) {
        cache.previousRates = { ...cache.rates };
        cache.lastPreviousUpdate = now;
      }

      cache.rates = newRates;
      cache.lastFetch = now;
    } else if (!cache.lastFetch) {
      // First load with no API - use fallback
      cache.rates = fallbackRates;
      cache.lastFetch = now;
    }
  }

  // Build response
  const rates: ExchangeRate[] = currencyList.map((code) => {
    const rate = cache.rates[code];
    const previousRate = cache.previousRates?.[code] ?? null;
    const change = previousRate !== null ? rate - previousRate : null;
    const changePercent =
      previousRate !== null && previousRate !== 0
        ? ((rate - previousRate) / previousRate) * 100
        : null;

    return {
      currency: code,
      rate,
      previousRate,
      change,
      changePercent,
    };
  });

  const response: ExchangeRateResponse = {
    base: 'USD',
    rates,
    updatedAt: new Date(cache.lastFetch || now).toISOString(),
    nextUpdate: new Date((cache.lastFetch || now) + CACHE_DURATION).toISOString(),
  };

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=60',
    },
  });
}
