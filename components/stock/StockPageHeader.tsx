'use client';

import { useEffect } from 'react';
import { WatchlistButton } from '@/components/market/WatchlistButton';
import { ShareButton } from '@/components/common/ShareButton';
import { Stock } from '@/lib/providers/types';
import Link from 'next/link';
import { categoryNames, sectorNames } from '@/lib/markets/stocks';
import { useSearchRanking } from '@/lib/context/SearchRankingContext';

const BASE_URL = 'https://www.nightticker.com';

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

  const prefix = locale === 'en' ? '' : `/${locale}`;
  const language = locale as keyof typeof categoryNames.US;
  const categoryLabel = categoryNames[stock.category][language] ?? categoryNames[stock.category].en;

  return (
    <header className="space-y-3" data-stock-header>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-snug break-words [overflow-wrap:anywhere] sm:text-3xl md:text-4xl">
            {displayName} <span className="text-lg font-medium text-muted-foreground sm:text-2xl">{titleSuffix}</span>
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="font-medium tracking-wide">{stock.symbol}</span>
            <span aria-hidden="true">·</span>
            <Link href={`${prefix}/category/${stock.category.toLowerCase()}`} className="rounded-sm hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring">{categoryLabel}</Link>
            {stock.sector && <>
              <span aria-hidden="true">·</span>
              {stock.sector === 'Semiconductors' ? <Link href={`${prefix}/category/semiconductor`} className="hover:text-foreground hover:underline">{sectorNames[stock.sector][language] ?? sectorNames[stock.sector].en}</Link> : <span>{sectorNames[stock.sector][language] ?? sectorNames[stock.sector].en}</span>}
            </>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 pt-0.5" data-stock-actions>
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
            size="default"
          />
          <ShareButton title={shareTitle} url={shareUrl} locale={locale} />
        </div>
      </div>
    </header>
  );
}
