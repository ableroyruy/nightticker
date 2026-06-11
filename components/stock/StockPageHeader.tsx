'use client';

import { WatchlistButton } from '@/components/market/WatchlistButton';
import { SearchRankBadge } from '@/components/market/SearchRankBadge';
import { HyperliquidBadge } from '@/components/common/HyperliquidBadge';
import { Stock } from '@/lib/providers/types';

interface StockPageHeaderProps {
  stock: Stock;
  displayName: string;
  term: string;
  locale: string;
}

export function StockPageHeader({
  stock,
  displayName,
  term,
  locale,
}: StockPageHeaderProps) {
  const titleSuffix =
    locale === 'ko'
      ? `야간 ${term}`
      : locale === 'ja'
        ? `夜間${term}`
        : `Overnight ${term}`;

  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <h1 className="text-3xl md:text-4xl font-bold">
            {displayName} {titleSuffix}
          </h1>
          <WatchlistButton
            symbol={stock.symbol}
            market={stock.category}
            name={stock.name}
            nameKo={stock.nameKo}
            slug={stock.slug}
          />
          <SearchRankBadge symbol={stock.symbol} />
        </div>
        <p className="text-lg text-muted-foreground">{stock.symbol}</p>
      </div>
      <HyperliquidBadge />
    </div>
  );
}
