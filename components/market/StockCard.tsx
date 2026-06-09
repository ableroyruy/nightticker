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
            href={`${prefix}/stock/${stock.slug}`}
            className="hover:underline"
          >
            <h3 className="font-bold text-lg">{locale === 'ko' ? stock.nameKo : stock.name}</h3>
            <p className="text-sm text-muted-foreground">
              {stock.symbol}
            </p>
          </Link>
          <WatchlistButton
            symbol={stock.symbol}
            market={stock.category}
            name={stock.name}
            nameKo={stock.nameKo}
            slug={stock.slug}
          />
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
