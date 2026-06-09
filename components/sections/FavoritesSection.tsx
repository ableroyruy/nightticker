'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Star } from 'lucide-react';
import { useFavorites } from '@/lib/hooks/useFavorites';
import { AssetCard } from '@/components/market/AssetCard';
import { MarketAsset } from '@/lib/types/market';
import { TickerData } from '@/lib/hooks/useHyperliquidTicker';

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
          <Star className="h-5 w-5 text-yellow-500" />
          {t('title')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
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
          <Star className="h-5 w-5 text-yellow-500" />
          {t('title')}
        </h2>
        <div className="glass-card rounded-2xl p-8 text-center">
          <Star className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">{t('empty')}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('emptyHint')}</p>
        </div>
      </section>
    );
  }

  // Convert favorites to MarketAsset format with ticker data
  const favoriteAssets: MarketAsset[] = favorites.map((fav) => {
    // Ticker keys are stored without 'xyz:' prefix
    const ticker = tickers[fav.symbol];

    return {
      symbol: fav.symbol,
      name: fav.name,
      nameKo: fav.nameKo,
      market: fav.market,
      price: ticker?.price ?? null,
      prevDayPx: ticker?.prevDayPx ?? null,
      change24h: ticker?.change24h ?? null,
      changePercent24h: ticker?.changePercent24h ?? null,
    };
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          {t('title')}
        </h2>
        <span className="text-sm text-muted-foreground">
          {favorites.length} {locale === 'ko' ? '개' : 'items'}
        </span>
      </div>
      <LayoutGroup id="favorites">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {favoriteAssets.map((asset) => (
              <motion.div
                key={`fav-${asset.symbol}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  layout: { type: 'spring', stiffness: 350, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
              >
                <AssetCard asset={asset} showMarketBadge />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </section>
  );
}
