'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { stocks } from '@/lib/markets/stocks';
import { normalizeFavoriteAssets } from '@/lib/markets/favorite-assets';
import { FavoriteAsset, MarketType } from '@/lib/types/market';

const STORAGE_KEY = 'nightticker_favorites';
const BACKUP_KEY = 'nightticker_favorites_before_normalization_v1';

interface FavoritesContextValue {
  favorites: FavoriteAsset[];
  isLoaded: boolean;
  addFavorite: (asset: Omit<FavoriteAsset, 'addedAt'>) => void;
  removeFavorite: (symbol: string, market: MarketType) => void;
  toggleFavorite: (asset: Omit<FavoriteAsset, 'addedAt'>) => void;
  isFavorite: (symbol: string, market: MarketType) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteAsset[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const canPersist = useRef(true);

  // Load from localStorage on mount
  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setFavorites(normalizeFavoriteAssets(JSON.parse(stored), stocks));
          // Preserve the exact old value before any migration or save, including
          // malformed entries. If backup/storage fails, keep this session read-only.
          if (localStorage.getItem(BACKUP_KEY) === null) localStorage.setItem(BACKUP_KEY, stored);
        }
      } catch (error) {
        canPersist.current = false;
        console.error('Failed to load favorites:', error);
      }
      setIsLoaded(true);

    });
    return () => { cancelled = true; };
  }, []);

  // Save to localStorage whenever favorites change
  useEffect(() => {
    if (isLoaded && canPersist.current) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error('Failed to save favorites:', error);
      }
    }
  }, [favorites, isLoaded]);

  const addFavorite = useCallback((asset: Omit<FavoriteAsset, 'addedAt'>) => {
    setFavorites((prev) => {
      const exists = prev.some(
        (f) => f.symbol === asset.symbol
      );
      if (exists) return prev;
      return normalizeFavoriteAssets([...prev, { ...asset, addedAt: Date.now() }], stocks);
    });
  }, []);

  const removeFavorite = useCallback((symbol: string) => {
    setFavorites((prev) =>
      prev.filter((f) => f.symbol !== symbol)
    );
  }, []);

  const toggleFavorite = useCallback((asset: Omit<FavoriteAsset, 'addedAt'>) => {
    setFavorites((prev) => {
      const exists = prev.some(
        (f) => f.symbol === asset.symbol
      );
      if (exists) {
        return prev.filter((f) => f.symbol !== asset.symbol);
      }
      return normalizeFavoriteAssets([...prev, { ...asset, addedAt: Date.now() }], stocks);
    });
  }, []);

  const isFavorite = useCallback(
    (symbol: string) => {
      return favorites.some((f) => f.symbol === symbol);
    },
    [favorites]
  );

  return (
    <FavoritesContext.Provider
      value={{ favorites, isLoaded, addFavorite, removeFavorite, toggleFavorite, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}
