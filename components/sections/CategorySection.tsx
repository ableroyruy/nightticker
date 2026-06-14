'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { MarketAsset, MarketType } from '@/lib/types/market';
import { AnimatedAssetGrid } from '@/components/market/AnimatedAssetGrid';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CategorySectionProps {
  market: MarketType;
  assets: MarketAsset[];
  limit?: number;
}

export function CategorySection({ market, assets, limit = 10 }: CategorySectionProps) {
  const t = useTranslations('categories');
  const sectionsT = useTranslations('sections');
  const commonT = useTranslations('common');

  const marketLabel = t(market);

  // Sort by change percent (descending - gainers first)
  const sortedAssets = [...assets].sort((a, b) => {
    if (a.changePercent24h == null && b.changePercent24h == null) return 0;
    if (a.changePercent24h == null) return 1;
    if (b.changePercent24h == null) return -1;
    return b.changePercent24h - a.changePercent24h;
  });

  const displayAssets = sortedAssets.slice(0, limit);

  // Get count of gainers and losers for display
  const gainersCount = assets.filter(a => a.changePercent24h != null && a.changePercent24h > 0).length;
  const losersCount = assets.filter(a => a.changePercent24h != null && a.changePercent24h < 0).length;

  return (
    <div className="space-y-6">
      {/* Market Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'h-8 w-1 rounded-full',
              market === 'INDEX' && 'bg-emerald-500',
              market === 'ETF' && 'bg-teal-500',
              market === 'COMMODITY' && 'bg-amber-500',
              market === 'FX' && 'bg-cyan-500',
              market === 'SPECIAL' && 'bg-pink-500',
              market === 'SEMICONDUCTOR' && 'bg-violet-500'
            )}
          />
          <h2 className="text-2xl font-bold">{marketLabel}</h2>
          {/* Small indicator showing gainers/losers count */}
          <div className="flex items-center gap-2 text-sm font-medium">
            {gainersCount > 0 && (
              <span className="flex items-center gap-0.5 text-gain">
                <span className="text-[10px] arrow-bounce">▲</span>
                {gainersCount}
              </span>
            )}
            {losersCount > 0 && (
              <span className="flex items-center gap-0.5 text-loss">
                <span className="text-[10px] arrow-bounce">▼</span>
                {losersCount}
              </span>
            )}
          </div>
        </div>
        <Link href={`/category/${market.toLowerCase()}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            {sectionsT('viewAll')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* All Assets Grid - Sorted by Change % */}
      {displayAssets.length > 0 ? (
        <AnimatedAssetGrid
          assets={displayAssets}
          showRank={false}
          showMarketBadge={false}
          gridId={`${market}-all`}
        />
      ) : (
        <div className="glass-card rounded-2xl p-6 text-center">
          <p className="text-muted-foreground">
            {commonT('noData')}
          </p>
        </div>
      )}
    </div>
  );
}
