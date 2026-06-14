'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useFavorites } from '@/lib/context/FavoritesContext';
import { AssetCard } from '@/components/market/AssetCard';
import { MarketAsset } from '@/lib/types/market';
import { TickerData } from '@/lib/hooks/useHyperliquidTicker';
import { stocks } from '@/lib/markets/stocks';

interface FavoritesSectionProps {
  tickers: Record<string, TickerData>;
}

export function FavoritesSection({ tickers }: FavoritesSectionProps) {
  const t = useTranslations('favorites');
  const locale = useLocale();
  const { favorites, isLoaded } = useFavorites();

  if (!isLoaded) {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="w-1 h-5 bg-yellow-500 rounded-full" />
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

  if (favorites.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="w-1 h-5 bg-yellow-500 rounded-full" />
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

  // Convert favorites to MarketAsset format with ticker data
  const favoriteAssets: MarketAsset[] = favorites.map((fav) => {
    const ticker = tickers[fav.symbol];
    const stock = stocks.find((s) => s.symbol === fav.symbol);
    const slug = fav.slug || stock?.slug || fav.symbol.toLowerCase();

    return {
      symbol: fav.symbol,
      name: fav.name,
      nameKo: fav.nameKo,
      nameJa: fav.nameJa,
      nameZh: fav.nameZh,
      namePt: fav.namePt,
      nameEs: fav.nameEs,
      slug,
      market: fav.market,
      price: ticker?.price ?? null,
      prevDayPx: ticker?.prevDayPx ?? null,
      change24h: ticker?.change24h ?? null,
      changePercent24h: ticker?.changePercent24h ?? null,
      hyperliquidSymbol: stock?.hyperliquidSymbol,
    };
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="w-1 h-5 bg-yellow-500 rounded-full" />
          {t('title')}
        </h2>
        <span className="text-sm text-muted-foreground">
          {favorites.length} {t('itemCount')}
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
