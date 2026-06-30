'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { PriceDisplay, PriceChange } from '@/components/ui/price-change';
import { WatchlistButton } from './WatchlistButton';
import { Stock } from '@/lib/providers/types';
import { MarketPrice } from '@/lib/providers/types';

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

interface StockCardProps {
  stock: Stock;
  price: MarketPrice | null;
}

export function StockCard({ stock, price }: StockCardProps) {
  const locale = useLocale();
  const prefix = locale === 'en' ? '' : `/${locale}`;

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
            price={price?.price ?? null}
            change={price?.change24h ?? null}
            changePercent={price?.changePercent24h ?? null}
            size="md"
            showChange={false}
            hideCurrency={stock.category === 'INDEX' || stock.category === 'FX'}
          />
          <div className="flex items-center gap-2 flex-wrap">
            {price?.change24h != null && (
              <PriceChange
                value={price.change24h}
                type="amount"
                size="sm"
                showBackground
                hideCurrency={stock.category === 'INDEX' || stock.category === 'FX'}
              />
            )}
            <PriceChange
              value={price?.changePercent24h ?? null}
              type="percent"
              size="sm"
              showIcon={false}
            />
          </div>
        </div>

        {price?.lastUpdated && (
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(price.lastUpdated).toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
