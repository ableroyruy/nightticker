'use client';

import { memo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { MarketAsset, MarketType } from '@/lib/types/market';
import { PriceDisplay, PriceChange } from '@/components/ui/price-change';
import { FavoriteButton } from '@/components/ui/favorite-button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useFavorites } from '@/lib/context/FavoritesContext';
import { useCandleData } from '@/lib/hooks/useCandleData';

const MiniChart = dynamic(() => import('./MiniChart').then((mod) => mod.MiniChart), {
  ssr: false,
  loading: () => <Skeleton className="w-[180px] h-[72px] rounded" />,
});

interface AssetCardProps {
  asset: MarketAsset;
  rank?: number;
  showMarketBadge?: boolean;
  className?: string;
}

function AssetCardInner({
  asset,
  rank,
  showMarketBadge = true,
  className,
}: AssetCardProps) {
  const locale = useLocale();
  const { isFavorite, toggleFavorite } = useFavorites();

  // Chart data
  const candleSymbol = asset.hyperliquidSymbol?.replace('xyz:', '') ?? asset.symbol;
  const { candles, loading: chartLoading, error: chartError } = useCandleData(candleSymbol);

  // Use allMids-based price from props (real-time)
  const displayPrice = asset.price;
  const displayChange24h = asset.change24h;
  const displayChangePercent24h = asset.changePercent24h;

  const displayName =
    locale === 'ko' && asset.nameKo ? asset.nameKo :
    locale === 'ja' && asset.nameJa ? asset.nameJa :
    locale === 'zh' && asset.nameZh ? asset.nameZh :
    locale === 'pt' && asset.namePt ? asset.namePt :
    locale === 'es' && asset.nameEs ? asset.nameEs :
    asset.name;
  const isFav = isFavorite(asset.symbol, asset.market);

  const marketBadgeColors: Record<MarketType, string> = {
    KR: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    US: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    JP: 'bg-red-500/20 text-red-400 border-red-500/30',
    INDEX: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    ETF: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    COMMODITY: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    FX: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    SPECIAL: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    SEMICONDUCTOR: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  };

  const marketFlags: Record<MarketType, string> = {
    KR: '🇰🇷',
    US: '🇺🇸',
    JP: '🇯🇵',
    INDEX: '📊',
    ETF: '📈',
    COMMODITY: '🛢️',
    FX: '💱',
    SPECIAL: '⚡',
    SEMICONDUCTOR: '💎',
  };

  const marketLabels: Record<MarketType, string> = {
    KR: locale === 'ko' ? '한국' : locale === 'ja' ? '韓国' : locale === 'zh' ? '韩国' : 'KR',
    US: locale === 'ko' ? '미국' : locale === 'ja' ? '米国' : locale === 'zh' ? '美国' : 'US',
    JP: locale === 'ko' ? '일본' : locale === 'ja' ? '日本' : locale === 'zh' ? '日本' : 'JP',
    INDEX: locale === 'ko' ? '지수' : locale === 'ja' ? '指数' : locale === 'zh' ? '指数' : 'Index',
    ETF: 'ETF',
    COMMODITY: locale === 'ko' ? '원자재' : locale === 'ja' ? '商品' : locale === 'zh' ? '商品' : 'Commodity',
    FX: locale === 'ko' ? '통화' : locale === 'ja' ? '通貨' : locale === 'zh' ? '外汇' : 'FX',
    SPECIAL: locale === 'ko' ? '특별' : locale === 'ja' ? '特別' : locale === 'zh' ? '特殊' : 'Special',
    SEMICONDUCTOR: locale === 'ko' ? '반도체' : locale === 'ja' ? '半導体' : locale === 'zh' ? '半导体' : 'Semiconductor',
  };

  const href = `/stock/${asset.slug}`;
  const prefix = locale === 'en' ? '' : `/${locale}`;

  return (
    <Link href={`${prefix}${href}`} className="block group">
      <div
        className={cn(
          'glass-card glass-card-hover rounded-2xl p-4 h-full cursor-pointer',
          'transition-all duration-200 active:scale-[0.98]',
          'group-hover:border-primary/30',
          className
        )}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            {rank && (
              <span className="text-xs font-medium text-muted-foreground w-5">
                #{rank}
              </span>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold truncate">{displayName}</span>
                {showMarketBadge && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] px-1.5 py-0',
                      marketBadgeColors[asset.market]
                    )}
                  >
                    <span className="mr-0.5">{marketFlags[asset.market]}</span>
                    {marketLabels[asset.market]}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{asset.symbol}</p>
            </div>
          </div>
          <FavoriteButton
            isFavorite={isFav}
            onToggle={() =>
              toggleFavorite({
                symbol: asset.symbol,
                market: asset.market,
                name: asset.name,
                nameKo: asset.nameKo,
                slug: asset.slug,
              })
            }
            size="sm"
          />
        </div>

        {/* Price and Chart Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Price and Change */}
          <div className="space-y-1 min-w-0 flex-shrink-0">
            <PriceDisplay
              price={displayPrice}
              change={displayChange24h}
              changePercent={displayChangePercent24h}
              size="md"
              showChange={false}
            />

            <div className="flex items-center gap-2">
              <PriceChange
                value={displayChangePercent24h ?? null}
                type="percent"
                size="sm"
                showBackground
              />
            </div>
          </div>

          {/* Mini Chart */}
          <div className="flex-shrink-0">
            <MiniChart
              candles={candles}
              loading={chartLoading}
              error={chartError}
              width={180}
              height={72}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

// Export directly (memo was causing issues with chart loading)
export const AssetCard = AssetCardInner;
