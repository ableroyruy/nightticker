import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CategoryPage } from '@/components/pages/CategoryPage';
import { StockCategory } from '@/lib/providers/types';
import { getStocksByCategory, getStocksBySectorForCategory } from '@/lib/markets/stocks';

type Props = {
  params: Promise<{ locale: string; category: string }>;
};

const BASE_URL = 'https://www.nightticker.com';

const validCategories: StockCategory[] = ['US', 'KR', 'JP', 'INDEX', 'ETF', 'COMMODITY', 'FX', 'SPECIAL', 'SEMICONDUCTOR'];

function getCategoryFromSlug(slug: string): StockCategory | null {
  const upper = slug.toUpperCase() as StockCategory;
  return validCategories.includes(upper) ? upper : null;
}

export async function generateStaticParams() {
  const categories = validCategories.map((cat) => cat.toLowerCase());
  return categories.map((category) => ({ category }));
}

// New SEO Strategy: English uses "Overnight", Korean uses "야간", Chinese uses "夜间"
const categoryMeta: Record<string, {
  en: { title: string; desc: string; keywords: string[] };
  ko: { title: string; desc: string; keywords: string[] };
  ja: { title: string; desc: string; keywords: string[] };
  zh: { title: string; desc: string; keywords: string[] };
}> = {
  US: {
    en: {
      title: 'Overnight US Stock Prices | Weekend & Holiday',
      desc: 'Check overnight US stock prices. Monitor Apple, Tesla, Nvidia, Microsoft, Google weekend and holiday prices. Powered by Hyperliquid.',
      keywords: ['overnight stock price', 'weekend stock price', 'Apple overnight', 'Tesla overnight', 'Nvidia weekend price', 'NightTicker']
    },
    ko: {
      title: '미국주식 야간 주가 | 주말·휴일',
      desc: '미국주식 야간 주가를 확인하세요. 애플, 테슬라, 엔비디아, 마이크로소프트 등의 주말·휴일 주가를 제공합니다. 하이퍼리퀴드 기반.',
      keywords: ['미국주식 야간 주가', '애플 야간 주가', '테슬라 야간 주가', '엔비디아 야간 주가', '주말 주가', '나이트티커']
    },
    ja: {
      title: '米国株 夜間株価 | 週末・休日',
      desc: '米国株の夜間株価をチェック。アップル、テスラ、エヌビディアの週末・休日株価を提供。ハイパーリキッド基盤。',
      keywords: ['米国株 夜間株価', 'アップル 夜間株価', 'テスラ 夜間株価', '週末 株価', 'ナイトティッカー']
    },
    zh: {
      title: '美股夜间股价 | 周末·节假日',
      desc: '查看美股夜间股价。提供苹果、特斯拉、英伟达、微软等的周末·节假日股价。基于Hyperliquid。',
      keywords: ['美股夜间股价', '苹果夜间股价', '特斯拉夜间股价', '英伟达夜间股价', '周末股价', 'NightTicker']
    },
  },
  KR: {
    en: {
      title: 'Overnight Korean Stock Prices | Weekend & Holiday',
      desc: 'Check overnight Korean stock prices. Monitor Samsung, SK Hynix, Hyundai weekend and holiday prices. Powered by Hyperliquid.',
      keywords: ['overnight Korean stock', 'Samsung overnight', 'SK Hynix weekend price', 'KOSPI overnight', 'NightTicker']
    },
    ko: {
      title: '한국주식 야간 주가 | 주말·휴일',
      desc: '한국주식 야간 주가를 확인하세요. 삼성전자, SK하이닉스, 현대차 등의 주말·휴일 주가를 제공합니다. 하이퍼리퀴드 기반.',
      keywords: ['한국주식 야간 주가', '삼성전자 야간 주가', 'SK하이닉스 야간 주가', '주말 주가', '나이트티커']
    },
    ja: {
      title: '韓国株 夜間株価 | 週末・休日',
      desc: '韓国株の夜間株価をチェック。サムスン、SKハイニックスの週末・休日株価を提供。ハイパーリキッド基盤。',
      keywords: ['韓国株 夜間株価', 'サムスン 夜間株価', '週末 株価', 'ナイトティッカー']
    },
    zh: {
      title: '韩股夜间股价 | 周末·节假日',
      desc: '查看韩股夜间股价。提供三星电子、SK海力士、现代汽车等的周末·节假日股价。基于Hyperliquid。',
      keywords: ['韩股夜间股价', '三星电子夜间股价', 'SK海力士夜间股价', '周末股价', 'NightTicker']
    },
  },
  JP: {
    en: {
      title: 'Overnight Japanese Stock Prices | Weekend & Holiday',
      desc: 'Check overnight Japanese stock prices. Monitor SoftBank, Kioxia weekend and holiday prices. Powered by Hyperliquid.',
      keywords: ['overnight Japanese stock', 'SoftBank overnight', 'Nikkei weekend', 'NightTicker']
    },
    ko: {
      title: '일본주식 야간 주가 | 주말·휴일',
      desc: '일본주식 야간 주가를 확인하세요. 소프트뱅크, 키옥시아 등의 주말·휴일 주가를 제공합니다. 하이퍼리퀴드 기반.',
      keywords: ['일본주식 야간 주가', '소프트뱅크 야간 주가', '주말 주가', '나이트티커']
    },
    ja: {
      title: '日本株 夜間株価 | 週末・休日',
      desc: '日本株の夜間株価をチェック。ソフトバンク、キオクシアの週末・休日株価を提供。ハイパーリキッド基盤。',
      keywords: ['日本株 夜間株価', 'ソフトバンク 夜間株価', '週末 株価', 'ナイトティッカー']
    },
    zh: {
      title: '日股夜间股价 | 周末·节假日',
      desc: '查看日股夜间股价。提供软银、铠侠等的周末·节假日股价。基于Hyperliquid。',
      keywords: ['日股夜间股价', '软银夜间股价', '周末股价', 'NightTicker']
    },
  },
  INDEX: {
    en: {
      title: 'Overnight Indices | S&P 500, Nasdaq, Nikkei, KOSPI',
      desc: 'Check overnight index prices. S&P 500, Nasdaq 100, Nikkei 225, KOSPI 200 weekend and holiday prices. Powered by Hyperliquid.',
      keywords: ['overnight index', 'S&P 500 overnight', 'Nasdaq weekend', 'Nikkei overnight', 'KOSPI weekend', 'NightTicker']
    },
    ko: {
      title: '야간 지수 | S&P500, 나스닥, 니케이, 코스피',
      desc: '야간 지수 시세를 확인하세요. S&P500, 나스닥100, 니케이225, 코스피200 주말·휴일 시세를 제공합니다. 하이퍼리퀴드 기반.',
      keywords: ['야간 지수', 'S&P500 야간', '나스닥 야간', '코스피 야간', '주말 지수', '나이트티커']
    },
    ja: {
      title: '夜間指数 | S&P500, ナスダック, 日経, KOSPI',
      desc: '夜間指数相場をチェック。S&P500、ナスダック100、日経225、KOSPI200の週末・休日相場。ハイパーリキッド基盤。',
      keywords: ['夜間指数', 'S&P500 夜間', 'ナスダック 夜間', '日経 夜間', 'ナイトティッカー']
    },
    zh: {
      title: '夜间指数 | 标普500, 纳斯达克, 日经, KOSPI',
      desc: '查看夜间指数行情。提供标普500、纳斯达克100、日经225、KOSPI200周末·节假日行情。基于Hyperliquid。',
      keywords: ['夜间指数', '标普500夜间', '纳斯达克夜间', '日经夜间', 'NightTicker']
    },
  },
  ETF: {
    en: {
      title: 'Overnight ETFs | Korea, Japan, Brazil ETF Prices',
      desc: 'Check overnight ETF prices. EWY, EWJ, EWZ weekend and holiday prices. Powered by Hyperliquid.',
      keywords: ['overnight ETF', 'ETF weekend price', 'EWY overnight', 'NightTicker']
    },
    ko: {
      title: '야간 ETF | 한국, 일본, 브라질 ETF',
      desc: '야간 ETF 시세를 확인하세요. 한국, 일본, 브라질 ETF의 주말·휴일 시세를 제공합니다. 하이퍼리퀴드 기반.',
      keywords: ['야간 ETF', 'ETF 야간 시세', '주말 ETF', '나이트티커']
    },
    ja: {
      title: '夜間ETF | 韓国, 日本, ブラジル ETF',
      desc: '夜間ETF相場をチェック。韓国、日本、ブラジルETFの週末・休日相場。ハイパーリキッド基盤。',
      keywords: ['夜間ETF', 'ETF 夜間相場', '週末 ETF', 'ナイトティッカー']
    },
    zh: {
      title: '夜间ETF | 韩国、日本、巴西ETF',
      desc: '查看夜间ETF行情。提供韩国、日本、巴西ETF周末·节假日行情。基于Hyperliquid。',
      keywords: ['夜间ETF', 'ETF夜间行情', '周末ETF', 'NightTicker']
    },
  },
  COMMODITY: {
    en: {
      title: 'Overnight Commodities | Gold, Silver, WTI Oil, Brent, Natural Gas',
      desc: 'Check overnight commodity prices. Gold, silver, WTI oil, Brent oil, natural gas weekend and holiday prices. Powered by Hyperliquid.',
      keywords: ['overnight gold', 'overnight oil', 'gold weekend price', 'oil overnight', 'silver overnight', 'NightTicker']
    },
    ko: {
      title: '야간 원자재 | 금, 은, WTI, 브렌트유, 천연가스',
      desc: '야간 원자재 시세를 확인하세요. 금, 은, 원유, 천연가스 주말·휴일 시세를 제공합니다. 하이퍼리퀴드 기반.',
      keywords: ['야간 원자재', '금 야간', '원유 야간', '주말 금 시세', '나이트티커']
    },
    ja: {
      title: '夜間商品 | 金, 銀, WTI原油, ブレント, 天然ガス',
      desc: '夜間商品相場をチェック。金、銀、原油、天然ガスの週末・休日相場。ハイパーリキッド基盤。',
      keywords: ['夜間商品', '金 夜間', '原油 夜間', '週末 金', 'ナイトティッカー']
    },
    zh: {
      title: '夜间大宗商品 | 黄金、白银、WTI原油、布伦特、天然气',
      desc: '查看夜间大宗商品行情。提供黄金、白银、原油、天然气周末·节假日行情。基于Hyperliquid。',
      keywords: ['夜间黄金', '夜间原油', '周末黄金行情', '原油夜间', 'NightTicker']
    },
  },
  FX: {
    en: {
      title: 'Overnight Exchange Rates | USD/KRW, USD/JPY, EUR/USD',
      desc: 'Check overnight exchange rates. EUR, JPY, GBP, KRW weekend and holiday rates. Powered by Hyperliquid.',
      keywords: ['overnight forex', 'overnight exchange rate', 'USD/KRW weekend', 'USD/JPY overnight', 'NightTicker']
    },
    ko: {
      title: '야간 환율 | 달러/원, 달러/엔, 유로/달러',
      desc: '야간 환율을 확인하세요. 달러, 유로, 엔, 파운드 주말·휴일 환율을 제공합니다. 하이퍼리퀴드 기반.',
      keywords: ['야간 환율', '달러 야간 환율', '엔화 야간', '주말 환율', '나이트티커']
    },
    ja: {
      title: '夜間為替 | ドル/円, ユーロ/ドル',
      desc: '夜間為替レートをチェック。ドル、ユーロ、ポンドの週末・休日為替。ハイパーリキッド基盤。',
      keywords: ['夜間為替', 'ドル円 夜間', '週末 為替', 'ナイトティッカー']
    },
    zh: {
      title: '夜间汇率 | 美元/人民币、美元/日元、欧元/美元',
      desc: '查看夜间汇率。提供美元、欧元、日元、英镑周末·节假日汇率。基于Hyperliquid。',
      keywords: ['夜间汇率', '美元夜间汇率', '日元夜间', '周末汇率', 'NightTicker']
    },
  },
  SPECIAL: {
    en: {
      title: 'Overnight Special Assets | H100 GPU, DRAM',
      desc: 'Check overnight special asset prices. H100 GPU, DRAM weekend and holiday prices. Powered by Hyperliquid.',
      keywords: ['H100 overnight', 'DRAM overnight', 'GPU price weekend', 'NightTicker']
    },
    ko: {
      title: '야간 특수자산 | H100 GPU, DRAM',
      desc: '특수자산 야간 시세를 확인하세요. H100 GPU, DRAM 주말·휴일 시세를 제공합니다. 하이퍼리퀴드 기반.',
      keywords: ['H100 야간', 'DRAM 야간', 'GPU 야간 시세', '나이트티커']
    },
    ja: {
      title: '夜間特別資産 | H100 GPU, DRAM',
      desc: '特別資産の夜間相場をチェック。H100 GPU、DRAMの週末・休日相場。ハイパーリキッド基盤。',
      keywords: ['H100 夜間', 'DRAM 夜間', 'ナイトティッカー']
    },
    zh: {
      title: '夜间特殊资产 | H100 GPU、DRAM',
      desc: '查看特殊资产夜间行情。提供H100 GPU、DRAM周末·节假日行情。基于Hyperliquid。',
      keywords: ['H100夜间', 'DRAM夜间', 'GPU夜间行情', 'NightTicker']
    },
  },
  SEMICONDUCTOR: {
    en: {
      title: 'Overnight Semiconductor Stocks | Nvidia, AMD, Samsung, SK Hynix',
      desc: 'Check overnight semiconductor stock prices. Monitor Nvidia, AMD, Intel, Samsung, SK Hynix, Micron, TSMC weekend and holiday prices. Powered by Hyperliquid.',
      keywords: ['overnight semiconductor', 'Nvidia overnight', 'AMD weekend', 'Samsung overnight', 'SK Hynix overnight', 'semiconductor stock price', 'NightTicker']
    },
    ko: {
      title: '반도체 야간 주가 | 엔비디아, AMD, 삼성전자, SK하이닉스',
      desc: '반도체 야간 주가를 확인하세요. 엔비디아, AMD, 인텔, 삼성전자, SK하이닉스, 마이크론, TSMC 주말·휴일 주가. 하이퍼리퀴드 기반.',
      keywords: ['반도체 야간 주가', '엔비디아 야간', 'AMD 야간', '삼성전자 야간', 'SK하이닉스 야간', '마이크론 야간', '나이트티커']
    },
    ja: {
      title: '半導体 夜間株価 | エヌビディア, AMD, サムスン, SKハイニックス',
      desc: '半導体の夜間株価をチェック。エヌビディア、AMD、サムスン、SKハイニックス、マイクロンの週末・休日株価。ハイパーリキッド基盤。',
      keywords: ['半導体 夜間株価', 'エヌビディア 夜間', 'AMD 夜間', 'サムスン 夜間', 'ナイトティッカー']
    },
    zh: {
      title: '半导体夜间股价 | 英伟达、AMD、三星、SK海力士',
      desc: '查看半导体夜间股价。提供英伟达、AMD、英特尔、三星电子、SK海力士、美光、台积电周末·节假日股价。基于Hyperliquid。',
      keywords: ['半导体夜间股价', '英伟达夜间', 'AMD夜间', '三星电子夜间', 'SK海力士夜间', 'NightTicker']
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
  // SEMICONDUCTOR is a special case - it shows stocks by sector, not category
  const stocks = category === 'SEMICONDUCTOR'
    ? getStocksBySectorForCategory('Semiconductors')
    : getStocksByCategory(category);
  if (stocks.length === 0) {
    notFound();
  }

  return <CategoryPage category={category} />;
}
