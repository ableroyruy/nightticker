import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Moon } from 'lucide-react';
import { StockSearch } from '@/components/market/StockSearch';
import { StockGrid } from '@/components/market/StockGrid';
import { MarketClock } from '@/components/market/MarketClock';
import { HyperliquidBadge } from '@/components/common/HyperliquidBadge';
import { ComplianceNotice } from '@/components/common/ComplianceNotice';
import { Separator } from '@/components/ui/separator';
import { getMarketDataByCategory } from '@/lib/providers/market-data-provider';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site' });

  return {
    title: `${t('name')} - ${t('tagline')}`,
    description: t('description'),
    alternates: {
      canonical: '/',
      languages: {
        en: '/',
        ko: '/ko',
      },
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('hero');
  const sections = await getTranslations('sections');
  const faq = await getTranslations('faq');

  // Fetch market data
  const usStocks = await getMarketDataByCategory('US');
  const krStocks = await getMarketDataByCategory('KR');
  const indexMarkets = await getMarketDataByCategory('INDEX');
  const popularStocks = usStocks.slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container text-center space-y-6">
          <div className="flex justify-center">
            <Moon className="h-16 w-16 text-primary" />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {t('title')}
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground">
            {t('subtitle')}
          </p>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>

          <div className="text-2xl md:text-3xl font-semibold text-primary space-x-4">
            <span>Overnight.</span>
            <span>Weekend.</span>
            <span>Holiday.</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <HyperliquidBadge />
            <p className="text-sm text-muted-foreground">{t('disclaimer')}</p>
          </div>

          {/* Search */}
          <div className="flex justify-center pt-4">
            <StockSearch />
          </div>

          {/* Market Clock */}
          <div className="pt-8 max-w-4xl mx-auto w-full">
            <MarketClock />
          </div>
        </div>
      </section>

      <Separator />

      {/* Popular Stocks */}
      <section className="py-12 container">
        <h2 className="text-2xl font-bold mb-6">{sections('popularStocks')}</h2>
        <StockGrid stocks={popularStocks} />
      </section>

      <Separator />

      {/* US Stocks */}
      <section className="py-12 container">
        <h2 className="text-2xl font-bold mb-6">{sections('usStocks')}</h2>
        <StockGrid stocks={usStocks} />
      </section>

      <Separator />

      {/* Korean Stocks */}
      <section className="py-12 container">
        <h2 className="text-2xl font-bold mb-6">{sections('koreanStocks')}</h2>
        <StockGrid stocks={krStocks} />
      </section>

      <Separator />

      {/* Index Markets */}
      <section className="py-12 container">
        <h2 className="text-2xl font-bold mb-6">{sections('indexMarkets')}</h2>
        <StockGrid stocks={indexMarkets} />
      </section>

      <Separator />

      {/* FAQ Section */}
      <section className="py-12 container">
        <h2 className="text-2xl font-bold mb-6">{faq('title')}</h2>
        <div className="space-y-6 max-w-3xl">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div key={num} className="space-y-2">
              <h3 className="font-semibold">{faq(`q${num}` as 'q1')}</h3>
              <p className="text-muted-foreground">{faq(`a${num}` as 'a1')}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Compliance Notice */}
      <section className="py-12 container">
        <ComplianceNotice />
      </section>
    </div>
  );
}
