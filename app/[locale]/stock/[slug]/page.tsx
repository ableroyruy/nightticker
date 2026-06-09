import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MarketPriceCard } from '@/components/market/MarketPriceCard';
import { WatchlistButton } from '@/components/market/WatchlistButton';
import { HyperliquidBadge } from '@/components/common/HyperliquidBadge';
import { ComplianceNotice } from '@/components/common/ComplianceNotice';
import { SourceMarketLink } from '@/components/common/SourceMarketLink';
import { getStockBySlug, getAllSlugs } from '@/lib/markets/stocks';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  const locales = ['en', 'ko'];

  return locales.flatMap((locale) =>
    slugs.map((slug) => ({
      locale,
      slug,
    }))
  );
}

const BASE_URL = 'https://nightticker.com';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const stock = getStockBySlug(slug);

  if (!stock) {
    return {
      title: 'Not Found',
    };
  }

  const name = locale === 'ko' ? stock.nameKo : stock.name;

  const title =
    locale === 'ko'
      ? `${name} (${stock.symbol}) 야간 시세 - 실시간 참고가격`
      : `${name} (${stock.symbol}) Night Price - Real-time Reference Price`;

  const description =
    locale === 'ko'
      ? `${name} (${stock.symbol}) 야간, 주말, 휴일 참고가격을 실시간으로 확인하세요. Hyperliquid 기준 시세이며 공식 거래소 가격이 아닙니다.`
      : `Check ${name} (${stock.symbol}) overnight, weekend, and holiday reference prices in real-time. Based on Hyperliquid market prices, not official exchange prices.`;

  const canonicalUrl =
    locale === 'ko' ? `${BASE_URL}/ko/stock/${slug}` : `${BASE_URL}/stock/${slug}`;

  return {
    title,
    description,
    keywords:
      locale === 'ko'
        ? [
            `${name} 야간 시세`,
            `${name} 주말 가격`,
            `${name} 휴일 시세`,
            `${stock.symbol} 야간 가격`,
            `${stock.symbol} 시세`,
            '야간 주식 시세',
            'overnight stock price',
            'hyperliquid',
          ]
        : [
            `${name} night price`,
            `${name} overnight price`,
            `${name} weekend price`,
            `${stock.symbol} price`,
            `${stock.symbol} after hours`,
            'overnight stock price',
            'weekend stock price',
            'hyperliquid',
          ],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${BASE_URL}/stock/${slug}`,
        ko: `${BASE_URL}/ko/stock/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'NightTicker',
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function StockPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const stock = getStockBySlug(slug);
  if (!stock) {
    notFound();
  }

  const faq = await getTranslations('faq');

  const displayName = locale === 'ko' ? stock.nameKo : stock.name;

  return (
    <div className="container py-8 space-y-8">
      {/* Stock Header - Name first, then Symbol */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl md:text-4xl font-bold">{displayName}</h1>
            <WatchlistButton symbol={stock.symbol} />
          </div>
          <p className="text-lg text-muted-foreground">{stock.symbol}</p>
        </div>
        <HyperliquidBadge />
      </div>

      <Separator />

      {/* Real-time Price Card */}
      <MarketPriceCard hyperliquidSymbol={stock.hyperliquidSymbol} locale={locale} />

      {/* Source Market Link */}
      <Card>
        <CardContent className="py-6">
          <SourceMarketLink symbol={stock.hyperliquidSymbol} />
        </CardContent>
      </Card>

      {/* Compliance Notice */}
      <ComplianceNotice variant="compact" />

      <Separator />

      {/* FAQ Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">{faq('title')}</h2>
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

      {/* Full Compliance Notice */}
      <ComplianceNotice />
    </div>
  );
}
