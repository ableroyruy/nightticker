'use client';

import { useTranslations } from 'next-intl';
import { useFavorites } from '@/lib/context/FavoritesContext';
import { AssetCard } from '@/components/market/AssetCard';
import { MarketAsset } from '@/lib/types/market';
import { TickerData } from '@/lib/hooks/useHyperliquidTicker';
import { stocks } from '@/lib/markets/stocks';
import { toMarketAsset } from '@/lib/format-market';

interface FavoritesSectionProps {
  tickers: Record<string, TickerData>;
}

export function FavoritesSection({ tickers }: FavoritesSectionProps) {
  const t = useTranslations('favorites');
  const { favorites, isLoaded } = useFavorites();

  if (!isLoaded) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2 pl-3">
          <span className="w-1 h-4 bg-yellow-500 rounded-full" />
          {t('title')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="glass-card rounded-2xl p-4 h-32 skeleton-shimmer"
            />
          ))}
        </div>
      </section>
    );
  }

  if (favorites.filter(fav => stocks.some(stock => stock.symbol === fav.symbol)).length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2 pl-3">
          <span className="w-1 h-4 bg-yellow-500 rounded-full" />
          {t('title')}
        </h2>
        <div className="glass-card rounded-2xl p-8 text-center">
          <span className="w-2 h-12 bg-muted-foreground/30 rounded-full mx-auto mb-3 block" />
          <p className="text-muted-foreground">{t('empty')}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('emptyHint')}</p>
        </div>
      </section>
    );
  }

  // Resolve canonical names and categories instead of stale local-storage labels.
  const favoriteAssets: MarketAsset[] = favorites.flatMap(fav => {
    const stock = stocks.find(item => item.symbol === fav.symbol);
    return stock ? [toMarketAsset(stock, tickers[stock.hyperliquidSymbol.replace(/^xyz:/, '')])] : [];
  });

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between pl-3 pr-1">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="w-1 h-4 bg-yellow-500 rounded-full" />
          {t('title')}
        </h2>
        <span className="text-sm text-muted-foreground">
          {favoriteAssets.length} {t('itemCount')}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {favoriteAssets.map((asset) => (
          <div
            key={`fav-${asset.symbol}`}
            className="transition-opacity duration-200"
          >
            <AssetCard asset={asset} showMarketBadge />
          </div>
        ))}
      </div>
    </section>
  );
}
