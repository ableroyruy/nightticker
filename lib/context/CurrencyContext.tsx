'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { useLocale } from 'next-intl';
import {
  CurrencyCode,
  currencies,
  localeToCurrency,
  formatCurrency,
} from '@/lib/constants/currencies';
import { ExchangeRate, ExchangeRateResponse } from '@/lib/types/exchange-rate';

const STORAGE_KEY = 'nightticker_currency';
const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  rates: ExchangeRate[];
  isLoading: boolean;
  lastUpdated: Date | null;
  convertPrice: (usdPrice: number | null) => number | null;
  formatPrice: (usdPrice: number | null, options?: { compact?: boolean }) => string;
  getRate: (code: CurrencyCode) => ExchangeRate | undefined;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  // Initialize currency from localStorage or locale
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && currencies[stored as CurrencyCode]) {
      setCurrencyState(stored as CurrencyCode);
    } else {
      const defaultCurrency = localeToCurrency[locale] || 'USD';
      setCurrencyState(defaultCurrency);
    }
  }, [locale]);

  // Fetch exchange rates
  const fetchRates = useCallback(async () => {
    try {
      const response = await fetch('/api/exchange-rate');
      if (!response.ok) throw new Error('Failed to fetch rates');

      const data: ExchangeRateResponse = await response.json();
      setRates(data.rates);
      setLastUpdated(new Date(data.updatedAt));
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and interval
  useEffect(() => {
    fetchRates();

    const interval = setInterval(fetchRates, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchRates]);

  // Save currency to localStorage
  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  // Get current rate for selected currency
  const currentRate = useMemo(() => {
    return rates.find((r) => r.currency === currency)?.rate ?? 1;
  }, [rates, currency]);

  // Convert USD price to selected currency
  const convertPrice = useCallback(
    (usdPrice: number | null): number | null => {
      if (usdPrice === null || usdPrice === undefined) return null;
      return usdPrice * currentRate;
    },
    [currentRate]
  );

  // Format price in selected currency
  const formatPrice = useCallback(
    (usdPrice: number | null, options?: { compact?: boolean }): string => {
      const converted = convertPrice(usdPrice);
      return formatCurrency(converted, currency, options);
    },
    [convertPrice, currency]
  );

  // Get rate for specific currency
  const getRate = useCallback(
    (code: CurrencyCode): ExchangeRate | undefined => {
      return rates.find((r) => r.currency === code);
    },
    [rates]
  );

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      rates,
      isLoading,
      lastUpdated,
      convertPrice,
      formatPrice,
      getRate,
    }),
    [currency, setCurrency, rates, isLoading, lastUpdated, convertPrice, formatPrice, getRate]
  );

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <CurrencyContext.Provider
        value={{
          currency: 'USD',
          setCurrency: () => {},
          rates: [],
          isLoading: true,
          lastUpdated: null,
          convertPrice: (p) => p,
          formatPrice: (p) => (p !== null ? `$${p?.toFixed(2)}` : '-'),
          getRate: () => undefined,
        }}
      >
        {children}
      </CurrencyContext.Provider>
    );
  }

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
