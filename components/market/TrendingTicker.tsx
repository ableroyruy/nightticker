'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useSearchRanking, SearchRankingItem } from '@/lib/context/SearchRankingContext';
import { getStockBySymbol } from '@/lib/markets/stocks';
import { cn } from '@/lib/utils';

interface TrendingTickerProps {
  className?: string;
  limit?: number;
  onSelect?: (slug: string) => void;
}

export function TrendingTicker({
  className,
  limit = 10,
  onSelect,
}: TrendingTickerProps) {
  const locale = useLocale();
  const { getTopRankings } = useSearchRanking();
  const [currentIndex, setCurrentIndex] = useState(0);
  const prefix = locale === 'ko' ? '/ko' : '';

  const topRankings = useMemo(() => getTopRankings(limit), [getTopRankings, limit]);

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

  const displayName = locale === 'ko' ? stock.nameKo : stock.name;

  const handleClick = () => {
    onSelect?.(stock.slug);
  };

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      <div className="flex items-center gap-1 text-muted-foreground">
        <TrendingUp className="h-3.5 w-3.5" />
        <span className="text-xs">{locale === 'ko' ? '인기' : 'Hot'}</span>
      </div>

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
              <span className="truncate">{displayName}</span>
              <span className="text-muted-foreground text-xs">
                {stock.symbol}
              </span>
              {currentItem.rankChange !== null && currentItem.rankChange !== 0 && (
                <RankChangeIndicator change={currentItem.rankChange} />
              )}
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1">
        {topRankings.slice(0, 5).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              'w-1.5 h-1.5 rounded-full transition-colors',
              index === currentIndex % 5
                ? 'bg-primary'
                : 'bg-muted-foreground/30'
            )}
          />
        ))}
      </div>
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
  limit = 10,
  onSelect,
}: TrendingTickerProps) {
  const locale = useLocale();
  const { getTopRankings } = useSearchRanking();
  const prefix = locale === 'ko' ? '/ko' : '';

  const topRankings = useMemo(() => getTopRankings(limit), [getTopRankings, limit]);

  if (topRankings.length === 0) return null;

  const items = topRankings.map((item) => {
    const stock = getStockBySymbol(item.symbol);
    return stock ? { ...item, stock } : null;
  }).filter(Boolean) as (SearchRankingItem & { stock: NonNullable<ReturnType<typeof getStockBySymbol>> })[];

  if (items.length === 0) return null;

  return (
    <div className={cn('overflow-hidden', className)}>
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
        <TrendingUp className="h-3 w-3" />
        <span>{locale === 'ko' ? '인기순위' : 'Trending'}</span>
      </div>

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
            const displayName = locale === 'ko' ? item.stock.nameKo : item.stock.name;

            return (
              <Link
                key={`${item.symbol}-${index}`}
                href={`${prefix}/stock/${item.stock.slug}`}
                onClick={() => onSelect?.(item.stock.slug)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/30 hover:bg-muted/50 transition-colors shrink-0"
              >
                <span className="text-primary font-medium">#{item.rank}</span>
                <span className="font-medium">{displayName}</span>
                {item.rankChange !== null && item.rankChange !== 0 && (
                  <RankChangeIndicator change={item.rankChange} />
                )}
              </Link>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
