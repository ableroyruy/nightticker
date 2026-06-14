import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { HomePage } from '@/components/pages/HomePage';

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
      title: '야간 주가 - 주말/휴일 주식 시세 | 나이트티커',
      description: '미국주식, 한국주식 야간 주가를 확인하세요. 주말, 휴일, 장마감 후 테슬라, 엔비디아, 삼성전자 등 주요 종목의 주식 시세를 제공합니다. 하이퍼리퀴드 기반.',
      keywords: [
        '야간 주가',
        '테슬라 야간 주가',
        '엔비디아 야간 주가',
        '삼성전자 야간 주가',
        '미국주식 야간 주가',
        '주말 주가',
        '휴일 주가',
        '장마감 후 주가',
        '나이트티커',
      ],
    },
    en: {
      title: 'Overnight Stock Prices - Weekend & Holiday Market Prices | NightTicker',
      description: 'Check US and Korean overnight stock prices. Get weekend, holiday, and after-hours market prices for Tesla, Nvidia, Apple, Samsung and more. Powered by Hyperliquid.',
      keywords: [
        'night stock price',
        'Tesla night price',
        'Nvidia after hours',
        'Apple weekend price',
        'after hours stock price',
        'weekend stock price',
        'holiday stock price',
        'NightTicker',
      ],
    },
    ja: {
      title: '夜間株価 - 週末・休日の株式相場 | ナイトティッカー',
      description: '米国株・韓国株の夜間株価をチェック。週末、休日、市場終了後のテスラ、エヌビディア、サムスンなどの株式相場を提供。ハイパーリキッド基盤。',
      keywords: [
        '夜間株価',
        'テスラ 夜間株価',
        'エヌビディア 夜間株価',
        '米国株 夜間',
        '週末 株価',
        '休日 株価',
        'ナイトティッカー',
      ],
    },
  };

  const current = isJa ? meta.ja : isKo ? meta.ko : meta.en;

  return {
    title: current.title,
    description: current.description,
    keywords: current.keywords,
    alternates: {
      canonical: locale === 'en' ? BASE_URL : `${BASE_URL}/${locale}`,
      languages: {
        en: BASE_URL,
        ko: `${BASE_URL}/ko`,
        ja: `${BASE_URL}/ja`,
      },
    },
    openGraph: {
      title: current.title,
      description: current.description,
      url: locale === 'en' ? BASE_URL : `${BASE_URL}/${locale}`,
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

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomePage />;
}
