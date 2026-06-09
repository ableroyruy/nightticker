'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { PriceDisplay } from './PriceDisplay';
import { WatchlistButton } from './WatchlistButton';
import { Stock } from '@/lib/providers/types';
import { MarketPrice } from '@/lib/providers/types';

interface StockCardProps {
  stock: Stock;
  price: MarketPrice | null;
}

export function StockCard({ stock, price }: StockCardProps) {
  const locale = useLocale();
  const prefix = locale === 'ko' ? '/ko' : '';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Link
            href={`${prefix}/markets/${stock.symbol.toLowerCase()}`}
            className="hover:underline"
          >
            <h3 className="font-bold text-lg">{stock.symbol}</h3>
            <p className="text-sm text-muted-foreground">
              {locale === 'ko' ? stock.nameKo : stock.name}
            </p>
          </Link>
          <WatchlistButton symbol={stock.symbol} />
        </div>

        <div className="mt-4">
          <PriceDisplay price={price?.price ?? null} size="sm" />
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
