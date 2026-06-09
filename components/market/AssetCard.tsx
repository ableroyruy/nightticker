'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { MarketAsset, MarketType } from '@/lib/types/market';
import { PriceDisplay, PriceChange } from '@/components/ui/price-change';
import { FavoriteButton } from '@/components/ui/favorite-button';
import { Badge } from '@/components/ui/badge';
import { useFavorites } from '@/lib/context/FavoritesContext';

interface AssetCardProps {
  asset: MarketAsset;
  rank?: number;
  showMarketBadge?: boolean;
  className?: string;
}

export function AssetCard({
  asset,
  rank,
  showMarketBadge = true,
  className,
}: AssetCardProps) {
  const locale = useLocale();
  const { isFavorite, toggleFavorite } = useFavorites();

  const displayName = locale === 'ko' && asset.nameKo ? asset.nameKo : asset.name;
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
  };

  const marketLabels: Record<MarketType, string> = {
    KR: locale === 'ko' ? '한국' : 'KR',
    US: locale === 'ko' ? '미국' : 'US',
    JP: locale === 'ko' ? '일본' : 'JP',
    INDEX: locale === 'ko' ? '지수' : 'Index',
    ETF: 'ETF',
    COMMODITY: locale === 'ko' ? '원자재' : 'Commodity',
    FX: locale === 'ko' ? '통화' : 'FX',
    SPECIAL: locale === 'ko' ? '특별' : 'Special',
  };

  const href = `/stock/${asset.slug}`;
  const prefix = locale === 'ko' ? '/ko' : '';

  return (
    <Link href={`${prefix}${href}`} className="block">
      <div
        className={cn(
          'glass-card glass-card-hover rounded-2xl p-4 h-full',
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

        <div className="space-y-2">
          <PriceDisplay
            price={asset.price}
            change={asset.change24h}
            changePercent={asset.changePercent24h}
            size="md"
            showChange={false}
          />

          <div className="flex items-center gap-2">
            <PriceChange
              value={asset.changePercent24h ?? null}
              type="percent"
              size="sm"
              showBackground
            />
            {asset.change24h != null && (
              <PriceChange
                value={asset.change24h}
                type="amount"
                size="sm"
                showIcon={false}
              />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
