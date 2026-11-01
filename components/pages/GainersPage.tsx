'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useHyperliquidTicker } from '@/lib/hooks/useHyperliquidTicker';
import { stocks } from '@/lib/markets/stocks';
import { AssetTable } from '@/components/market/AssetTable';
import { ConnectionStatus } from '@/components/ui/connection-status';
import { ComplianceNotice } from '@/components/common/ComplianceNotice';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { toMarketAsset } from '@/lib/format-market';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'kr' | 'us' | 'jp' | 'index' | 'etf' | 'commodity' | 'fx' | 'semiconductor' | 'special';

export function GainersPage() {
  const t = useTranslations('pages.gainers');
  const filterT = useTranslations('favorites.filter');
  const sectionsT = useTranslations('sections');
  const { tickers, status, lastUpdate } = useHyperliquidTicker();
  const [filter, setFilter] = useState<FilterType>('all');

  // Convert stocks to MarketAsset format with ticker data
  const allAssets = stocks.map(stock => toMarketAsset(stock, tickers[stock.hyperliquidSymbol.replace(/^xyz:/, '')]));

  // Filter to gainers only (24h positive change)
  const gainers = allAssets
    .filter((a) => a.changePercent24h != null && a.changePercent24h > 0)
    .sort((a, b) => (b.changePercent24h ?? 0) - (a.changePercent24h ?? 0));

  // Apply market filter
  const filteredGainers = gainers.filter((asset) => {
    if (filter === 'all') return true;
    if (filter === 'kr') return asset.market === 'KR';
    if (filter === 'us') return asset.market === 'US';
    if (filter === 'jp') return asset.market === 'JP';
    if (filter === 'index') return asset.market === 'INDEX';
    if (filter === 'etf') return asset.market === 'ETF';
    if (filter === 'commodity') return asset.market === 'COMMODITY';
    if (filter === 'fx') return asset.market === 'FX';
    if (filter === 'special') return asset.market === 'SPECIAL';
    if (filter === 'semiconductor') return asset.market === 'SEMICONDUCTOR' || stocks.find(s => s.symbol === asset.symbol)?.sector === 'Semiconductors';
    return true;
  });

  const categoryT = useTranslations('categories');

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: filterT('all') },
    { key: 'us', label: categoryT('US') },
    { key: 'kr', label: categoryT('KR') },
    { key: 'jp', label: categoryT('JP') },
    { key: 'index', label: categoryT('INDEX') },
    { key: 'etf', label: categoryT('ETF') },
    { key: 'commodity', label: categoryT('COMMODITY') },
    { key: 'fx', label: categoryT('FX') },
    { key: 'special', label: categoryT('SPECIAL') },
    { key: 'semiconductor', label: categoryT('SEMICONDUCTOR') },
  ];

  return (
    <div className="min-h-screen">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 glass-card rounded-lg bg-gain/20 flex items-center justify-center">
              <span className="text-2xl text-gain arrow-bounce">▲</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold break-words">{t('title')}</h1>
              <p className="text-sm text-muted-foreground">{t('description')}</p>
            </div>
          </div>

          <ConnectionStatus status={status} lastUpdate={lastUpdate} />
        </div>

        {/* Filters */}
        <div className="flex items-start gap-2 pb-2">
          <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="flex flex-wrap gap-1">
            {filters.map((f) => (
              <Button
                key={f.key}
                variant={filter === f.key ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
                className={cn(
                  'text-xs whitespace-nowrap',
                  filter === f.key && 'bg-accent'
                )}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        {filteredGainers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="p-6 glass-card rounded-2xl flex items-center justify-center">
              <span className="text-5xl text-muted-foreground">▲</span>
            </div>
            <p className="text-xl font-medium text-muted-foreground">
              {sectionsT('noGainers')}
            </p>
          </div>
        ) : (
          <AssetTable assets={filteredGainers} />
        )}

        {/* Compliance Notice */}
        <ComplianceNotice />
      </div>
    </div>
  );
}
