'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { MarketAsset, MarketType } from '@/lib/types/market';
import { AnimatedAssetGrid } from '@/components/market/AnimatedAssetGrid';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GainersLosersSectionProps {
  market: MarketType;
  gainers: MarketAsset[];
  losers: MarketAsset[];
  limit?: number;
}

export function GainersLosersSection({
  market,
  gainers,
  losers,
  limit = 10,
}: GainersLosersSectionProps) {
  const t = useTranslations('sections');
  const tCategories = useTranslations('categories');

  const marketLabel = tCategories(market);

  const displayGainers = gainers.slice(0, limit);
  const displayLosers = losers.slice(0, limit);

  const gainersCount = gainers.length;
  const losersCount = losers.length;

  return (
    <div className="space-y-3">
      {/* Market Header */}
      <div className="flex items-center justify-between pl-3 pr-1">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'h-4 w-1 rounded-full',
              market === 'KR' && 'bg-blue-500',
              market === 'US' && 'bg-purple-500',
              market === 'JP' && 'bg-red-500',
              market === 'INDEX' && 'bg-emerald-500',
              market === 'ETF' && 'bg-teal-500',
              market === 'COMMODITY' && 'bg-amber-500',
              market === 'FX' && 'bg-cyan-500',
              market === 'SPECIAL' && 'bg-pink-500',
              market === 'SEMICONDUCTOR' && 'bg-violet-500'
            )}
          />
          <h2 className="text-lg font-semibold">{marketLabel}</h2>
          {/* Gainer/Loser count indicators */}
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
            {t('viewAll')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Gainers */}
      <div className="space-y-3">
        <h3 className="text-base font-medium flex items-center gap-2 pl-5">
          <span className="text-sm text-gain arrow-bounce">▲</span>
          {t('topGainers')}
        </h3>

        {displayGainers.length > 0 ? (
          <AnimatedAssetGrid
            assets={displayGainers}
            showRank
            showMarketBadge={false}
            gridId={`${market}-gainers`}
          />
        ) : (
          <div className="glass-card rounded-2xl p-6 text-center">
            <p className="text-muted-foreground">{t('noGainers')}</p>
          </div>
        )}
      </div>

      {/* Losers */}
      <div className="space-y-3">
        <h3 className="text-base font-medium flex items-center gap-2 pl-5">
          <span className="text-sm text-loss arrow-bounce">▼</span>
          {t('topLosers')}
        </h3>

        {displayLosers.length > 0 ? (
          <AnimatedAssetGrid
            assets={displayLosers}
            showRank
            showMarketBadge={false}
            gridId={`${market}-losers`}
          />
        ) : (
          <div className="glass-card rounded-2xl p-6 text-center">
            <p className="text-muted-foreground">{t('noLosers')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
