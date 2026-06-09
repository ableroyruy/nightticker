'use client';

import { useState, useEffect, useCallback } from 'react';
import { FavoriteAsset, MarketType } from '@/lib/types/market';

const STORAGE_KEY = 'nightticker_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteAsset[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as FavoriteAsset[];
        setFavorites(parsed);
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
      // Check if already exists
      const exists = prev.some(
        (f) => f.symbol === asset.symbol && f.market === asset.market
      );
      if (exists) return prev;

      return [
        ...prev,
        {
          ...asset,
          addedAt: Date.now(),
        },
      ];
    });
  }, []);

  const removeFavorite = useCallback((symbol: string, market: MarketType) => {
    setFavorites((prev) =>
      prev.filter((f) => !(f.symbol === symbol && f.market === market))
    );
  }, []);

  const toggleFavorite = useCallback(
    (asset: Omit<FavoriteAsset, 'addedAt'>) => {
      const exists = favorites.some(
        (f) => f.symbol === asset.symbol && f.market === asset.market
      );
      if (exists) {
        removeFavorite(asset.symbol, asset.market);
      } else {
        addFavorite(asset);
      }
    },
    [favorites, addFavorite, removeFavorite]
  );

  const isFavorite = useCallback(
    (symbol: string, market: MarketType) => {
      return favorites.some(
        (f) => f.symbol === symbol && f.market === market
      );
    },
    [favorites]
  );

  const getFavoritesByMarket = useCallback(
    (market: MarketType) => {
      return favorites.filter((f) => f.market === market);
    },
    [favorites]
  );

  return {
    favorites,
    isLoaded,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavoritesByMarket,
  };
}
