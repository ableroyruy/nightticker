'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { MarketAsset, MarketType } from '@/lib/types/market';
import { PriceChange } from '@/components/ui/price-change';
import { FavoriteButton } from '@/components/ui/favorite-button';
import { Badge } from '@/components/ui/badge';
import { useFavorites } from '@/lib/hooks/useFavorites';

interface AssetTableProps {
  assets: MarketAsset[];
  showRank?: boolean;
  showMarket?: boolean;
  className?: string;
}

export function AssetTable({
  assets,
  showRank = true,
  showMarket = true,
  className,
}: AssetTableProps) {
  const locale = useLocale();
  const t = useTranslations('table');
  const { isFavorite, toggleFavorite } = useFavorites();

  const marketBadgeColors: Record<MarketType, string> = {
    KR: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    US: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    INDEX: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };

  const marketLabels: Record<MarketType, string> = {
    KR: locale === 'ko' ? '한국' : 'KR',
    US: locale === 'ko' ? '미국' : 'US',
    INDEX: 'Index',
  };

  const prefix = locale === 'ko' ? '/ko' : '';

  if (assets.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <p className="text-muted-foreground">{t('noData')}</p>
      </div>
    );
  }

  return (
    <div className={cn('glass-card rounded-2xl overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full financial-table">
          <thead>
            <tr className="border-b border-border/50">
              {showRank && (
                <th className="text-left py-3 px-4 w-12">#</th>
              )}
              <th className="text-left py-3 px-4">{t('name')}</th>
              {showMarket && (
                <th className="text-left py-3 px-4 hidden sm:table-cell">
                  {t('market')}
                </th>
              )}
              <th className="text-right py-3 px-4">{t('price')}</th>
              <th className="text-right py-3 px-4">{t('change24h')}</th>
              <th className="text-right py-3 px-4 hidden md:table-cell">
                {locale === 'ko' ? '변동액' : 'Change'}
              </th>
              <th className="w-12 py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, index) => {
              const displayName =
                locale === 'ko' && asset.nameKo ? asset.nameKo : asset.name;
              const isFav = isFavorite(asset.symbol, asset.market);
              const href = `${prefix}/markets/${asset.symbol.toLowerCase()}`;

              return (
                <tr key={`${asset.market}-${asset.symbol}`}>
                  {showRank && (
                    <td className="tabular-nums text-muted-foreground">
                      {index + 1}
                    </td>
                  )}
                  <td>
                    <Link
                      href={href}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      <div>
                        <span className="font-medium">{asset.symbol}</span>
                        <p className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[200px]">
                          {displayName}
                        </p>
                      </div>
                    </Link>
                  </td>
                  {showMarket && (
                    <td className="hidden sm:table-cell">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px]',
                          marketBadgeColors[asset.market]
                        )}
                      >
                        {marketLabels[asset.market]}
                      </Badge>
                    </td>
                  )}
                  <td className="text-right tabular-nums font-medium">
                    {asset.price !== null
                      ? `$${asset.price.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: asset.price < 1 ? 6 : 2,
                        })}`
                      : '—'}
                  </td>
                  <td className="text-right">
                    <PriceChange
                      value={asset.changePercent24h ?? null}
                      type="percent"
                      size="sm"
                    />
                  </td>
                  <td className="text-right hidden md:table-cell">
                    <PriceChange
                      value={asset.change24h ?? null}
                      type="amount"
                      size="sm"
                      showIcon={false}
                    />
                  </td>
                  <td>
                    <FavoriteButton
                      isFavorite={isFav}
                      onToggle={() =>
                        toggleFavorite({
                          symbol: asset.symbol,
                          market: asset.market,
                          name: asset.name,
                          nameKo: asset.nameKo,
                        })
                      }
                      size="sm"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
