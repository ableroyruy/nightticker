'use client';

import { useState, useEffect, useCallback } from 'react';

export type SectionId =
  | 'favorites'
  | 'US'
  | 'KR'
  | 'SEMICONDUCTOR'
  | 'INDEX'
  | 'ETF'
  | 'COMMODITY'
  | 'FX';

const STORAGE_KEY = 'nightticker-section-order';

// Default order - can be customized based on locale
const DEFAULT_ORDER: SectionId[] = [
  'favorites',
  'US',
  'KR',
  'SEMICONDUCTOR',
  'INDEX',
  'ETF',
  'COMMODITY',
  'FX',
];

const DEFAULT_ORDER_KR: SectionId[] = [
  'favorites',
  'KR',
  'US',
  'SEMICONDUCTOR',
  'INDEX',
  'ETF',
  'COMMODITY',
  'FX',
];

export function useSectionOrder(locale: string = 'en') {
  const [order, setOrder] = useState<SectionId[]>(() => {
    // Use locale-based default initially
    return locale === 'ko' ? DEFAULT_ORDER_KR : DEFAULT_ORDER;
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load order from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SectionId[];
        // Validate that all sections are present
        const defaultSet = new Set(DEFAULT_ORDER);
        const storedSet = new Set(parsed);
        const isValid =
          parsed.length === DEFAULT_ORDER.length &&
          parsed.every((id) => defaultSet.has(id)) &&
          DEFAULT_ORDER.every((id) => storedSet.has(id));

        if (isValid) {
          setOrder(parsed);
        }
      }
    } catch {
      // Invalid stored data, use default
    }
    setIsLoaded(true);
  }, []);

  // Save order to localStorage when it changes
  const updateOrder = useCallback((newOrder: SectionId[]) => {
    setOrder(newOrder);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));
    } catch {
      // Storage not available
    }
  }, []);

  // Reset to default order
  const resetOrder = useCallback(() => {
    const defaultOrder = locale === 'ko' ? DEFAULT_ORDER_KR : DEFAULT_ORDER;
    setOrder(defaultOrder);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage not available
    }
  }, [locale]);

  // Move section to new position
  const moveSection = useCallback((fromIndex: number, toIndex: number) => {
    setOrder((prev) => {
      const newOrder = [...prev];
      const [removed] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, removed);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));
      } catch {
        // Storage not available
      }
      return newOrder;
    });
  }, []);

  return {
    order,
    isLoaded,
    updateOrder,
    resetOrder,
    moveSection,
  };
}
