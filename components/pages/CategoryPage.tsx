'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useHyperliquidTicker } from '@/lib/hooks/useHyperliquidTicker';
import { getStocksByCategory, getStocksBySectorForCategory } from '@/lib/markets/stocks';
import { ComplianceNotice } from '@/components/common/ComplianceNotice';
import { ConnectionStatus } from '@/components/ui/connection-status';
import { AssetTable } from '@/components/market/AssetTable';
import { StockCategory } from '@/lib/providers/types';
import { MarketAsset, MarketType } from '@/lib/types/market';
import { Building2, BarChart3, Coins, DollarSign, Cpu } from 'lucide-react';

const categoryIcons: Record<StockCategory, React.ElementType> = {
  US: Building2,
  KR: Building2,
  JP: Building2,
  INDEX: BarChart3,
  ETF: BarChart3,
  COMMODITY: Coins,
  FX: DollarSign,
  SPECIAL: Cpu,
  SEMICONDUCTOR: Cpu,
};

interface CategoryPageProps {
  category: StockCategory;
}

export function CategoryPage({ category }: CategoryPageProps) {
  const t = useTranslations('categories');
  const commonT = useTranslations('common');
  const locale = useLocale();
  const { tickers, status, lastUpdate } = useHyperliquidTicker();

  // SEMICONDUCTOR is a special case - it shows stocks by sector, not category
  const stocks = category === 'SEMICONDUCTOR'
    ? getStocksBySectorForCategory('Semiconductors')
    : getStocksByCategory(category);
  const Icon = categoryIcons[category];

  // Convert stock data to MarketAsset format with live prices
  const assets: MarketAsset[] = stocks.map((stock) => {
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

  // Sort by change percent (gainers first)
  const sortedAssets = [...assets].sort((a, b) => {
    if (a.changePercent24h == null && b.changePercent24h == null) return 0;
    if (a.changePercent24h == null) return 1;
    if (b.changePercent24h == null) return -1;
    return b.changePercent24h - a.changePercent24h;
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border/50 bg-gradient-to-b from-accent/20 to-background">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Icon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{t(category)}</h1>
                <p className="text-muted-foreground mt-1">
                  {sortedAssets.length} {commonT('assets')}
                </p>
              </div>
            </div>
            <ConnectionStatus status={status} lastUpdate={lastUpdate} />
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Assets Table */}
        <AssetTable assets={sortedAssets} />

        {/* Compliance Notice */}
        <ComplianceNotice />
      </div>
    </div>
  );
}
