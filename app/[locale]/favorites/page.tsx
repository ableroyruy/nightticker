import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { FavoritesPage } from '@/components/pages/FavoritesPage';

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
      title: '즐겨찾기 - 내 관심 종목 야간 주가 | 나이트티커',
      description: '내가 즐겨찾기한 종목의 야간 주가를 한눈에 확인하세요. 관심 종목의 야간, 주말, 휴일 주식 시세를 모니터링합니다. 하이퍼리퀴드 기반.',
      keywords: ['관심 종목', '즐겨찾기 종목', '야간 주가', '관심 주식', '나이트티커'],
    },
    en: {
      title: 'Favorites - My Watchlist Night Prices | NightTicker',
      description: 'Check night prices for your favorite stocks at a glance. Monitor overnight, weekend, and holiday reference prices for your watchlist. Powered by Hyperliquid.',
      keywords: ['watchlist', 'favorite stocks', 'night prices', 'stock watchlist', 'NightTicker'],
    },
    ja: {
      title: 'お気に入り - 関心銘柄の夜間株価 | ナイトティッカー',
      description: 'お気に入り銘柄の夜間株価を一目で確認。関心銘柄の夜間、週末、休日の株価を監視。ハイパーリキッド基盤。',
      keywords: ['お気に入り', '関心銘柄', '夜間株価', 'ナイトティッカー'],
    },
  };

  const current = isJa ? meta.ja : isKo ? meta.ko : meta.en;
  const canonicalUrl = locale === 'en' ? `${BASE_URL}/favorites` : `${BASE_URL}/${locale}/favorites`;

  return {
    title: current.title,
    description: current.description,
    keywords: current.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${BASE_URL}/favorites`,
        ko: `${BASE_URL}/ko/favorites`,
        ja: `${BASE_URL}/ja/favorites`,
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

  return <FavoritesPage />;
}
