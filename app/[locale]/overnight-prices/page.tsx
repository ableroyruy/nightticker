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
      title: '야간 주가 - 장마감 후 주식 시세 | 나이트티커',
      description: '장마감 후 야간 주가를 확인하세요. 테슬라, 엔비디아, 삼성전자 등 미국주식, 한국주식의 야간 주식 시세를 제공합니다. 하이퍼리퀴드 기반.',
      keywords: ['야간 주가', '장마감 후 주가', '야간 주식 시세', '미국주식 야간 주가', '한국주식 야간 주가', '나이트티커'],
    },
    en: {
      title: 'Overnight Stock Prices - After Hours Quotes | NightTicker',
      description: 'Check overnight stock prices after market close. Get Tesla, Nvidia, Apple, Samsung after-hours quotes. Powered by Hyperliquid.',
      keywords: ['overnight stock price', 'after hours stock price', 'night stock price', 'after market close', 'NightTicker'],
    },
    ja: {
      title: '夜間株価 - 市場終了後の株式相場 | ナイトティッカー',
      description: '市場終了後の夜間株価をチェック。テスラ、エヌビディア、サムスンなどの株価を提供。ハイパーリキッド基盤。',
      keywords: ['夜間株価', '市場終了後 株価', '米国株 夜間', 'ナイトティッカー'],
    },
  };

  const current = isJa ? meta.ja : isKo ? meta.ko : meta.en;
  const canonicalUrl = locale === 'en' ? `${BASE_URL}/overnight-prices` : `${BASE_URL}/${locale}/overnight-prices`;

  return {
    title: current.title,
    description: current.description,
    keywords: current.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${BASE_URL}/overnight-prices`,
        ko: `${BASE_URL}/ko/overnight-prices`,
        ja: `${BASE_URL}/ja/overnight-prices`,
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
