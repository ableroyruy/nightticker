'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { TrendingUp, Search, Clock } from 'lucide-react';
import { useSearchRanking } from '@/lib/context/SearchRankingContext';
import { getStockBySymbol, stocks } from '@/lib/markets/stocks';
import { Stock } from '@/lib/providers/types';
import { useHyperliquidTicker } from '@/lib/hooks/useHyperliquidTicker';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// Helper function to get localized stock name
function getLocalizedName(stock: Stock, locale: string): string {
  switch (locale) {
    case 'ko': return stock.nameKo || stock.name;
    case 'ja': return stock.nameJa || stock.name;
    case 'zh': return stock.nameZh || stock.name;
    case 'pt': return stock.namePt || stock.name;
    case 'es': return stock.nameEs || stock.name;
    default: return stock.name;
  }
}

export function PopularSearchesPage() {
  const locale = useLocale();
  const t = useTranslations('popularRanking');
  const tMarket = useTranslations('market');
  const { rankings } = useSearchRanking();
  const { tickers } = useHyperliquidTicker();
  const prefix = locale === 'en' ? '' : `/${locale}`;

  // Fallback to default stocks if no ranking data
  const displayRankings = rankings.length > 0 ? rankings : stocks.slice(0, 20).map((stock, index) => ({
    symbol: stock.symbol,
    views: 0,
    rank: index + 1,
    previousRank: null,
    rankChange: null,
  }));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/10 to-transparent py-12">
        <div className="container">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('title')}</h1>
              <p className="text-muted-foreground">{t('description')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
            <Clock className="h-4 w-4" />
            <span>{t('timeframe')}</span>
          </div>
        </div>
      </div>

      {/* Rankings List */}
      <div className="container py-8">
        <div className="space-y-3">
          {displayRankings.map((item) => {
            const stock = getStockBySymbol(item.symbol);
            if (!stock) return null;

            const tickerKey = stock.hyperliquidSymbol.replace('xyz:', '');
            const ticker = tickers[tickerKey];
            const displayName = getLocalizedName(stock, locale);

            const isPositive = ticker?.changePercent24h != null && ticker.changePercent24h > 0;
            const isNegative = ticker?.changePercent24h != null && ticker.changePercent24h < 0;

            return (
              <Link
                key={item.symbol}
                href={`${prefix}/stock/${stock.slug}`}
                className="block"
              >
                <div className="glass-card glass-card-hover rounded-xl p-4">
                  {/* Mobile-friendly layout */}
                  <div className="flex items-start gap-3">
                    {/* Rank */}
                    <RankBadge rank={item.rank} />

                    {/* Stock Info and Price */}
                    <div className="flex-1 min-w-0">
                      {/* Stock Name Row */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold truncate">{displayName}</span>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {stock.category}
                        </Badge>
                      </div>


                      {/* Price Row */}
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        {/* Price */}
                        <span className="font-semibold tabular-nums">
                          {ticker?.price ? (
                            `${stock.category !== 'INDEX' && stock.category !== 'FX' ? '$' : ''}${ticker.price.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: ticker.price < 1 ? 4 : 2,
                            })}`
                          ) : (
                            <span className="text-muted-foreground text-sm">{tMarket('priceUnavailable')}</span>
                          )}
                        </span>

                        {/* Change Amount + Percent */}
                        {ticker?.changePercent24h !== undefined && ticker?.changePercent24h !== null && (
                          <div className="flex items-center gap-2">
                            {/* Change Amount with background */}
                            {ticker.change24h !== undefined && (
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded tabular-nums',
                                  isPositive && 'text-gain bg-gain',
                                  isNegative && 'text-loss bg-loss',
                                  !isPositive && !isNegative && 'text-muted-foreground bg-muted'
                                )}
                              >
                                <span className="text-[8px] arrow-bounce">
                                  {isPositive && '▲'}
                                  {isNegative && '▼'}
                                  {!isPositive && !isNegative && '−'}
                                </span>
                                {isPositive ? '+' : '-'}{stock.category !== 'INDEX' && stock.category !== 'FX' ? '$' : ''}{Math.abs(ticker.change24h).toFixed(2)}
                              </span>
                            )}

                            {/* Change Percent */}
                            <span
                              className={cn(
                                'text-xs font-medium tabular-nums',
                                isPositive && 'text-gain',
                                isNegative && 'text-loss',
                                !isPositive && !isNegative && 'text-muted-foreground'
                              )}
                            >
                              {isPositive ? '+' : ''}{ticker.changePercent24h.toFixed(2)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rank Change */}
                    <div className="shrink-0">
                      <RankChangeIndicator change={item.rankChange} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {displayRankings.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">{t('noData')}</h3>
            <p className="text-muted-foreground">{t('noDataDescription')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const colors = {
    1: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    2: 'bg-gray-300/20 text-gray-300 border-gray-300/30',
    3: 'bg-amber-600/20 text-amber-500 border-amber-600/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-8 h-8 rounded-full border font-bold text-sm shrink-0',
        rank <= 3 ? colors[rank as 1 | 2 | 3] : 'bg-muted/30 text-muted-foreground border-border/30'
      )}
    >
      {rank}
    </span>
  );
}

function RankChangeIndicator({ change }: { change: number | null }) {
  if (change === null) {
    return (
      <span className="text-xs text-primary font-medium px-2 py-1 bg-primary/20 rounded-full">
        NEW
      </span>
    );
  }

  if (change === 0) {
    return (
      <span className="text-xs text-muted-foreground">
        -
      </span>
    );
  }

  const isUp = change > 0;

  return (
    <span
      className={cn(
        'text-xs font-medium flex items-center gap-0.5',
        isUp && 'text-gain',
        !isUp && 'text-loss'
      )}
    >
      <span className="text-[8px] arrow-bounce">
        {isUp ? '▲' : '▼'}
      </span>
      {Math.abs(change)}
    </span>
  );
}
