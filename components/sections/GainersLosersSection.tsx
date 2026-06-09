'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
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
  const locale = useLocale();

  const marketLabels: Record<MarketType, { en: string; ko: string }> = {
    KR: { en: 'Korea Market', ko: '한국시장' },
    US: { en: 'US Market', ko: '미국시장' },
    INDEX: { en: 'Index', ko: '지수' },
  };

  const marketLabel =
    locale === 'ko' ? marketLabels[market].ko : marketLabels[market].en;

  const displayGainers = gainers.slice(0, limit);
  const displayLosers = losers.slice(0, limit);

  return (
    <div className="space-y-8">
      {/* Market Header */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'h-8 w-1 rounded-full',
            market === 'KR' && 'bg-blue-500',
            market === 'US' && 'bg-purple-500',
            market === 'INDEX' && 'bg-emerald-500'
          )}
        />
        <h2 className="text-2xl font-bold">{marketLabel}</h2>
      </div>

      {/* Gainers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gain" />
            {t('topGainers')}
          </h3>
          <Link href={`/gainers?market=${market.toLowerCase()}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              {t('viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-loss" />
            {t('topLosers')}
          </h3>
          <Link href={`/losers?market=${market.toLowerCase()}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              {t('viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

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
