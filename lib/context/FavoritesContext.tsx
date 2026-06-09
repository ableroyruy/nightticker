'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { FavoriteAsset, MarketType } from '@/lib/types/market';

const STORAGE_KEY = 'nightticker_favorites';

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

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever favorites change
  useEffect(() => {
    if (isLoaded) {
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
        (f) => f.symbol === asset.symbol && f.market === asset.market
      );
      if (exists) return prev;
      return [...prev, { ...asset, addedAt: Date.now() }];
    });
  }, []);

  const removeFavorite = useCallback((symbol: string, market: MarketType) => {
    setFavorites((prev) =>
      prev.filter((f) => !(f.symbol === symbol && f.market === market))
    );
  }, []);

  const toggleFavorite = useCallback((asset: Omit<FavoriteAsset, 'addedAt'>) => {
    setFavorites((prev) => {
      const exists = prev.some(
        (f) => f.symbol === asset.symbol && f.market === asset.market
      );
      if (exists) {
        return prev.filter((f) => !(f.symbol === asset.symbol && f.market === asset.market));
      }
      return [...prev, { ...asset, addedAt: Date.now() }];
    });
  }, []);

  const isFavorite = useCallback(
    (symbol: string, market: MarketType) => {
      return favorites.some((f) => f.symbol === symbol && f.market === market);
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
