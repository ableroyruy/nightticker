import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Separator } from '@/components/ui/separator';
import { StockGrid } from '@/components/market/StockGrid';
import { HyperliquidBadge } from '@/components/common/HyperliquidBadge';
import { ComplianceNotice } from '@/components/common/ComplianceNotice';
import { getAllMarketData } from '@/lib/providers/market-data-provider';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.overnight' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: '/overnight-prices',
      languages: {
        en: '/overnight-prices',
        ko: '/ko/overnight-prices',
      },
    },
  };
}

export default async function OvernightPricesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.overnight');
  const stocks = await getAllMarketData();

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold">{t('title')}</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          {t('description')}
        </p>
        <HyperliquidBadge />
      </div>

      <Separator />

      <div className="prose dark:prose-invert max-w-3xl">
        <p>{t('content')}</p>
      </div>

      <Separator />

      <section>
        <h2 className="text-2xl font-bold mb-6">
          {locale === 'ko' ? '야간 참고 가격' : 'Overnight Reference Prices'}
        </h2>
        <StockGrid stocks={stocks} />
      </section>

      <Separator />

      <ComplianceNotice />
    </div>
  );
}
