'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useSearchRanking } from '@/lib/context/SearchRankingContext';
import { useHyperliquidTicker, type TickerData } from '@/lib/hooks/useHyperliquidTicker';
import { stocks, getStockBySymbol } from '@/lib/markets/stocks';
import type { Stock } from '@/lib/providers/types';
import { cn } from '@/lib/utils';
import { formatMarketPrice, getLocalizedAssetName, marketDirection } from '@/lib/format-market';
import { measuredRankings } from '@/lib/ranking/presentation';
import { PriceChange } from '@/components/ui/price-change';

interface TrendingTickerProps { className?: string; limit?: number; onSelect?: (slug: string) => void }

export function TrendingTicker({ className, limit, onSelect }: TrendingTickerProps) {
  const locale = useLocale();
  const t = useTranslations('nav');
  const { getTopRankings } = useSearchRanking();
  const { tickers } = useHyperliquidTicker();
  const reducedMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const topRankings = useMemo(() => measuredRankings(getTopRankings(stocks.length).filter(item => getStockBySymbol(item.symbol)), limit), [getTopRankings, limit]);

  useEffect(() => {
    if (!topRankings.length || reducedMotion) return;
    const interval = setInterval(() => setCurrentIndex(previous => (previous + 1) % topRankings.length), 3000);
    return () => clearInterval(interval);
  }, [topRankings.length, reducedMotion]);

  // No measured views means no popularity rank; never manufacture #1 from catalog order.
  if (!topRankings.length) return null;
  const current = topRankings[currentIndex % topRankings.length];
  const stock = getStockBySymbol(current.symbol)!;
  const ticker = tickers[stock.hyperliquidSymbol.replace(/^xyz:/, '')];
  return (
    <div className={cn('flex min-w-0 items-center gap-2 text-sm', className)}>
      <Link href={`${prefix}/popular`} className="shrink-0 text-xs text-muted-foreground transition-colors hover:text-primary">{t('popular')}</Link>
      <div className="relative h-6 min-w-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={current.symbol} initial={reducedMotion ? false : { y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={reducedMotion ? undefined : { y: -20, opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.3 }} className="absolute inset-0 flex min-w-0 items-center">
            <Link href={`${prefix}/stock/${stock.slug}`} onClick={() => onSelect?.(stock.slug)} className="flex min-w-0 flex-1 items-center gap-2 transition-colors hover:text-primary">
              <span className="shrink-0 font-medium text-primary">#{current.rank}</span>
              <span className="min-w-0 flex-1 truncate font-medium">{getLocalizedAssetName(stock, locale)}</span>
              {ticker?.price != null && <span className="hidden shrink-0 min-[400px]:inline"><TickerPrice stock={stock} ticker={ticker} /></span>}
              <span className="shrink-0"><PriceChange value={ticker?.changePercent24h ?? null} type="percent" size="sm" showIcon={false} /></span>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
      <Link href={`${prefix}/popular`} aria-label={t('popular')} className="flex shrink-0 gap-1 py-2 transition-opacity hover:opacity-80">
        {topRankings.slice(0, 5).map((item, index) => <span key={item.symbol} aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full transition-colors', index === currentIndex % Math.min(5, topRankings.length) ? 'bg-primary' : 'bg-muted-foreground/30')} />)}
      </Link>
    </div>
  );
}
function TickerPrice({ stock, ticker }: { stock: Stock; ticker: TickerData }) {
  const direction = marketDirection(ticker.changePercent24h);
  return <span className={cn('whitespace-nowrap text-xs tabular-nums', direction === 1 && 'text-gain', direction === -1 && 'text-loss', direction === 0 && 'text-muted-foreground')}>{formatMarketPrice(ticker.price, stock.category !== 'INDEX' && stock.category !== 'FX')}</span>;
}

export function TrendingMarquee({ className, limit, onSelect }: TrendingTickerProps) {
  const locale = useLocale();
  const t = useTranslations('nav');
  const { getTopRankings } = useSearchRanking();
  const { tickers } = useHyperliquidTicker();
  const reducedMotion = useReducedMotion();
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const items = useMemo(() => measuredRankings(getTopRankings(stocks.length), limit).flatMap(item => {
    const stock = getStockBySymbol(item.symbol);
    return stock ? [{ ...item, stock }] : [];
  }), [getTopRankings, limit]);
  if (!items.length) return null;
  return (
    <div className={cn('min-w-0 overflow-hidden', className)}>
      <Link href={`${prefix}/popular`} className="mb-1 inline-flex text-xs text-muted-foreground transition-colors hover:text-primary">{t('popular')}</Link>
      <div className={reducedMotion ? 'overflow-x-auto' : 'relative overflow-hidden'}>
        <motion.div className="flex gap-4 whitespace-nowrap" animate={reducedMotion ? undefined : { x: [0, -50 * items.length] }} transition={{ x: { repeat: Infinity, repeatType: 'loop', duration: items.length * 4, ease: 'linear' } }}>
          {(reducedMotion ? items : [...items, ...items]).map((item, index) => {
            const ticker = tickers[item.stock.hyperliquidSymbol.replace(/^xyz:/, '')];
            return (
              <Link key={`${item.symbol}-${index}`} href={`${prefix}/stock/${item.stock.slug}`} onClick={() => onSelect?.(item.stock.slug)} className="flex shrink-0 items-center gap-1.5 rounded-full bg-muted/30 px-2 py-1 transition-colors hover:bg-muted/50">
                <span className="font-medium text-primary">#{item.rank}</span>
                <span className="font-medium">{getLocalizedAssetName(item.stock, locale)}</span>
                {ticker && <TickerPrice stock={item.stock} ticker={ticker} />}
                <PriceChange value={ticker?.changePercent24h ?? null} type="percent" size="sm" showIcon={false} />
              </Link>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
