'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, BarChart3, Coins, DollarSign, Cpu } from 'lucide-react';
import { MarketAsset, MarketType } from '@/lib/types/market';
import { AnimatedAssetGrid } from '@/components/market/AnimatedAssetGrid';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CategorySectionProps {
  market: MarketType;
  assets: MarketAsset[];
  limit?: number;
}

const marketIcons: Record<string, React.ElementType> = {
  INDEX: BarChart3,
  ETF: BarChart3,
  COMMODITY: Coins,
  FX: DollarSign,
  SPECIAL: Cpu,
  SEMICONDUCTOR: Cpu,
};

export function CategorySection({ market, assets, limit = 10 }: CategorySectionProps) {
  const t = useTranslations('categories');
  const locale = useLocale();

  const marketLabels: Record<MarketType, { en: string; ko: string; ja: string; zh: string }> = {
    KR: { en: 'Korea Market', ko: '한국시장', ja: '韓国市場', zh: '韩国市场' },
    US: { en: 'US Market', ko: '미국시장', ja: '米国市場', zh: '美国市场' },
    JP: { en: 'Japan Market', ko: '일본시장', ja: '日本市場', zh: '日本市场' },
    INDEX: { en: 'Indices', ko: '지수', ja: '指数', zh: '指数' },
    ETF: { en: 'ETFs', ko: 'ETF', ja: 'ETF', zh: 'ETF' },
    COMMODITY: { en: 'Commodities', ko: '원자재', ja: 'コモディティ', zh: '大宗商品' },
    FX: { en: 'Currencies', ko: '통화', ja: '通貨', zh: '外汇' },
    SPECIAL: { en: 'Special', ko: '특별', ja: '特別', zh: '特殊' },
    SEMICONDUCTOR: { en: 'Semiconductors', ko: '반도체', ja: '半導体', zh: '半导体' },
  };

  const marketLabel =
    locale === 'ko' ? marketLabels[market].ko :
    locale === 'ja' ? marketLabels[market].ja :
    locale === 'zh' ? marketLabels[market].zh :
    marketLabels[market].en;

  // Sort by change percent (descending - gainers first)
  const sortedAssets = [...assets].sort((a, b) => {
    if (a.changePercent24h == null && b.changePercent24h == null) return 0;
    if (a.changePercent24h == null) return 1;
    if (b.changePercent24h == null) return -1;
    return b.changePercent24h - a.changePercent24h;
  });

  const displayAssets = sortedAssets.slice(0, limit);

  const Icon = marketIcons[market] || BarChart3;

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
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-2xl font-bold">{marketLabel}</h2>
          </div>
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
            {locale === 'ko' ? '전체 보기' : 'View All'}
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
            {locale === 'ko' ? '데이터 없음' : 'No data available'}
          </p>
        </div>
      )}
    </div>
  );
}
