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
      title: '주말 주가 - 토요일/일요일 주식 시세 | 나이트티커',
      description: '주말 주가를 확인하세요. 토요일, 일요일에도 테슬라, 엔비디아, 삼성전자 등 주요 종목의 주식 시세를 제공합니다. 하이퍼리퀴드 기반.',
      keywords: ['주말 주가', '토요일 주가', '일요일 주가', '주말 주식 시세', '미국주식 주말', '나이트티커'],
    },
    en: {
      title: 'Weekend Stock Prices - Saturday & Sunday Quotes | NightTicker',
      description: 'Check weekend stock prices. Get Saturday and Sunday quotes for Tesla, Nvidia, Apple, Samsung and more. Powered by Hyperliquid.',
      keywords: ['weekend stock price', 'saturday stock price', 'sunday stock price', 'weekend market', 'NightTicker'],
    },
    ja: {
      title: '週末株価 - 土曜・日曜の株式相場 | ナイトティッカー',
      description: '週末の株価をチェック。土曜日、日曜日もテスラ、エヌビディアなどの株価を提供。ハイパーリキッド基盤。',
      keywords: ['週末株価', '土曜 株価', '日曜 株価', 'ナイトティッカー'],
    },
  };

  const current = isJa ? meta.ja : isKo ? meta.ko : meta.en;
  const canonicalUrl = locale === 'en' ? `${BASE_URL}/weekend-prices` : `${BASE_URL}/${locale}/weekend-prices`;

  return {
    title: current.title,
    description: current.description,
    keywords: current.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${BASE_URL}/weekend-prices`,
        ko: `${BASE_URL}/ko/weekend-prices`,
        ja: `${BASE_URL}/ja/weekend-prices`,
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

export default async function WeekendPricesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.weekend');
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
          {locale === 'ko' ? '주말 참고 가격' : 'Weekend Reference Prices'}
        </h2>
        <StockGrid stocks={stocks} />
      </section>

      <Separator />

      <ComplianceNotice />
    </div>
  );
}
