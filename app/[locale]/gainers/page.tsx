import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { GainersPage } from '@/components/pages/GainersPage';

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
      title: '급등주 - 야간 주가 상승률 상위 종목 | 나이트티커',
      description: '야간 주가 기준 상승률 상위 종목을 확인하세요. 24시간 동안 가장 많이 오른 미국, 한국 주식을 모니터링합니다. 하이퍼리퀴드 기반.',
      keywords: ['급등주', '야간 급등주', '상승률 상위', '야간 주가 상승', '미국주식 급등', '나이트티커'],
    },
    en: {
      title: 'Top Gainers - Night Stock Price Gainers | NightTicker',
      description: 'Check top gaining stocks by overnight price changes. See which US and Korean stocks have risen the most. Powered by Hyperliquid.',
      keywords: ['top gainers', 'stock gainers', 'night price gainers', 'biggest gainers', 'NightTicker'],
    },
    ja: {
      title: '急騰銘柄 - 夜間株価上昇率上位 | ナイトティッカー',
      description: '夜間株価基準の上昇率上位銘柄をチェック。24時間で最も上昇した銘柄を確認。ハイパーリキッド基盤。',
      keywords: ['急騰銘柄', '夜間株価上昇', '上昇率上位', 'ナイトティッカー'],
    },
  };

  const current = isJa ? meta.ja : isKo ? meta.ko : meta.en;
  const canonicalUrl = locale === 'en' ? `${BASE_URL}/gainers` : `${BASE_URL}/${locale}/gainers`;

  return {
    title: current.title,
    description: current.description,
    keywords: current.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${BASE_URL}/gainers`,
        ko: `${BASE_URL}/ko/gainers`,
        ja: `${BASE_URL}/ja/gainers`,
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

  return <GainersPage />;
}
