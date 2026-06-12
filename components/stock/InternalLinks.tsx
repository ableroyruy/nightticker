'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('stockDetail');
  const tLinks = useTranslations('internalLinks');
  const tCategories = useTranslations('categories');

  const relatedStocks = getRelatedStocks(stock, 5);
  const popularInCategory = getPopularByCategory(stock.category, 5).filter(
    (s) => s.symbol !== stock.symbol
  );

  const getName = (s: Stock) =>
    locale === 'ko' ? s.nameKo :
    locale === 'ja' ? (s.nameJa ?? s.name) :
    locale === 'zh' ? (s.nameZh ?? s.name) :
    locale === 'pt' ? (s.namePt ?? s.name) :
    locale === 'es' ? (s.nameEs ?? s.name) :
    s.name;

  const getCategoryName = (cat: StockCategory) => tCategories(cat);

  const getSectorName = () => {
    if (!stock.sector) return null;
    return locale === 'ko'
      ? sectorNames[stock.sector].ko
      : locale === 'ja'
        ? sectorNames[stock.sector].ja
        : sectorNames[stock.sector].en;
  };

  const linkPrefix = locale === 'en' ? '' : `/${locale}`;

  return (
    <div className="space-y-8">
      {/* Related Stocks (Same Sector) */}
      {relatedStocks.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-4">{t('relatedStocks')}</h3>
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
          <h3 className="text-lg font-semibold mb-4">{getCategoryName(stock.category)}</h3>
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
        <h3 className="text-lg font-semibold mb-4">{tCategories('all')}</h3>
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
        <h3 className="text-lg font-semibold mb-4">{t('faq')}</h3>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`${linkPrefix}/overnight-prices`}
            className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition-colors"
          >
            {tLinks('overnightPrices')}
          </Link>
          <Link
            href={`${linkPrefix}/weekend-prices`}
            className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition-colors"
          >
            {tLinks('weekendPrices')}
          </Link>
          <Link
            href={`${linkPrefix}/holiday-prices`}
            className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition-colors"
          >
            {tLinks('holidayPrices')}
          </Link>
          <Link
            href={`${linkPrefix}/how-data-works`}
            className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition-colors"
          >
            {tLinks('howDataWorks')}
          </Link>
          <Link
            href={`${linkPrefix}/what-is-hyperliquid`}
            className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition-colors"
          >
            {tLinks('whatIsHyperliquid')}
          </Link>
        </div>
      </section>
    </div>
  );
}
