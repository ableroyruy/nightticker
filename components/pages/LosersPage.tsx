'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useHyperliquidTicker } from '@/lib/hooks/useHyperliquidTicker';
import { stocks } from '@/lib/markets/stocks';
import { AssetTable } from '@/components/market/AssetTable';
import { ConnectionStatus } from '@/components/ui/connection-status';
import { ComplianceNotice } from '@/components/common/ComplianceNotice';
import { Button } from '@/components/ui/button';
import { TrendingDown, Filter } from 'lucide-react';
import { MarketAsset, MarketType } from '@/lib/types/market';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'kr' | 'us';

export function LosersPage() {
  const t = useTranslations('pages.losers');
  const filterT = useTranslations('favorites.filter');
  const locale = useLocale();
  const { tickers, status, lastUpdate } = useHyperliquidTicker();
  const [filter, setFilter] = useState<FilterType>('all');

  // Convert stocks to MarketAsset format with ticker data
  const allAssets: MarketAsset[] = stocks.map((stock) => {
    // Ticker keys don't have 'xyz:' prefix
    const tickerKey = stock.hyperliquidSymbol.replace('xyz:', '');
    const ticker = tickers[tickerKey];

    return {
      symbol: stock.symbol,
      name: stock.name,
      nameKo: stock.nameKo,
      slug: stock.slug,
      market: stock.category as MarketType,
      price: ticker?.price ?? null,
      prevDayPx: ticker?.prevDayPx ?? null,
      change24h: ticker?.change24h ?? null,
      changePercent24h: ticker?.changePercent24h ?? null,
      hyperliquidSymbol: stock.hyperliquidSymbol,
    };
  });

  // Filter to losers only
  const losers = allAssets
    .filter((a) => a.changePercent24h != null && a.changePercent24h < 0)
    .sort((a, b) => (a.changePercent24h ?? 0) - (b.changePercent24h ?? 0));

  // Apply market filter
  const filteredLosers = losers.filter((asset) => {
    if (filter === 'all') return true;
    if (filter === 'kr') return asset.market === 'KR';
    if (filter === 'us') return asset.market === 'US';
    return true;
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: filterT('all') },
    { key: 'kr', label: filterT('kr') },
    { key: 'us', label: filterT('us') },
  ];

  return (
    <div className="min-h-screen">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 glass-card rounded-lg bg-loss/20">
              <TrendingDown className="h-6 w-6 text-loss" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('title')}</h1>
              <p className="text-sm text-muted-foreground">{t('description')}</p>
            </div>
          </div>

          <ConnectionStatus status={status} lastUpdate={lastUpdate} />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-1">
            {filters.map((f) => (
              <Button
                key={f.key}
                variant={filter === f.key ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFilter(f.key)}
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

        {/* Content */}
        {filteredLosers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="p-4 glass-card rounded-2xl">
              <TrendingDown className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-xl font-medium text-muted-foreground">
              {locale === 'ko' ? '현재 하락 종목이 없습니다' : 'No losers at this time'}
            </p>
          </div>
        ) : (
          <AssetTable assets={filteredLosers} />
        )}

        {/* Compliance Notice */}
        <ComplianceNotice />
      </div>
    </div>
  );
}
