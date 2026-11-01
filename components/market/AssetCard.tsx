'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { getLocalizedAssetName } from '@/lib/format-market';
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
  const t = useTranslations('marketBadge');
  const { isFavorite, toggleFavorite } = useFavorites();
  const { rankings } = useSearchRanking();
  const searchRank = rankings.find((r) => r.symbol === asset.symbol);

  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;
    if (typeof IntersectionObserver === 'undefined') { const id = requestAnimationFrame(() => setVisible(true)); return () => cancelAnimationFrame(id); }
    const observer = new IntersectionObserver(entries => setVisible(entries.some(entry => entry.isIntersecting)), { rootMargin: '160px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  // Chart data
  const candleSymbol = asset.hyperliquidSymbol?.replace('xyz:', '') ?? asset.symbol;
  const { candles, loading: chartLoading, error: chartError } = useCandleData(candleSymbol, visible);

  // Use allMids-based price from props (real-time)
  const displayPrice = asset.price;
  const displayChange24h = asset.change24h;
  const displayChangePercent24h = asset.changePercent24h;

  const displayName = getLocalizedAssetName(asset, locale);
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

  const getMarketLabel = (market: MarketType) => t(market);

  const href = `/stock/${asset.slug}`;
  const prefix = locale === 'en' ? '' : `/${locale}`;

  return (
    <div ref={cardRef} className="block group relative">
      <div
        className={cn(
          'glass-card glass-card-hover rounded-xl p-2.5 h-full overflow-hidden relative',
          'transition-all duration-300 active:scale-[0.98]',
          'group-hover:shadow-lg',
          marketAccentBorders[asset.market],
          className
        )}
      >
        <Link href={`${prefix}${href}`} className="absolute inset-0 z-10 rounded-xl focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2" aria-label={`${displayName} (${asset.symbol})`} />
        <div className="pointer-events-none flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-1 items-center gap-2 min-w-0">
            {rank && (
              <span className="text-xs font-medium text-muted-foreground w-5">
                #{rank}
              </span>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="min-w-0 max-w-full font-semibold break-words [overflow-wrap:anywhere]">{displayName}</span>
                <span className="text-xs text-muted-foreground">{asset.symbol}</span>
                {searchRank && searchRank.rank <= 10 && (
                  <Link href={`${prefix}/popular`}
                    aria-label={`${{ en: 'View popularity rank', ko: '인기순위 보기', ja: '人気順位を見る', zh: '查看人气排名', pt: 'Ver posição no ranking', es: 'Ver posición en el ranking' }[locale as 'en' | 'ko' | 'ja' | 'zh' | 'pt' | 'es'] ?? 'View popularity rank'}: ${searchRank.rank}`}
                    className={cn(
                      'pointer-events-auto relative z-20 text-[10px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5 transition-colors cursor-pointer',
                      searchRank.rank <= 3
                        ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                        : 'bg-primary/20 text-primary hover:bg-primary/30'
                    )}
                  >
                    #{searchRank.rank}
                  </Link>
                )}
                {showMarketBadge && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] px-1.5 py-0',
                      marketBadgeColors[asset.market]
                    )}
                  >
                    {getMarketLabel(asset.market)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="pointer-events-auto relative z-20 shrink-0">
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
        </div>

        {/* Price and Chart Row - Category colored background */}
        <div
          className={cn(
            'relative -mx-2.5 -mb-2.5 px-2.5 py-1.5 overflow-hidden',
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

          <div className="relative flex flex-wrap items-center justify-between gap-3">
            {/* Price and Change */}
            <div className="min-w-[120px] flex-1 space-y-1">
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
                'ml-auto w-[140px] max-w-full shrink-0 overflow-hidden rounded-lg',
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
    </div>
  );
}

// Export directly (memo was causing issues with chart loading)
export const AssetCard = AssetCardInner;
