'use client';

import { memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { MarketAsset, MarketType } from '@/lib/types/market';
import { PriceDisplay, PriceChange } from '@/components/ui/price-change';
import { FavoriteButton } from '@/components/ui/favorite-button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useFavorites } from '@/lib/context/FavoritesContext';
import { useCandleData } from '@/lib/hooks/useCandleData';
import { useSearchRanking } from '@/lib/context/SearchRankingContext';

const MiniChart = dynamic(() => import('./MiniChart').then((mod) => mod.MiniChart), {
  ssr: false,
  loading: () => <Skeleton className="w-[140px] h-[56px] rounded" />,
});

interface AssetCardProps {
  asset: MarketAsset;
  rank?: number;
  showMarketBadge?: boolean;
  className?: string;
}

// Category-based gradient backgrounds for price/chart area
const marketGradients: Record<MarketType, string> = {
  KR: 'from-blue-500/10 via-blue-600/5 to-transparent',
  US: 'from-purple-500/10 via-purple-600/5 to-transparent',
  JP: 'from-red-500/10 via-rose-600/5 to-transparent',
  INDEX: 'from-emerald-500/10 via-emerald-600/5 to-transparent',
  ETF: 'from-teal-500/10 via-teal-600/5 to-transparent',
  COMMODITY: 'from-amber-500/10 via-orange-600/5 to-transparent',
  FX: 'from-cyan-500/10 via-cyan-600/5 to-transparent',
  SPECIAL: 'from-pink-500/10 via-rose-600/5 to-transparent',
  SEMICONDUCTOR: 'from-violet-500/10 via-purple-600/5 to-transparent',
};

// Category-based accent colors for border glow
const marketAccentBorders: Record<MarketType, string> = {
  KR: 'group-hover:border-blue-500/40 group-hover:shadow-blue-500/10',
  US: 'group-hover:border-purple-500/40 group-hover:shadow-purple-500/10',
  JP: 'group-hover:border-red-500/40 group-hover:shadow-red-500/10',
  INDEX: 'group-hover:border-emerald-500/40 group-hover:shadow-emerald-500/10',
  ETF: 'group-hover:border-teal-500/40 group-hover:shadow-teal-500/10',
  COMMODITY: 'group-hover:border-amber-500/40 group-hover:shadow-amber-500/10',
  FX: 'group-hover:border-cyan-500/40 group-hover:shadow-cyan-500/10',
  SPECIAL: 'group-hover:border-pink-500/40 group-hover:shadow-pink-500/10',
  SEMICONDUCTOR: 'group-hover:border-violet-500/40 group-hover:shadow-violet-500/10',
};

// Category-based subtle glow for price area
const marketGlowColors: Record<MarketType, string> = {
  KR: 'shadow-blue-500/5',
  US: 'shadow-purple-500/5',
  JP: 'shadow-red-500/5',
  INDEX: 'shadow-emerald-500/5',
  ETF: 'shadow-teal-500/5',
  COMMODITY: 'shadow-amber-500/5',
  FX: 'shadow-cyan-500/5',
  SPECIAL: 'shadow-pink-500/5',
  SEMICONDUCTOR: 'shadow-violet-500/5',
};

function AssetCardInner({
  asset,
  rank,
  showMarketBadge = true,
  className,
}: AssetCardProps) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('marketBadge');
  const { isFavorite, toggleFavorite } = useFavorites();
  const { rankings } = useSearchRanking();
  const searchRank = rankings.find((r) => r.symbol === asset.symbol);

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

  const getMarketLabel = (market: MarketType) => t(market);

  const href = `/stock/${asset.slug}`;
  const prefix = locale === 'en' ? '' : `/${locale}`;

  return (
    <Link href={`${prefix}${href}`} className="block group">
      <div
        className={cn(
          'glass-card glass-card-hover rounded-2xl p-3 h-full cursor-pointer overflow-hidden',
          'transition-all duration-300 active:scale-[0.98]',
          'group-hover:shadow-lg',
          marketAccentBorders[asset.market],
          className
        )}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {rank && (
              <span className="text-xs font-medium text-muted-foreground w-5">
                #{rank}
              </span>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold truncate">{displayName}</span>
                <span className="text-xs text-muted-foreground">{asset.symbol}</span>
                {searchRank && searchRank.rank <= 10 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`${prefix}/popular`);
                    }}
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5 transition-colors cursor-pointer',
                      searchRank.rank <= 3
                        ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                        : 'bg-primary/20 text-primary hover:bg-primary/30'
                    )}
                  >
                    #{searchRank.rank}
                  </button>
                )}
                {showMarketBadge && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] px-1.5 py-0',
                      marketBadgeColors[asset.market]
                    )}
                  >
                    <span className="mr-0.5">{marketFlags[asset.market]}</span>
                    {getMarketLabel(asset.market)}
                  </Badge>
                )}
              </div>
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
                nameJa: asset.nameJa,
                nameZh: asset.nameZh,
                namePt: asset.namePt,
                nameEs: asset.nameEs,
                slug: asset.slug,
              })
            }
            size="sm"
          />
        </div>

        {/* Price and Chart Row - Category colored background */}
        <div
          className={cn(
            'relative -mx-3 -mb-3 px-3 py-2 overflow-hidden',
            'bg-gradient-to-r',
            marketGradients[asset.market],
            'rounded-b-2xl',
            'border-t border-border/30'
          )}
        >
          {/* Subtle inner glow effect */}
          <div
            className={cn(
              'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
              'bg-gradient-to-br from-white/5 via-transparent to-transparent'
            )}
          />

          <div className="relative flex items-center justify-between gap-3 overflow-hidden">
            {/* Price and Change */}
            <div className="space-y-1 min-w-0 flex-shrink">
              <PriceDisplay
                price={displayPrice}
                change={displayChange24h}
                changePercent={displayChangePercent24h}
                size="md"
                showChange={false}
                hideCurrency={asset.market === 'INDEX' || asset.market === 'FX'}
              />

              <div className="flex items-center gap-2 flex-wrap">
                {displayChange24h !== null && displayChange24h !== undefined && (
                  <PriceChange
                    value={displayChange24h}
                    type="amount"
                    size="sm"
                    showBackground
                    hideCurrency={asset.market === 'INDEX' || asset.market === 'FX'}
                  />
                )}
                <PriceChange
                  value={displayChangePercent24h ?? null}
                  type="percent"
                  size="sm"
                  showIcon={false}
                />
              </div>
            </div>

            {/* Mini Chart with glow container */}
            <div
              className={cn(
                'flex-shrink-0 max-w-[140px] overflow-hidden rounded-lg',
                'shadow-inner',
                marketGlowColors[asset.market]
              )}
            >
              <MiniChart
                candles={candles}
                loading={chartLoading}
                error={chartError}
                width={140}
                height={56}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Export directly (memo was causing issues with chart loading)
export const AssetCard = AssetCardInner;
