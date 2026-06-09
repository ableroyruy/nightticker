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
  const locales = ['en', 'ko', 'ja'];

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

  const isKo = locale === 'ko';
  const isJa = locale === 'ja';
  const name = isKo ? stock.nameKo : isJa ? (stock.nameJa ?? stock.name) : stock.name;
  const isStock = ['US', 'KR', 'JP'].includes(stock.category);

  // 주식은 "주가", 나머지는 카테고리별 용어
  const priceTerms = {
    ko: isStock ? '주가' : stock.category === 'INDEX' ? '지수' : stock.category === 'FX' ? '환율' : '시세',
    en: 'price',
    ja: isStock ? '株価' : stock.category === 'INDEX' ? '指数' : stock.category === 'FX' ? '為替' : '相場',
  };

  const priceTerm = isJa ? priceTerms.ja : isKo ? priceTerms.ko : priceTerms.en;

  const meta = {
    ko: {
      title: `${name} 야간 ${priceTerm} - 주말/휴일 주식 시세 | 나이트티커`,
      description: `${name} 야간 ${priceTerm}를 확인하세요. 장마감 후, 주말, 휴일에도 ${name} ${isStock ? '주식 시세' : '시세'}를 모니터링할 수 있습니다. 하이퍼리퀴드 기반.`,
      keywords: [
        `${name} 야간 ${priceTerm}`,
        `${name} 주말 ${priceTerm}`,
        `${name} 휴일 ${priceTerm}`,
        `${name} 장마감 후`,
        isStock ? '야간 주가' : `야간 ${priceTerm}`,
        isStock ? '주말 주가' : `주말 ${priceTerm}`,
        '나이트티커',
      ],
    },
    en: {
      title: `${name} Night ${priceTerm.charAt(0).toUpperCase() + priceTerm.slice(1)} - Weekend & Holiday | NightTicker`,
      description: `Check ${name} night ${priceTerm}. Monitor ${name} ${isStock ? 'stock price' : priceTerm} after hours, on weekends, and holidays. Powered by Hyperliquid.`,
      keywords: [
        `${name} night ${priceTerm}`,
        `${name} after hours`,
        `${name} weekend ${priceTerm}`,
        `${name} holiday ${priceTerm}`,
        isStock ? 'night stock price' : `night ${priceTerm}`,
        'NightTicker',
      ],
    },
    ja: {
      title: `${name} 夜間${priceTerm} - 週末・休日相場 | ナイトティッカー`,
      description: `${name}の夜間${priceTerm}をチェック。市場終了後、週末、休日も${name}の${isStock ? '株価' : '相場'}を確認できます。ハイパーリキッド基盤。`,
      keywords: [
        `${name} 夜間${priceTerm}`,
        `${name} 週末${priceTerm}`,
        `${name} 休日${priceTerm}`,
        isStock ? '夜間株価' : `夜間${priceTerm}`,
        'ナイトティッカー',
      ],
    },
  };

  const current = isJa ? meta.ja : isKo ? meta.ko : meta.en;
  const canonicalUrl = locale === 'en' ? `${BASE_URL}/stock/${slug}` : `${BASE_URL}/${locale}/stock/${slug}`;

  return {
    title: current.title,
    description: current.description,
    keywords: current.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${BASE_URL}/stock/${slug}`,
        ko: `${BASE_URL}/ko/stock/${slug}`,
        ja: `${BASE_URL}/ja/stock/${slug}`,
      },
    },
    openGraph: {
      title: current.title,
      description: current.description,
      url: canonicalUrl,
      siteName: isJa ? 'ナイトティッカー' : isKo ? '나이트티커' : 'NightTicker',
      locale: isJa ? 'ja_JP' : isKo ? 'ko_KR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: current.title,
      description: current.description,
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

  const displayName = locale === 'ko' ? stock.nameKo : locale === 'ja' ? (stock.nameJa ?? stock.name) : stock.name;

  return (
    <div className="container py-8 space-y-8">
      {/* Stock Header - Name first, then Symbol */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl md:text-4xl font-bold">{displayName}</h1>
            <WatchlistButton
                symbol={stock.symbol}
                market={stock.category}
                name={stock.name}
                nameKo={stock.nameKo}
                slug={stock.slug}
              />
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
