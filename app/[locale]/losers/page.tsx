import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { LosersPage } from '@/components/pages/LosersPage';

type Props = {
  params: Promise<{ locale: string }>;
};

const BASE_URL = 'https://www.nightticker.com';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const isJa = locale === 'ja';

  const meta = {
    ko: {
      title: '급락주 - 야간 주가 하락률 상위 종목 | 나이트티커',
      description: '야간 주가 기준 하락률 상위 종목을 확인하세요. 24시간 동안 가장 많이 하락한 미국, 한국 주식을 모니터링합니다. 하이퍼리퀴드 기반.',
      keywords: ['급락주', '야간 급락주', '하락률 상위', '야간 주가 하락', '미국주식 급락', '나이트티커'],
    },
    en: {
      title: 'Top Losers - Night Stock Price Losers | NightTicker',
      description: 'Check top losing stocks by overnight price changes. See which US and Korean stocks have dropped the most. Powered by Hyperliquid.',
      keywords: ['top losers', 'stock losers', 'night price losers', 'biggest losers', 'NightTicker'],
    },
    ja: {
      title: '急落銘柄 - 夜間株価下落率上位 | ナイトティッカー',
      description: '夜間株価基準の下落率上位銘柄をチェック。24時間で最も下落した銘柄を確認。ハイパーリキッド基盤。',
      keywords: ['急落銘柄', '夜間株価下落', '下落率上位', 'ナイトティッカー'],
    },
  };

  const current = isJa ? meta.ja : isKo ? meta.ko : meta.en;
  const canonicalUrl = locale === 'en' ? `${BASE_URL}/losers` : `${BASE_URL}/${locale}/losers`;

  return {
    title: current.title,
    description: current.description,
    keywords: current.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${BASE_URL}/losers`,
        ko: `${BASE_URL}/ko/losers`,
        ja: `${BASE_URL}/ja/losers`,
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

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LosersPage />;
}
