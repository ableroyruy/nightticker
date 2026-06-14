'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchRanking, SearchRankingItem } from '@/lib/context/SearchRankingContext';
import { useHyperliquidTicker } from '@/lib/hooks/useHyperliquidTicker';
import { stocks, getStockBySymbol } from '@/lib/markets/stocks';
import { Stock } from '@/lib/providers/types';
import { cn } from '@/lib/utils';

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

interface TrendingTickerProps {
  className?: string;
  limit?: number;
  onSelect?: (slug: string) => void;
}

export function TrendingTicker({
  className,
  limit,
  onSelect,
}: TrendingTickerProps) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('nav');
  const { getTopRankings } = useSearchRanking();
  const { tickers } = useHyperliquidTicker();
  const [currentIndex, setCurrentIndex] = useState(0);
  const prefix = locale === 'en' ? '' : `/${locale}`;

  // Use all stocks - no limit by default
  const topRankings = useMemo(() => {
    const rankings = getTopRankings(stocks.length);
    if (rankings.length > 0) {
      return limit ? rankings.slice(0, limit) : rankings;
    }
    // Fallback: create rankings from all stocks
    const allStocks = stocks.map((stock, index) => ({
      symbol: stock.symbol,
      rank: index + 1,
      count: 0,
      rankChange: 0,
    }));
    return limit ? allStocks.slice(0, limit) : allStocks;
  }, [getTopRankings, limit]);

  // Cycle through items every 3 seconds
  useEffect(() => {
    if (topRankings.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % topRankings.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [topRankings.length]);

  if (topRankings.length === 0) return null;

  const currentItem = topRankings[currentIndex];
  const stock = getStockBySymbol(currentItem.symbol);
  if (!stock) return null;

  const displayName = getLocalizedName(stock, locale);
  const tickerKey = stock.hyperliquidSymbol.replace('xyz:', '');
  const ticker = tickers[tickerKey];
  const isPositive = ticker?.changePercent24h != null && ticker.changePercent24h > 0;
  const isNegative = ticker?.changePercent24h != null && ticker.changePercent24h < 0;
  const isZero = ticker?.changePercent24h != null && ticker.changePercent24h === 0;

  const handleClick = () => {
    onSelect?.(stock.slug);
  };

  const handlePopularClick = () => {
    router.push(`${prefix}/popular`);
  };

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      <button
        onClick={handlePopularClick}
        className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
      >
        <span className="text-xs">{t('popular')}</span>
      </button>

      <div className="relative h-5 overflow-hidden flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.symbol}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center"
          >
            <Link
              href={`${prefix}/stock/${stock.slug}`}
              onClick={handleClick}
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <span className="font-medium text-primary">
                #{currentItem.rank}
              </span>
              <span className="truncate font-medium">{displayName}</span>
              {/* Price */}
              {ticker?.price && (
                <span className={cn(
                  'text-xs tabular-nums',
                  isPositive && 'text-gain',
                  isNegative && 'text-loss',
                  isZero && 'text-muted-foreground'
                )}>
                  ${ticker.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
              {/* Change Amount */}
              {ticker?.change24h != null && (
                <span className={cn(
                  'text-xs tabular-nums flex items-center gap-0.5',
                  isPositive && 'text-gain',
                  isNegative && 'text-loss',
                  isZero && 'text-muted-foreground'
                )}>
                  <span className="text-[8px] arrow-bounce">
                    {isPositive && '▲'}
                    {isNegative && '▼'}
                    {isZero && '−'}
                  </span>
                  {isPositive ? '+$' : '-$'}{Math.abs(ticker.change24h).toFixed(2)}
                </span>
              )}
              {/* Change Percent */}
              {ticker?.changePercent24h != null && (
                <span className={cn(
                  'text-xs tabular-nums',
                  isPositive && 'text-gain',
                  isNegative && 'text-loss',
                  isZero && 'text-muted-foreground'
                )}>
                  {isPositive ? '+' : ''}{ticker.changePercent24h.toFixed(2)}%
                </span>
              )}
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots - clickable to go to popular page */}
      <button
        onClick={handlePopularClick}
        className="flex gap-1 cursor-pointer hover:opacity-80 transition-opacity"
      >
        {topRankings.slice(0, 5).map((_, index) => (
          <span
            key={index}
            className={cn(
              'w-1.5 h-1.5 rounded-full transition-colors',
              index === currentIndex % 5
                ? 'bg-primary'
                : 'bg-muted-foreground/30'
            )}
          />
        ))}
      </button>
    </div>
  );
}

function RankChangeIndicator({ change }: { change: number }) {
  const isUp = change > 0;
  const isDown = change < 0;

  if (!isUp && !isDown) return null;

  return (
    <span
      className={cn(
        'text-xs font-medium flex items-center',
        isUp && 'text-gain',
        isDown && 'text-loss'
      )}
    >
      {isUp ? (
        <>
          <span className="text-[10px]">&#9650;</span>
          {change}
        </>
      ) : (
        <>
          <span className="text-[10px]">&#9660;</span>
          {Math.abs(change)}
        </>
      )}
    </span>
  );
}

// Marquee-style continuous scroll component
export function TrendingMarquee({
  className,
  limit,
  onSelect,
}: TrendingTickerProps) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('nav');
  const { getTopRankings } = useSearchRanking();
  const { tickers } = useHyperliquidTicker();
  const prefix = locale === 'en' ? '' : `/${locale}`;

  // Use all stocks - no limit by default
  const topRankings = useMemo(() => {
    const rankings = getTopRankings(stocks.length);
    if (rankings.length > 0) {
      return limit ? rankings.slice(0, limit) : rankings;
    }
    const allStocks = stocks.map((stock, index) => ({
      symbol: stock.symbol,
      rank: index + 1,
      count: 0,
      rankChange: 0,
    }));
    return limit ? allStocks.slice(0, limit) : allStocks;
  }, [getTopRankings, limit]);

  const items = topRankings.map((item) => {
    const stock = getStockBySymbol(item.symbol);
    return stock ? { ...item, stock } : null;
  }).filter(Boolean) as (SearchRankingItem & { stock: NonNullable<ReturnType<typeof getStockBySymbol>> })[];

  if (items.length === 0) return null;

  const handlePopularClick = () => {
    router.push(`${prefix}/popular`);
  };

  return (
    <div className={cn('overflow-hidden', className)}>
      <button
        onClick={handlePopularClick}
        className="flex items-center gap-1 text-xs text-muted-foreground mb-1 hover:text-primary transition-colors cursor-pointer"
      >
        <span>{t('popular')}</span>
      </button>

      <div className="relative overflow-hidden">
        <motion.div
          className="flex gap-4 whitespace-nowrap"
          animate={{
            x: [0, -50 * items.length],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: items.length * 4,
              ease: 'linear',
            },
          }}
        >
          {/* Double the items for seamless loop */}
          {[...items, ...items].map((item, index) => {
            const displayName = getLocalizedName(item.stock, locale);
            const tickerKey = item.stock.hyperliquidSymbol.replace('xyz:', '');
            const ticker = tickers[tickerKey];
            const isPositive = ticker?.changePercent24h != null && ticker.changePercent24h > 0;
            const isNegative = ticker?.changePercent24h != null && ticker.changePercent24h < 0;
            const isZero = ticker?.changePercent24h != null && ticker.changePercent24h === 0;

            return (
              <Link
                key={`${item.symbol}-${index}`}
                href={`${prefix}/stock/${item.stock.slug}`}
                onClick={() => onSelect?.(item.stock.slug)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/30 hover:bg-muted/50 transition-colors shrink-0"
              >
                <span className="text-primary font-medium">#{item.rank}</span>
                <span className="font-medium">{displayName}</span>
                {/* Price */}
                {ticker?.price && (
                  <span className={cn(
                    'text-xs tabular-nums',
                    isPositive && 'text-gain',
                    isNegative && 'text-loss',
                    isZero && 'text-muted-foreground'
                  )}>
                    ${ticker.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
                {/* Change Amount */}
                {ticker?.change24h != null && (
                  <span className={cn(
                    'text-xs tabular-nums flex items-center gap-0.5',
                    isPositive && 'text-gain',
                    isNegative && 'text-loss',
                    isZero && 'text-muted-foreground'
                  )}>
                    <span className="text-[8px] arrow-bounce">
                      {isPositive && '▲'}
                      {isNegative && '▼'}
                      {isZero && '−'}
                    </span>
                    {isPositive ? '+$' : '-$'}{Math.abs(ticker.change24h).toFixed(2)}
                  </span>
                )}
                {/* Change Percent */}
                {ticker?.changePercent24h != null && (
                  <span className={cn(
                    'text-xs tabular-nums',
                    isPositive && 'text-gain',
                    isNegative && 'text-loss',
                    isZero && 'text-muted-foreground'
                  )}>
                    {isPositive ? '+' : ''}{ticker.changePercent24h.toFixed(1)}%
                  </span>
                )}
              </Link>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
