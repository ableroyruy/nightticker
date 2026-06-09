'use client';

import { StockCard } from './StockCard';
import { MarketData } from '@/lib/providers/market-data-provider';

interface StockGridProps {
  stocks: MarketData[];
}

export function StockGrid({ stocks }: StockGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stocks.map((data) => (
        <StockCard
          key={data.stock.symbol}
          stock={data.stock}
          price={data.price}
        />
      ))}
    </div>
  );
}
