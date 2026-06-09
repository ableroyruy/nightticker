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

const BASE_URL = 'https://nightticker.com';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const isJa = locale === 'ja';

  const meta = {
    ko: {
      title: '휴일 주가 - 공휴일 주식 시세 | 나이트티커',
      description: '휴일 주가를 확인하세요. 공휴일, 휴장일에도 테슬라, 엔비디아, 삼성전자 등 주요 종목의 주식 시세를 제공합니다. 하이퍼리퀴드 기반.',
      keywords: ['휴일 주가', '공휴일 주가', '휴장일 주가', '휴일 주식 시세', '명절 주가', '나이트티커'],
    },
    en: {
      title: 'Holiday Stock Prices - Market Holiday Quotes | NightTicker',
      description: 'Check holiday stock prices. Get market holiday quotes for Tesla, Nvidia, Apple, Samsung and more. Powered by Hyperliquid.',
      keywords: ['holiday stock price', 'market holiday price', 'holiday market', 'NightTicker'],
    },
    ja: {
      title: '休日株価 - 祝日の株式相場 | ナイトティッカー',
      description: '休日の株価をチェック。祝日、市場休場日もテスラ、エヌビディアなどの株価を提供。ハイパーリキッド基盤。',
      keywords: ['休日株価', '祝日 株価', '市場休場 株価', 'ナイトティッカー'],
    },
  };

  const current = isJa ? meta.ja : isKo ? meta.ko : meta.en;
  const canonicalUrl = locale === 'en' ? `${BASE_URL}/holiday-prices` : `${BASE_URL}/${locale}/holiday-prices`;

  return {
    title: current.title,
    description: current.description,
    keywords: current.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${BASE_URL}/holiday-prices`,
        ko: `${BASE_URL}/ko/holiday-prices`,
        ja: `${BASE_URL}/ja/holiday-prices`,
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
  };
}

export default async function HolidayPricesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.holiday');
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
          {locale === 'ko' ? '휴일 참고 가격' : 'Holiday Reference Prices'}
        </h2>
        <StockGrid stocks={stocks} />
      </section>

      <Separator />

      <ComplianceNotice />
    </div>
  );
}
