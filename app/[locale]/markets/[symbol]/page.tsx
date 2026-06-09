import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PriceDisplay } from '@/components/market/PriceDisplay';
import { WatchlistButton } from '@/components/market/WatchlistButton';
import { HyperliquidBadge } from '@/components/common/HyperliquidBadge';
import { ComplianceNotice } from '@/components/common/ComplianceNotice';
import { SourceMarketLink } from '@/components/common/SourceMarketLink';
import { getMarketData } from '@/lib/providers/market-data-provider';
import { getStockBySymbol, getAllSymbols } from '@/lib/markets/stocks';
import { formatLastUpdated } from '@/lib/markets/hours';

type Props = {
  params: Promise<{ locale: string; symbol: string }>;
};

export async function generateStaticParams() {
  const symbols = getAllSymbols();
  const locales = ['en', 'ko'];

  return locales.flatMap((locale) =>
    symbols.map((symbol) => ({
      locale,
      symbol,
    }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, symbol } = await params;
  const stock = getStockBySymbol(symbol);

  if (!stock) {
    return {
      title: 'Not Found',
    };
  }

  const name = locale === 'ko' ? stock.nameKo : stock.name;
  const title =
    locale === 'ko'
      ? `${name} 야간 가격 | Hyperliquid Market Price`
      : `${name} Night Price | Hyperliquid Market Price`;

  const description =
    locale === 'ko'
      ? `Hyperliquid Market Prices 기준 ${name} 야간 참고가격을 확인하세요. 공식 거래소 가격이 아니며 참고용 정보입니다.`
      : `Check the current ${name} Night Price using Hyperliquid Market Prices. For reference purposes only. Not an official stock exchange price.`;

  return {
    title,
    description,
    keywords: [
      `${stock.name.toLowerCase()} night price`,
      `${stock.name.toLowerCase()} overnight price`,
      `${stock.symbol} price`,
      'hyperliquid',
    ],
    alternates: {
      canonical: `/markets/${symbol}`,
      languages: {
        en: `/markets/${symbol}`,
        ko: `/ko/markets/${symbol}`,
      },
    },
  };
}

export default async function MarketPage({ params }: Props) {
  const { locale, symbol } = await params;
  setRequestLocale(locale);

  const stock = getStockBySymbol(symbol);
  if (!stock) {
    notFound();
  }

  const t = await getTranslations('market');
  const faq = await getTranslations('faq');

  const marketData = await getMarketData(symbol);

  const displayName = locale === 'ko' ? stock.nameKo : stock.name;

  return (
    <div className="container py-8 space-y-8">
      {/* Stock Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold">{stock.symbol}</h1>
            <WatchlistButton symbol={stock.symbol} />
          </div>
          <p className="text-xl text-muted-foreground">{displayName}</p>
        </div>
        <HyperliquidBadge />
      </div>

      <Separator />

      {/* Price Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('currentPrice')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PriceDisplay
            price={marketData?.price?.price ?? null}
            size="lg"
          />

          {marketData?.price?.lastUpdated && (
            <div className="text-sm text-muted-foreground">
              <span>{t('lastUpdated')}: </span>
              <span>
                {formatLastUpdated(
                  new Date(marketData.price.lastUpdated),
                  locale
                )}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

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
