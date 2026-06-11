'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { TrendingUp, Search, ArrowRight, Clock } from 'lucide-react';
import { useSearchRanking, SearchRankingItem } from '@/lib/context/SearchRankingContext';
import { getStockBySymbol, stocks } from '@/lib/markets/stocks';
import { useHyperliquidTicker } from '@/lib/hooks/useHyperliquidTicker';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function PopularSearchesPage() {
  const locale = useLocale();
  const t = useTranslations('popularSearches');
  const { rankings } = useSearchRanking();
  const { tickers } = useHyperliquidTicker();
  const prefix = locale === 'ko' ? '/ko' : '';

  // Fallback to default stocks if no ranking data
  const displayRankings = rankings.length > 0 ? rankings : stocks.slice(0, 20).map((stock, index) => ({
    symbol: stock.symbol,
    count: 20 - index,
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

      {/* Rankings Table */}
      <div className="container py-8">
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border/50 text-sm font-medium text-muted-foreground">
            <div className="col-span-1">{t('rank')}</div>
            <div className="col-span-5">{t('stock')}</div>
            <div className="col-span-2 text-right">{t('price')}</div>
            <div className="col-span-2 text-right">{t('change24h')}</div>
            <div className="col-span-2 text-right">{t('rankChange')}</div>
          </div>

          {/* Rankings */}
          <div className="divide-y divide-border/30">
            {displayRankings.map((item) => {
              const stock = getStockBySymbol(item.symbol);
              if (!stock) return null;

              const tickerKey = stock.hyperliquidSymbol.replace('xyz:', '');
              const ticker = tickers[tickerKey];
              const displayName = locale === 'ko' ? stock.nameKo : stock.name;

              return (
                <Link
                  key={item.symbol}
                  href={`${prefix}/stock/${stock.slug}`}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-accent/30 transition-colors items-center"
                >
                  {/* Rank */}
                  <div className="col-span-1">
                    <RankBadge rank={item.rank} />
                  </div>

                  {/* Stock Info */}
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">{displayName}</span>
                        <Badge variant="outline" className="text-xs">
                          {stock.category}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{stock.symbol}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 text-right tabular-nums">
                    {ticker?.price ? (
                      <span className="font-medium">
                        ${ticker.price.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: ticker.price < 1 ? 4 : 2,
                        })}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>

                  {/* 24h Change */}
                  <div className="col-span-2 text-right">
                    {ticker?.changePercent24h !== undefined && ticker?.changePercent24h !== null ? (
                      <div className="flex flex-col items-end gap-0.5">
                        <span
                          className={cn(
                            'font-medium flex items-center gap-1',
                            ticker.changePercent24h > 0 && 'text-gain',
                            ticker.changePercent24h < 0 && 'text-loss'
                          )}
                        >
                          {ticker.changePercent24h > 0 && <span className="text-xs">&#9650;</span>}
                          {ticker.changePercent24h < 0 && <span className="text-xs">&#9660;</span>}
                          {Math.abs(ticker.changePercent24h).toFixed(2)}%
                        </span>
                        {ticker.change24h !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            {ticker.change24h > 0 ? '+' : ''}
                            ${ticker.change24h.toFixed(2)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>

                  {/* Rank Change */}
                  <div className="col-span-2 text-right">
                    <RankChangeIndicator change={item.rankChange} />
                  </div>
                </Link>
              );
            })}
          </div>
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
        'inline-flex items-center justify-center w-8 h-8 rounded-full border font-bold text-sm',
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
      <span className="text-sm text-muted-foreground">
        NEW
      </span>
    );
  }

  if (change === 0) {
    return (
      <span className="text-sm text-muted-foreground">
        -
      </span>
    );
  }

  const isUp = change > 0;

  return (
    <span
      className={cn(
        'font-medium flex items-center justify-end gap-1',
        isUp && 'text-gain',
        !isUp && 'text-loss'
      )}
    >
      {isUp ? (
        <>
          <span className="text-xs">&#9650;</span>
          {change}
        </>
      ) : (
        <>
          <span className="text-xs">&#9660;</span>
          {Math.abs(change)}
        </>
      )}
    </span>
  );
}
