'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useHyperliquidTicker } from '@/lib/hooks/useHyperliquidTicker';
import { useFavorites } from '@/lib/context/FavoritesContext';
import { stocks } from '@/lib/markets/stocks';
import { AssetCard } from '@/components/market/AssetCard';
import { ConnectionStatus } from '@/components/ui/connection-status';
import { ComplianceNotice } from '@/components/common/ComplianceNotice';
import { Button } from '@/components/ui/button';
import { Star, Filter } from 'lucide-react';
import { MarketAsset } from '@/lib/types/market';
import { getLocalizedAssetName, toMarketAsset } from '@/lib/format-market';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'kr' | 'us' | 'jp' | 'index' | 'etf' | 'commodity' | 'fx' | 'special' | 'semiconductor';
type SortType = 'added' | 'gainers' | 'losers' | 'name';

export function FavoritesPage() {
  const t = useTranslations('favorites');
  const tCategory = useTranslations('categories');
  const locale = useLocale();
  const { tickers, status, lastUpdate } = useHyperliquidTicker();
  const { favorites, isLoaded } = useFavorites();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('added');

  // Convert favorites to MarketAsset format with ticker data
  const favoriteAssets = favorites.flatMap((fav): MarketAsset[] => {
    const stock = stocks.find((s) => s.symbol === fav.symbol);
    if (!stock) return [];

    return [toMarketAsset(stock, tickers[stock.hyperliquidSymbol.replace(/^xyz:/, '')])];
  });

  // Apply filter
  const filteredAssets = favoriteAssets.filter((asset) => {
    if (filter === 'all') return true;
    if (filter === 'semiconductor') return stocks.find(stock => stock.symbol === asset.symbol)?.sector === 'Semiconductors';
    return asset.market.toLowerCase() === filter;
  });

  // Apply sort
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    if (sort === 'gainers' || sort === 'losers') {
      if (a.changePercent24h == null && b.changePercent24h == null) return 0;
      if (a.changePercent24h == null) return 1;
      if (b.changePercent24h == null) return -1;
    }
    switch (sort) {
      case 'gainers':
        return (b.changePercent24h ?? 0) - (a.changePercent24h ?? 0);
      case 'losers':
        return (a.changePercent24h ?? 0) - (b.changePercent24h ?? 0);
      case 'name':
        return getLocalizedAssetName(a, locale).localeCompare(getLocalizedAssetName(b, locale), locale);
      case 'added':
      default:
        return 0;
    }
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: t('filter.all') },
    { key: 'kr', label: t('filter.kr') },
    { key: 'us', label: t('filter.us') },
    ...(['JP', 'INDEX', 'ETF', 'COMMODITY', 'FX', 'SPECIAL', 'SEMICONDUCTOR'] as const).map(category => ({ key: category.toLowerCase() as FilterType, label: tCategory(category) })),
  ];

  const sorts: { key: SortType; label: string }[] = [
    { key: 'added', label: t('sort.added') },
    { key: 'gainers', label: t('sort.gainers') },
    { key: 'losers', label: t('sort.losers') },
    { key: 'name', label: t('sort.name') },
  ];

  if (!isLoaded) {
    return (
      <div className="min-h-screen">
        <div className="container py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-48 bg-muted rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 glass-card rounded-lg">
              <Star className="h-6 w-6 text-primary fill-primary" />
            </div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
          </div>

          <ConnectionStatus status={status} lastUpdate={lastUpdate} />
        </div>

        {/* Filters and Sort */}
        {favoriteAssets.length > 0 && (
          <div className="flex flex-col gap-4">
            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-wrap gap-1">
                {filters.map((f) => (
                  <Button
                    key={f.key}
                    variant={filter === f.key ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(f.key)}
                    aria-pressed={filter === f.key}
                    className={cn(
                      'text-xs',
                      filter === f.key && 'bg-accent'
                    )}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sort dropdown */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t('sortLabel')}
              </span>
              <div className="flex flex-wrap gap-1">
                {sorts.map((s) => (
                  <Button
                    key={s.key}
                    variant={sort === s.key ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setSort(s.key)}
                    aria-pressed={sort === s.key}
                    className={cn(
                      'text-xs',
                      sort === s.key && 'bg-accent'
                    )}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {sortedAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="p-4 glass-card rounded-2xl">
              <Star className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-xl font-medium text-muted-foreground">
              {t('empty')}
            </p>
            <p className="text-sm text-muted-foreground/70">
              {t('emptyHint')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {sortedAssets.map((asset) => (
              <AssetCard key={asset.symbol} asset={asset} />
            ))}
          </div>
        )}

        {/* Compliance Notice */}
        <ComplianceNotice />
      </div>
    </div>
  );
}
