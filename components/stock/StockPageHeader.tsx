'use client';

import { useEffect } from 'react';
import { WatchlistButton } from '@/components/market/WatchlistButton';
import { SearchRankBadge } from '@/components/market/SearchRankBadge';
import { ShareButton } from '@/components/common/ShareButton';
import { Stock } from '@/lib/providers/types';
import { useSearchRanking } from '@/lib/context/SearchRankingContext';

const BASE_URL = 'https://nightticker.com';

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
  const { recordPageView } = useSearchRanking();

  // Track page view when component mounts
  useEffect(() => {
    recordPageView(stock.symbol);
  }, [stock.symbol, recordPageView]);

  const titleSuffix = (() => {
    switch (locale) {
      case 'ko': return `야간 ${term}`;
      case 'ja': return `夜間${term}`;
      case 'zh': return `夜间${term}`;
      case 'pt': return `${term} Noturno`;
      case 'es': return `${term} Nocturno`;
      default: return `Overnight ${term}`;
    }
  })();

  // Generate share URL
  const shareUrl = locale === 'en'
    ? `${BASE_URL}/stock/${stock.slug}`
    : `${BASE_URL}/${locale}/stock/${stock.slug}`;

  const shareTitle = `${displayName} ${titleSuffix}`;

  return (
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
        <ShareButton title={shareTitle} url={shareUrl} locale={locale} />
      </div>
      <p className="text-lg text-muted-foreground">{stock.symbol}</p>
    </div>
  );
}
