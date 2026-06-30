'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { PriceDisplay, PriceChange } from '@/components/ui/price-change';
import { WatchlistButton } from './WatchlistButton';
import { useHyperliquidTicker } from '@/lib/hooks/useHyperliquidTicker';
import { stocks } from '@/lib/markets/stocks';
import { Stock } from '@/lib/providers/types';

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

function LiveStockCard({ stock }: { stock: Stock }) {
  const locale = useLocale();
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const { tickers } = useHyperliquidTicker();

  const tickerKey = stock.hyperliquidSymbol.replace('xyz:', '');
  const ticker = tickers[tickerKey];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Link
            href={`${prefix}/stock/${stock.slug}`}
            className="hover:underline"
          >
            <h3 className="font-bold text-lg">{getLocalizedName(stock, locale)}</h3>
            <p className="text-sm text-muted-foreground">
              {stock.symbol}
            </p>
          </Link>
          <WatchlistButton
            symbol={stock.symbol}
            market={stock.category}
            name={stock.name}
            nameKo={stock.nameKo}
            nameJa={stock.nameJa}
            nameZh={stock.nameZh}
            namePt={stock.namePt}
            nameEs={stock.nameEs}
            slug={stock.slug}
          />
        </div>

        <div className="mt-4 space-y-1">
          <PriceDisplay
            price={ticker?.price ?? null}
            change={ticker?.change24h ?? null}
            changePercent={ticker?.changePercent24h ?? null}
            size="md"
            showChange={false}
            hideCurrency={stock.category === 'INDEX' || stock.category === 'FX'}
          />
          <div className="flex items-center gap-2 flex-wrap">
            {ticker?.change24h != null && (
              <PriceChange
                value={ticker.change24h}
                type="amount"
                size="sm"
                showBackground
                hideCurrency={stock.category === 'INDEX' || stock.category === 'FX'}
              />
            )}
            <PriceChange
              value={ticker?.changePercent24h ?? null}
              type="percent"
              size="sm"
              showIcon={false}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LiveStockGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stocks.map((stock) => (
        <LiveStockCard key={stock.symbol} stock={stock} />
      ))}
    </div>
  );
}
