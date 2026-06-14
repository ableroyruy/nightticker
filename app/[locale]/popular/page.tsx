import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { PopularSearchesPage } from '@/components/pages/PopularSearchesPage';

type Props = {
  params: Promise<{ locale: string }>;
};

const BASE_URL = 'https://www.nightticker.com';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const meta = {
    ko: {
      title: '인기 검색 순위 | 야간 주가 트렌드 | 나이트티커',
      description: '최근 24시간 동안 가장 많이 검색된 종목을 확인하세요. 실시간 인기 종목 순위와 48시간 전 대비 순위 변동을 제공합니다.',
      keywords: ['인기 검색', '인기 종목', '야간 주가', '트렌딩', '검색 순위', '나이트티커'],
    },
    en: {
      title: 'Popular Searches | Overnight Stock Trends | NightTicker',
      description: 'Check the most searched stocks in the last 24 hours. Real-time trending stocks with rank changes compared to 48 hours ago.',
      keywords: ['popular searches', 'trending stocks', 'overnight price', 'hot stocks', 'search ranking', 'NightTicker'],
    },
    ja: {
      title: '人気検索ランキング | 夜間株価トレンド | ナイトティッカー',
      description: '過去24時間で最も検索された銘柄を確認。リアルタイムの人気銘柄ランキングと48時間前との順位変動を提供。',
      keywords: ['人気検索', '人気銘柄', '夜間株価', 'トレンド', '検索ランキング'],
    },
    zh: {
      title: '热门搜索排名 | 夜间股价趋势 | NightTicker',
      description: '查看过去24小时内搜索最多的股票。实时热门股票排名及与48小时前的排名变化。',
      keywords: ['热门搜索', '热门股票', '夜间股价', '趋势', '搜索排名'],
    },
    pt: {
      title: 'Buscas Populares | Tendencias de Acoes Noturnas | NightTicker',
      description: 'Confira as acoes mais pesquisadas nas ultimas 24 horas. Ranking de acoes populares em tempo real com mudancas de posicao.',
      keywords: ['buscas populares', 'acoes em alta', 'preco noturno', 'trending', 'ranking'],
    },
    es: {
      title: 'Busquedas Populares | Tendencias de Acciones Nocturnas | NightTicker',
      description: 'Consulta las acciones mas buscadas en las ultimas 24 horas. Ranking de acciones populares en tiempo real con cambios de posicion.',
      keywords: ['busquedas populares', 'acciones en tendencia', 'precio nocturno', 'trending', 'ranking'],
    },
  };

  type MetaKey = 'en' | 'ko' | 'ja' | 'zh' | 'pt' | 'es';
  const current = meta[locale as MetaKey] ?? meta.en;
  const canonicalUrl = locale === 'en' ? `${BASE_URL}/popular` : `${BASE_URL}/${locale}/popular`;

  return {
    title: current.title,
    description: current.description,
    keywords: current.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${BASE_URL}/popular`,
        ko: `${BASE_URL}/ko/popular`,
        ja: `${BASE_URL}/ja/popular`,
        zh: `${BASE_URL}/zh/popular`,
        pt: `${BASE_URL}/pt/popular`,
        es: `${BASE_URL}/es/popular`,
      },
    },
    openGraph: {
      title: current.title,
      description: current.description,
      url: canonicalUrl,
      siteName: locale === 'ko' ? '나이트티커' : 'NightTicker',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: current.title,
      description: current.description,
    },
  };
}

export default async function PopularPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PopularSearchesPage />;
}
