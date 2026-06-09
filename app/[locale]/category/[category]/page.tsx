import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CategoryPage } from '@/components/pages/CategoryPage';
import { StockCategory } from '@/lib/providers/types';
import { getStocksByCategory } from '@/lib/markets/stocks';

type Props = {
  params: Promise<{ locale: string; category: string }>;
};

const BASE_URL = 'https://nightticker.com';

const validCategories: StockCategory[] = ['US', 'KR', 'JP', 'INDEX', 'ETF', 'COMMODITY', 'FX', 'SPECIAL'];

function getCategoryFromSlug(slug: string): StockCategory | null {
  const upper = slug.toUpperCase() as StockCategory;
  return validCategories.includes(upper) ? upper : null;
}

export async function generateStaticParams() {
  const categories = validCategories.map((cat) => cat.toLowerCase());
  return categories.map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category: categorySlug } = await params;
  const category = getCategoryFromSlug(categorySlug);

  if (!category) {
    return { title: 'Not Found' };
  }

  const t = await getTranslations({ locale, namespace: 'categories' });
  const categoryName = t(category);

  const title = locale === 'ko'
    ? `${categoryName} - 야간 시세 | NightTicker`
    : `${categoryName} - Night Prices | NightTicker`;

  const description = locale === 'ko'
    ? `${categoryName} 야간/주말/휴일 참고 가격. Hyperliquid Market Prices 기준.`
    : `${categoryName} overnight, weekend, and holiday reference prices. Powered by Hyperliquid Market Prices.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}${locale === 'ko' ? '/ko' : ''}/category/${categorySlug}`,
      languages: {
        en: `${BASE_URL}/category/${categorySlug}`,
        ko: `${BASE_URL}/ko/category/${categorySlug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}${locale === 'ko' ? '/ko' : ''}/category/${categorySlug}`,
      siteName: 'NightTicker',
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      type: 'website',
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale, category: categorySlug } = await params;
  setRequestLocale(locale);

  const category = getCategoryFromSlug(categorySlug);

  if (!category) {
    notFound();
  }

  // Check if category has any stocks
  const stocks = getStocksByCategory(category);
  if (stocks.length === 0) {
    notFound();
  }

  return <CategoryPage category={category} />;
}
