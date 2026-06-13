'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { MarketAsset, MarketType } from '@/lib/types/market';
import { PriceChange } from '@/components/ui/price-change';
import { FavoriteButton } from '@/components/ui/favorite-button';
import { Badge } from '@/components/ui/badge';
import { useFavorites } from '@/lib/context/FavoritesContext';

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
  const tMarket = useTranslations('marketBadge');
  const { isFavorite, toggleFavorite } = useFavorites();

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

  const getMarketLabel = (market: MarketType) => tMarket(market);

  const prefix = locale === 'en' ? '' : `/${locale}`;

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
                {t('change')}
              </th>
              <th className="w-12 py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, index) => {
              const displayName =
                locale === 'ko' && asset.nameKo ? asset.nameKo :
                locale === 'ja' && asset.nameJa ? asset.nameJa :
                locale === 'zh' && asset.nameZh ? asset.nameZh :
                locale === 'pt' && asset.namePt ? asset.namePt :
                locale === 'es' && asset.nameEs ? asset.nameEs :
                asset.name;
              const isFav = isFavorite(asset.symbol, asset.market);
              const href = `${prefix}/stock/${asset.slug}`;

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
                        <span className="font-medium">{displayName}</span>
                        <p className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[200px]">{asset.symbol}</p>
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
                        <span className="mr-0.5">{marketFlags[asset.market]}</span>
                        {getMarketLabel(asset.market)}
                      </Badge>
                    </td>
                  )}
                  <td className="text-right tabular-nums font-medium">
                    {asset.price !== null
                      ? `${asset.market !== 'INDEX' && asset.market !== 'FX' ? '$' : ''}${asset.price.toLocaleString('en-US', {
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
                      hideCurrency={asset.market === 'INDEX' || asset.market === 'FX'}
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
                          slug: asset.slug,
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
