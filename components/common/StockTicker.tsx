'use client';

import { memo, useMemo } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useHyperliquidTicker } from '@/lib/hooks/useHyperliquidTicker';
import { stocks } from '@/lib/markets/stocks';
import { cn } from '@/lib/utils';

function getLocalizedName(stock: (typeof stocks)[0], locale: string): string {
  switch (locale) {
    case 'ko':
      return stock.nameKo || stock.name;
    case 'ja':
      return stock.nameJa || stock.name;
    case 'zh':
      return stock.nameZh || stock.name;
    case 'pt':
      return stock.namePt || stock.name;
    case 'es':
      return stock.nameEs || stock.name;
    default:
      return stock.name;
  }
}

// Memoized ticker item to prevent unnecessary re-renders
const TickerItem = memo(function TickerItem({
  stock,
  locale,
  prefix,
}: {
  stock: (typeof stocks)[0] & { price: number | null; change24h: number | null; changePercent: number | null };
  locale: string;
  prefix: string;
}) {
  const isPositive = stock.changePercent != null && stock.changePercent > 0;
  const isNegative = stock.changePercent != null && stock.changePercent < 0;
  const isZero = stock.changePercent != null && stock.changePercent === 0;

  return (
    <Link
      href={`${prefix}/stock/${stock.slug}`}
      className="inline-flex items-center gap-2 px-4 hover:bg-accent/50 transition-colors rounded"
    >
      <span className="font-medium text-sm">
        {getLocalizedName(stock, locale)}
      </span>
      {stock.price !== null ? (
        <span className={cn(
          'text-sm tabular-nums',
          isPositive && 'text-gain',
          isNegative && 'text-loss',
          isZero && 'text-muted-foreground'
        )}>
          ${stock.price.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      )}
      {stock.change24h != null && (
        <span
          className={cn(
            'flex items-center gap-0.5 text-xs font-medium tabular-nums',
            isPositive && 'text-gain',
            isNegative && 'text-loss',
            isZero && 'text-muted-foreground'
          )}
        >
          <span className="text-[8px] arrow-bounce">
            {isPositive && '▲'}
            {isNegative && '▼'}
            {isZero && '−'}
          </span>
          {isPositive ? '+$' : isNegative ? '-$' : '$'}{Math.abs(stock.change24h).toFixed(2)}
        </span>
      )}
      {stock.changePercent != null && (
        <span
          className={cn(
            'text-xs font-medium tabular-nums',
            isPositive && 'text-gain',
            isNegative && 'text-loss',
            isZero && 'text-muted-foreground'
          )}
        >
          {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
        </span>
      )}
      <span className="text-border/50 mx-2">|</span>
    </Link>
  );
});

export function StockTicker() {
  const locale = useLocale();
  const { tickers } = useHyperliquidTicker();
  const prefix = locale === 'en' ? '' : `/${locale}`;

  // Memoize the base stock list structure (triple for seamless loop)
  const tripleStocks = useMemo(() => [...stocks, ...stocks, ...stocks], []);

  // Map prices to stocks
  const tickerItems = useMemo(() => {
    return tripleStocks.map((stock) => {
      const tickerKey = stock.hyperliquidSymbol.replace('xyz:', '');
      const ticker = tickers[tickerKey];
      return {
        ...stock,
        price: ticker?.price ?? null,
        change24h: ticker?.change24h ?? null,
        changePercent: ticker?.changePercent24h ?? null,
      };
    });
  }, [tripleStocks, tickers]);

  if (stocks.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-background/50 backdrop-blur-sm border-b border-border/30 overflow-hidden">
      <div className="relative">
        <div className="animate-ticker flex whitespace-nowrap py-2">
          {tickerItems.map((stock, index) => (
            <TickerItem
              key={`${stock.symbol}-${index}`}
              stock={stock}
              locale={locale}
              prefix={prefix}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
