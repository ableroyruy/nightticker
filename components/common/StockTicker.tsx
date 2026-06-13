'use client';

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

export function StockTicker() {
  const locale = useLocale();
  const { tickers } = useHyperliquidTicker();
  const prefix = locale === 'en' ? '' : `/${locale}`;

  // Get all stocks with their prices
  const stocksWithPrices = stocks
    .map((stock) => {
      const tickerKey = stock.hyperliquidSymbol.replace('xyz:', '');
      const ticker = tickers[tickerKey];
      return {
        ...stock,
        price: ticker?.price ?? null,
        changePercent: ticker?.changePercent24h ?? null,
      };
    })
    .filter((s) => s.price !== null);

  if (stocksWithPrices.length === 0) {
    return null;
  }

  // Triple the items for seamless loop
  const tickerItems = [...stocksWithPrices, ...stocksWithPrices, ...stocksWithPrices];

  return (
    <div className="w-full bg-background/50 backdrop-blur-sm border-b border-border/30 overflow-hidden">
      <div className="relative">
        <div className="animate-ticker flex whitespace-nowrap py-2">
          {tickerItems.map((stock, index) => {
            const isPositive = (stock.changePercent ?? 0) >= 0;
            return (
              <Link
                key={`${stock.symbol}-${index}`}
                href={`${prefix}/stock/${stock.slug}`}
                className="inline-flex items-center gap-2 px-4 hover:bg-accent/50 transition-colors rounded"
              >
                <span className="font-medium text-sm">
                  {getLocalizedName(stock, locale)}
                </span>
                <span className="text-sm text-muted-foreground">
                  ${stock.price?.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                {stock.changePercent !== null && (
                  <span
                    className={cn(
                      'flex items-center gap-0.5 text-xs font-medium tabular-nums',
                      isPositive ? 'text-gain' : 'text-loss'
                    )}
                  >
                    <span className="text-[8px] arrow-bounce">
                      {isPositive ? '▲' : '▼'}
                    </span>
                    {isPositive ? '+' : ''}
                    {stock.changePercent.toFixed(2)}%
                  </span>
                )}
                <span className="text-border/50 mx-2">|</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
