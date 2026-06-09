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
  };

  const marketLabels: Record<MarketType, string> = {
    KR: locale === 'ko' ? '한국' : locale === 'ja' ? '韓国' : 'KR',
    US: locale === 'ko' ? '미국' : locale === 'ja' ? '米国' : 'US',
    JP: locale === 'ko' ? '일본' : locale === 'ja' ? '日本' : 'JP',
    INDEX: locale === 'ko' ? '지수' : locale === 'ja' ? '指数' : 'Index',
    ETF: 'ETF',
    COMMODITY: locale === 'ko' ? '원자재' : locale === 'ja' ? '商品' : 'Commodity',
    FX: locale === 'ko' ? '통화' : locale === 'ja' ? '通貨' : 'FX',
    SPECIAL: locale === 'ko' ? '특별' : locale === 'ja' ? '特別' : 'Special',
  };

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
