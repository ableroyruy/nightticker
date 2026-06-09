import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CategoryPage } from '@/components/pages/CategoryPage';
import { StockCategory } from '@/lib/providers/types';
import { getStocksByCategory } from '@/lib/markets/stocks';

type Props = {
  params: Promise<{ locale: string; category: string }>;
};

const BASE_URL = 'https://nightticker.com';

const validCategories: StockCategory[] = ['US', 'KR', 'JP', 'INDEX', 'ETF', 'COMMODITY', 'FX', 'SPECIAL'];

function getCategoryFromSlug(slug: string): StockCategory | null {
  const upper = slug.toUpperCase() as StockCategory;
  return validCategories.includes(upper) ? upper : null;
}

export async function generateStaticParams() {
  const categories = validCategories.map((cat) => cat.toLowerCase());
  return categories.map((category) => ({ category }));
}

const categoryMeta: Record<string, {
  en: { title: string; desc: string; keywords: string[] };
  ko: { title: string; desc: string; keywords: string[] };
  ja: { title: string; desc: string; keywords: string[] };
}> = {
  US: {
    en: {
      title: 'US Stocks Night Prices',
      desc: 'Check US stocks night prices. Get after-hours quotes for Apple, Tesla, Nvidia, Microsoft, Google and more. Powered by Hyperliquid.',
      keywords: ['US stock night price', 'Apple night price', 'Tesla after hours', 'Nvidia night price', 'NASDAQ after hours', 'NightTicker']
    },
    ko: {
      title: '미국주식 야간 주가',
      desc: '미국주식 야간 주가를 확인하세요. 애플, 테슬라, 엔비디아, 마이크로소프트 등 미국 주식의 장마감 후 주가를 제공합니다. 하이퍼리퀴드 기반.',
      keywords: ['미국주식 야간 주가', '애플 야간 주가', '테슬라 야간 주가', '엔비디아 야간 주가', '나스닥 야간', '나이트티커']
    },
    ja: {
      title: '米国株 夜間株価',
      desc: '米国株の夜間株価をチェック。アップル、テスラ、エヌビディアなどの市場終了後の株価を提供。ハイパーリキッド基盤。',
      keywords: ['米国株 夜間株価', 'アップル 夜間株価', 'テスラ 夜間株価', 'ナスダック 夜間', 'ナイトティッカー']
    },
  },
  KR: {
    en: {
      title: 'Korean Stocks Night Prices',
      desc: 'Check Korean stocks night prices. Get after-hours quotes for Samsung, SK Hynix, Hyundai and more. Powered by Hyperliquid.',
      keywords: ['Korean stock night price', 'Samsung night price', 'SK Hynix after hours', 'KOSPI night', 'NightTicker']
    },
    ko: {
      title: '한국주식 야간 주가',
      desc: '한국주식 야간 주가를 확인하세요. 삼성전자, SK하이닉스, 현대차 등 한국 주식의 장마감 후 주가를 제공합니다. 하이퍼리퀴드 기반.',
      keywords: ['한국주식 야간 주가', '삼성전자 야간 주가', 'SK하이닉스 야간 주가', '코스피 야간', '나이트티커']
    },
    ja: {
      title: '韓国株 夜間株価',
      desc: '韓国株の夜間株価をチェック。サムスン、SKハイニックス、現代自動車などの株価を提供。ハイパーリキッド基盤。',
      keywords: ['韓国株 夜間株価', 'サムスン 夜間株価', 'KOSPI 夜間', 'ナイトティッカー']
    },
  },
  JP: {
    en: {
      title: 'Japanese Stocks Night Prices',
      desc: 'Check Japanese stocks night prices. Get after-hours quotes for SoftBank, Kioxia and more. Powered by Hyperliquid.',
      keywords: ['Japanese stock night price', 'SoftBank night price', 'Nikkei after hours', 'NightTicker']
    },
    ko: {
      title: '일본주식 야간 주가',
      desc: '일본주식 야간 주가를 확인하세요. 소프트뱅크, 키옥시아 등 일본 주식의 장마감 후 주가를 제공합니다. 하이퍼리퀴드 기반.',
      keywords: ['일본주식 야간 주가', '소프트뱅크 야간 주가', '니케이 야간', '나이트티커']
    },
    ja: {
      title: '日本株 夜間株価',
      desc: '日本株の夜間株価をチェック。ソフトバンク、キオクシアなどの市場終了後の株価を提供。ハイパーリキッド基盤。',
      keywords: ['日本株 夜間株価', 'ソフトバンク 夜間株価', '日経 夜間', 'ナイトティッカー']
    },
  },
  INDEX: {
    en: {
      title: 'Night Index Prices - S&P500, NASDAQ',
      desc: 'Check night index prices. Get S&P 500, NASDAQ 100, KOSPI 200, Nikkei 225 after-hours quotes. Powered by Hyperliquid.',
      keywords: ['S&P 500 night price', 'NASDAQ night index', 'index after hours', 'KOSPI night', 'NightTicker']
    },
    ko: {
      title: '야간 지수 시세 - S&P500, 나스닥, 코스피',
      desc: '야간 지수 시세를 확인하세요. S&P500, 나스닥100, 코스피200, 니케이225 등 주요 지수의 장마감 후 시세를 제공합니다. 하이퍼리퀴드 기반.',
      keywords: ['야간 지수 시세', 'S&P500 야간', '나스닥 야간 지수', '코스피 야간', '나이트티커']
    },
    ja: {
      title: '夜間指数相場 - S&P500, ナスダック',
      desc: '夜間指数相場をチェック。S&P500、ナスダック100、KOSPI200、日経225の市場終了後の相場を提供。ハイパーリキッド基盤。',
      keywords: ['夜間指数', 'S&P500 夜間', 'ナスダック 夜間', '日経 夜間', 'ナイトティッカー']
    },
  },
  ETF: {
    en: {
      title: 'Night ETF Prices',
      desc: 'Check night ETF prices. Get after-hours quotes for Korea, Japan, Brazil ETFs and more. Powered by Hyperliquid.',
      keywords: ['ETF night price', 'ETF after hours', 'NightTicker']
    },
    ko: {
      title: '야간 ETF 시세',
      desc: '야간 ETF 시세를 확인하세요. 한국, 일본, 브라질 ETF 등의 장마감 후 시세를 제공합니다. 하이퍼리퀴드 기반.',
      keywords: ['야간 ETF 시세', 'ETF 야간', '나이트티커']
    },
    ja: {
      title: '夜間ETF相場',
      desc: '夜間ETF相場をチェック。韓国、日本、ブラジルETFなどの市場終了後の相場を提供。ハイパーリキッド基盤。',
      keywords: ['夜間ETF', 'ETF 夜間相場', 'ナイトティッカー']
    },
  },
  COMMODITY: {
    en: {
      title: 'Night Commodity Prices - Gold, Oil, Silver',
      desc: 'Check night commodity prices. Get gold, silver, oil, natural gas after-hours quotes. Powered by Hyperliquid.',
      keywords: ['gold night price', 'oil night price', 'silver night price', 'commodity after hours', 'NightTicker']
    },
    ko: {
      title: '야간 원자재 시세 - 금, 은, 원유',
      desc: '야간 원자재 시세를 확인하세요. 금, 은, 원유, 천연가스 등의 장마감 후 시세를 제공합니다. 하이퍼리퀴드 기반.',
      keywords: ['야간 원자재 시세', '금 야간 시세', '원유 야간 시세', '은 야간 시세', '나이트티커']
    },
    ja: {
      title: '夜間商品相場 - 金, 銀, 原油',
      desc: '夜間商品相場をチェック。金、銀、原油、天然ガスの市場終了後の相場を提供。ハイパーリキッド基盤。',
      keywords: ['夜間商品相場', '金 夜間', '原油 夜間', 'ナイトティッカー']
    },
  },
  FX: {
    en: {
      title: 'Night FX Rates - USD, EUR, JPY',
      desc: 'Check night FX rates. Get EUR, JPY, GBP, KRW after-hours exchange rates. Powered by Hyperliquid.',
      keywords: ['forex night rate', 'EUR night rate', 'JPY night rate', 'currency after hours', 'NightTicker']
    },
    ko: {
      title: '야간 환율 - 달러, 유로, 엔',
      desc: '야간 환율을 확인하세요. 달러, 유로, 엔, 파운드 등의 장마감 후 환율을 제공합니다. 하이퍼리퀴드 기반.',
      keywords: ['야간 환율', '달러 야간 환율', '엔화 야간 환율', '유로 야간 환율', '나이트티커']
    },
    ja: {
      title: '夜間為替レート - ドル, ユーロ, 円',
      desc: '夜間為替レートをチェック。ドル、ユーロ、ポンドなどの市場終了後の為替を提供。ハイパーリキッド基盤。',
      keywords: ['夜間為替', 'ドル 夜間', 'ユーロ 夜間', 'ナイトティッカー']
    },
  },
  SPECIAL: {
    en: {
      title: 'Special Assets Night Prices - H100 GPU, DRAM',
      desc: 'Check special assets night prices. Get H100 GPU, DRAM after-hours quotes. Powered by Hyperliquid.',
      keywords: ['H100 night price', 'DRAM night price', 'GPU price', 'NightTicker']
    },
    ko: {
      title: '특별 자산 야간 시세 - H100 GPU, DRAM',
      desc: '특별 자산 야간 시세를 확인하세요. H100 GPU, DRAM 등의 시세를 제공합니다. 하이퍼리퀴드 기반.',
      keywords: ['H100 야간 시세', 'DRAM 야간 시세', 'GPU 시세', '나이트티커']
    },
    ja: {
      title: '特別資産 夜間相場 - H100 GPU, DRAM',
      desc: '特別資産の夜間相場をチェック。H100 GPU、DRAMなどの相場を提供。ハイパーリキッド基盤。',
      keywords: ['H100 夜間', 'DRAM 夜間', 'ナイトティッカー']
    },
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category: categorySlug } = await params;
  const category = getCategoryFromSlug(categorySlug);

  if (!category) {
    return { title: 'Not Found' };
  }

  const isKo = locale === 'ko';
  const isJa = locale === 'ja';
  const defaultMeta = { title: category, desc: '', keywords: [] as string[] };
  const meta = categoryMeta[category] || { en: defaultMeta, ko: defaultMeta, ja: defaultMeta };
  const current = isJa ? meta.ja : isKo ? meta.ko : meta.en;

  const title = `${current.title} | ${isJa ? 'ナイトティッカー' : isKo ? '나이트티커' : 'NightTicker'}`;
  const canonicalUrl = locale === 'en' ? `${BASE_URL}/category/${categorySlug}` : `${BASE_URL}/${locale}/category/${categorySlug}`;

  return {
    title,
    description: current.desc,
    keywords: current.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${BASE_URL}/category/${categorySlug}`,
        ko: `${BASE_URL}/ko/category/${categorySlug}`,
        ja: `${BASE_URL}/ja/category/${categorySlug}`,
      },
    },
    openGraph: {
      title,
      description: current.desc,
      url: canonicalUrl,
      siteName: isJa ? 'ナイトティッカー' : isKo ? '나이트티커' : 'NightTicker',
      locale: isJa ? 'ja_JP' : isKo ? 'ko_KR' : 'en_US',
      type: 'website',
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale, category: categorySlug } = await params;
  setRequestLocale(locale);

  const category = getCategoryFromSlug(categorySlug);

  if (!category) {
    notFound();
  }

  // Check if category has any stocks
  const stocks = getStocksByCategory(category);
  if (stocks.length === 0) {
    notFound();
  }

  return <CategoryPage category={category} />;
}
