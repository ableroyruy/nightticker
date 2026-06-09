'use client';

import Link from 'next/link';
import { Stock, StockCategory } from '@/lib/providers/types';
import {
  getRelatedStocks,
  getPopularByCategory,
  categoryNames,
  sectorNames,
  getStocksByCategory,
} from '@/lib/markets/stocks';

interface InternalLinksProps {
  stock: Stock;
  locale: string;
}

const allCategories: StockCategory[] = ['US', 'KR', 'JP', 'INDEX', 'ETF', 'COMMODITY', 'FX'];

export function InternalLinks({ stock, locale }: InternalLinksProps) {
  const relatedStocks = getRelatedStocks(stock, 5);
  const popularInCategory = getPopularByCategory(stock.category, 5).filter(
    (s) => s.symbol !== stock.symbol
  );

  const getName = (s: Stock) =>
    locale === 'ko' ? s.nameKo : locale === 'ja' ? (s.nameJa ?? s.name) : s.name;

  const getCategoryName = (cat: StockCategory) =>
    locale === 'ko'
      ? categoryNames[cat].ko
      : locale === 'ja'
        ? categoryNames[cat].ja
        : categoryNames[cat].en;

  const getSectorName = () => {
    if (!stock.sector) return null;
    return locale === 'ko'
      ? sectorNames[stock.sector].ko
      : locale === 'ja'
        ? sectorNames[stock.sector].ja
        : sectorNames[stock.sector].en;
  };

  const linkPrefix = locale === 'en' ? '' : `/${locale}`;

  const labels = {
    relatedStocks: {
      en: 'Related Stocks',
      ko: '관련 종목',
      ja: '関連銘柄',
    },
    popularInCategory: {
      en: `Popular ${getCategoryName(stock.category)}`,
      ko: `인기 ${getCategoryName(stock.category)}`,
      ja: `人気${getCategoryName(stock.category)}`,
    },
    sameSector: {
      en: `${getSectorName()} Sector`,
      ko: `${getSectorName()} 섹터`,
      ja: `${getSectorName()}セクター`,
    },
    categories: {
      en: 'Browse by Category',
      ko: '카테고리별 보기',
      ja: 'カテゴリー別',
    },
    infoPages: {
      en: 'Learn More',
      ko: '더 알아보기',
      ja: 'もっと知る',
    },
  };

  const getLabel = (key: keyof typeof labels) => {
    const label = labels[key];
    return locale === 'ko' ? label.ko : locale === 'ja' ? label.ja : label.en;
  };

  return (
    <div className="space-y-8">
      {/* Related Stocks (Same Sector) */}
      {relatedStocks.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-4">{getLabel('relatedStocks')}</h3>
          <div className="flex flex-wrap gap-2">
            {relatedStocks.map((s) => (
              <Link
                key={s.symbol}
                href={`${linkPrefix}/stock/${s.slug}`}
                className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition-colors"
              >
                {getName(s)}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Popular in Same Category */}
      {popularInCategory.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-4">{getLabel('popularInCategory')}</h3>
          <div className="flex flex-wrap gap-2">
            {popularInCategory.map((s) => (
              <Link
                key={s.symbol}
                href={`${linkPrefix}/stock/${s.slug}`}
                className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition-colors"
              >
                {getName(s)}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Category Links */}
      <section>
        <h3 className="text-lg font-semibold mb-4">{getLabel('categories')}</h3>
        <div className="flex flex-wrap gap-2">
          {allCategories.map((cat) => (
            <Link
              key={cat}
              href={`${linkPrefix}/category/${cat.toLowerCase()}`}
              className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 rounded-md text-sm transition-colors"
            >
              {getCategoryName(cat)}
            </Link>
          ))}
        </div>
      </section>

      {/* Info Page Links */}
      <section>
        <h3 className="text-lg font-semibold mb-4">{getLabel('infoPages')}</h3>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`${linkPrefix}/overnight-prices`}
            className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition-colors"
          >
            {locale === 'ko' ? '야간 가격' : locale === 'ja' ? '夜間価格' : 'Overnight Prices'}
          </Link>
          <Link
            href={`${linkPrefix}/weekend-prices`}
            className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition-colors"
          >
            {locale === 'ko' ? '주말 가격' : locale === 'ja' ? '週末価格' : 'Weekend Prices'}
          </Link>
          <Link
            href={`${linkPrefix}/holiday-prices`}
            className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition-colors"
          >
            {locale === 'ko' ? '휴일 가격' : locale === 'ja' ? '休日価格' : 'Holiday Prices'}
          </Link>
          <Link
            href={`${linkPrefix}/how-data-works`}
            className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition-colors"
          >
            {locale === 'ko' ? '데이터 작동 방식' : locale === 'ja' ? 'データの仕組み' : 'How Data Works'}
          </Link>
          <Link
            href={`${linkPrefix}/what-is-hyperliquid`}
            className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition-colors"
          >
            {locale === 'ko' ? '하이퍼리퀴드란' : locale === 'ja' ? 'ハイパーリキッドとは' : 'What is Hyperliquid'}
          </Link>
        </div>
      </section>
    </div>
  );
}
