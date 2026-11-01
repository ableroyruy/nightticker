import { getProductInfo } from '@/lib/markets/product-info';
import { pageMetadata, localizedUrl, seoLocale } from '@/lib/seo/site';
import { referenceGuide } from '@/lib/seo/reference-guide';
import { ProductInfo } from '@/components/stock/ProductInfo';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Separator } from '@/components/ui/separator';
import { MarketPriceCard } from '@/components/market/MarketPriceCard';
import { ComplianceNotice } from '@/components/common/ComplianceNotice';
import { StudyAILabBanner } from '@/components/common/StudyAILabBanner';
import { InternalLinks } from '@/components/stock/InternalLinks';
import { StockPageHeader } from '@/components/stock/StockPageHeader';
import { SearchRankBadge } from '@/components/market/SearchRankBadge';
import { getStockBySlug, stocks, categoryNames } from '@/lib/markets/stocks';
import { Stock } from '@/lib/providers/types';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const slugs = stocks.map(stock => stock.slug);
  const locales = ['en', 'ko', 'ja', 'zh', 'pt', 'es'];

  return locales.flatMap((locale) =>
    slugs.map((slug) => ({
      locale,
      slug,
    }))
  );
}

function getAssetType(stock: Stock, locale: string): { term: string; typeName: string } {
  const isStock = ['US', 'KR', 'JP'].includes(stock.category);

  if (locale === 'ko') {
    if (isStock) return { term: '주가', typeName: '주식' };
    if (stock.category === 'INDEX') return { term: '지수', typeName: '지수' };
    if (stock.category === 'ETF') return { term: 'ETF', typeName: 'ETF' };
    if (stock.category === 'COMMODITY') return { term: '원자재', typeName: '원자재' };
    if (stock.category === 'FX') return { term: '환율', typeName: '환율' };
    return { term: '시세', typeName: '자산' };
  }

  if (locale === 'ja') {
    if (isStock) return { term: '株価', typeName: '株' };
    if (stock.category === 'INDEX') return { term: '指数', typeName: '指数' };
    if (stock.category === 'ETF') return { term: 'ETF', typeName: 'ETF' };
    if (stock.category === 'COMMODITY') return { term: '商品', typeName: '商品' };
    if (stock.category === 'FX') return { term: '為替', typeName: '為替' };
    return { term: '相場', typeName: '資産' };
  }

  if (locale === 'zh') {
    if (isStock) return { term: '股价', typeName: '股票' };
    if (stock.category === 'INDEX') return { term: '指数', typeName: '指数' };
    if (stock.category === 'ETF') return { term: 'ETF', typeName: 'ETF' };
    if (stock.category === 'COMMODITY') return { term: '商品', typeName: '商品' };
    if (stock.category === 'FX') return { term: '汇率', typeName: '外汇' };
    return { term: '行情', typeName: '资产' };
  }

  if (locale === 'pt') {
    if (isStock) return { term: 'Preco', typeName: 'Acao' };
    if (stock.category === 'INDEX') return { term: 'Indice', typeName: 'Indice' };
    if (stock.category === 'ETF') return { term: 'ETF', typeName: 'ETF' };
    if (stock.category === 'COMMODITY') return { term: 'Commodity', typeName: 'Commodity' };
    if (stock.category === 'FX') return { term: 'Taxa', typeName: 'Moeda' };
    return { term: 'Preco', typeName: 'Ativo' };
  }

  if (locale === 'es') {
    if (isStock) return { term: 'Precio', typeName: 'Accion' };
    if (stock.category === 'INDEX') return { term: 'Indice', typeName: 'Indice' };
    if (stock.category === 'ETF') return { term: 'ETF', typeName: 'ETF' };
    if (stock.category === 'COMMODITY') return { term: 'Commodity', typeName: 'Commodity' };
    if (stock.category === 'FX') return { term: 'Tasa', typeName: 'Divisa' };
    return { term: 'Precio', typeName: 'Activo' };
  }

  // English - use "Overnight" terminology
  if (isStock) return { term: 'Stock Price', typeName: 'Stock' };
  if (stock.category === 'INDEX') return { term: 'Index', typeName: 'Index' };
  if (stock.category === 'ETF') return { term: 'ETF', typeName: 'ETF' };
  if (stock.category === 'COMMODITY') return { term: 'Commodity', typeName: 'Commodity' };
  if (stock.category === 'FX') return { term: 'Exchange Rate', typeName: 'Currency' };
  return { term: 'Price', typeName: 'Asset' };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const stock = getStockBySlug(slug);

  if (!stock) {
    notFound();
  }

  const name =
    locale === 'ko' ? stock.nameKo :
    locale === 'ja' ? (stock.nameJa ?? stock.name) :
    locale === 'zh' ? (stock.nameZh ?? stock.name) :
    locale === 'pt' ? (stock.namePt ?? stock.name) :
    locale === 'es' ? (stock.nameEs ?? stock.name) :
    stock.name;
  const { term } = getAssetType(stock, locale);
  const isStock = ['US', 'KR', 'JP'].includes(stock.category);

  // New SEO Strategy: Stock name first, "야간 주가" terminology
  const meta = {
    ko: {
      // {종목명} 야간 주가 | 주말·휴일 시세 | 나이트티커
      title: `${name} 야간 ${term} | 주말·휴일 시세 | 나이트티커`,
      description: `${name} 야간 ${term}와 주말·휴일 시세를 확인하세요. ${name}의 장마감 후 참고가격을 실시간으로 모니터링. 하이퍼리퀴드 기반.`,
      keywords: [
        `${name} 야간 ${term}`,
        `${name} 주말 ${term}`,
        `${name} 휴일 ${term}`,
        `${name} 야간 시세`,
        isStock ? '야간 주가' : `야간 ${term}`,
        isStock ? '주말 주가' : `주말 ${term}`,
        isStock ? '휴일 주가' : `휴일 ${term}`,
        '나이트티커',
      ],
    },
    en: {
      // Use "Overnight" terminology for English
      title: `${name} (${stock.symbol}) Overnight ${term} | Weekend & Holiday | NightTicker`,
      description: `Check ${name} overnight ${term.toLowerCase()}. Monitor ${name} weekend and holiday prices. Powered by Hyperliquid.`,
      keywords: [
        `${name} overnight price`,
        `${stock.symbol} overnight`,
        `${name} weekend price`,
        `${name} holiday price`,
        isStock ? 'overnight stock price' : `overnight ${term.toLowerCase()}`,
        'weekend stock price',
        'NightTicker',
      ],
    },
    ja: {
      title: `${name} 夜間${term} | 週末・休日相場 | ナイトティッカー`,
      description: `${name}の夜間${term}と週末・休日相場を確認。市場終了後の参考価格をリアルタイムで監視。ハイパーリキッド基盤。`,
      keywords: [
        `${name} 夜間${term}`,
        `${name} 週末${term}`,
        `${name} 休日${term}`,
        isStock ? '夜間株価' : `夜間${term}`,
        'ナイトティッカー',
      ],
    },
    zh: {
      title: `${name} 夜间${term} | 周末·节假日行情 | NightTicker`,
      description: `查看${name}夜间${term}和周末·节假日行情。收盘后实时监控${name}参考价格。基于Hyperliquid。`,
      keywords: [
        `${name} 夜间${term}`,
        `${name} 周末${term}`,
        `${name} 节假日${term}`,
        isStock ? '夜间股价' : `夜间${term}`,
        'NightTicker',
      ],
    },
    pt: {
      title: `${name} (${stock.symbol}) ${term} Noturno | Fim de Semana e Feriado | NightTicker`,
      description: `Confira ${name} ${term.toLowerCase()} noturno. Monitore precos de fim de semana e feriado. Powered by Hyperliquid.`,
      keywords: [
        `${name} preco noturno`,
        `${stock.symbol} overnight`,
        `${name} preco fim de semana`,
        isStock ? 'preco acoes noturno' : `${term.toLowerCase()} noturno`,
        'NightTicker',
      ],
    },
    es: {
      title: `${name} (${stock.symbol}) ${term} Nocturno | Fin de Semana y Festivo | NightTicker`,
      description: `Consulta ${name} ${term.toLowerCase()} nocturno. Monitorea precios de fin de semana y festivos. Powered by Hyperliquid.`,
      keywords: [
        `${name} precio nocturno`,
        `${stock.symbol} overnight`,
        `${name} precio fin de semana`,
        isStock ? 'precio acciones nocturno' : `${term.toLowerCase()} nocturno`,
        'NightTicker',
      ],
    },
  };

  type MetaKey = 'en' | 'ko' | 'ja' | 'zh' | 'pt' | 'es';
  const current = meta[locale as MetaKey] ?? meta.en;
  const product = getProductInfo(stock, locale);
  const suffix = { en: 'Overnight, weekend and holiday reference prices from Hyperliquid.', ko: 'Hyperliquid 기반 야간·주말·휴일 참고 시세입니다.', ja: 'Hyperliquidの夜間・週末・休日の参考相場です。', zh: 'Hyperliquid夜间、周末与节假日参考行情。', pt: 'Referência Hyperliquid à noite, em fins de semana e feriados.', es: 'Referencia Hyperliquid de noche, en fines de semana y festivos.' }[seoLocale(locale)];
  const description = `${product.overview} ${suffix}`;
  return pageMetadata(locale, `/stock/${stock.slug}`, current.title, description, current.keywords);
}

export default async function StockPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const stock = getStockBySlug(slug);
  if (!stock) {
    notFound();
  }

  const displayName =
    locale === 'ko' ? stock.nameKo :
    locale === 'ja' ? (stock.nameJa ?? stock.name) :
    locale === 'zh' ? (stock.nameZh ?? stock.name) :
    locale === 'pt' ? (stock.namePt ?? stock.name) :
    locale === 'es' ? (stock.nameEs ?? stock.name) :
    stock.name;
  const { term } = getAssetType(stock, locale);
  const guide = referenceGuide(locale, displayName);
  const faqData = guide.faq;

  const labels = {
    relatedStocks: { en: 'Related markets', ko: '관련 종목', ja: '関連銘柄', zh: '相关资产', pt: 'Mercados relacionados', es: 'Mercados relacionados' }[seoLocale(locale)],
    faq: { en: 'Reading this market', ko: '시세 읽기 안내', ja: '相場の見方', zh: '行情阅读指南', pt: 'Como ler este mercado', es: 'Cómo interpretar este mercado' }[seoLocale(locale)],
  };

  // JSON-LD for FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  // JSON-LD for BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: locale === 'ko' ? '홈' : locale === 'ja' ? 'ホーム' : locale === 'zh' ? '首页' : locale === 'pt' ? 'Inicio' : locale === 'es' ? 'Inicio' : 'Home',
        item: localizedUrl(locale),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryNames[stock.category][seoLocale(locale)],
        item: localizedUrl(locale, `/category/${stock.category.toLowerCase()}`),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: displayName,
        item: localizedUrl(locale, `/stock/${stock.slug}`),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }} />
      <div className="container py-6 space-y-6">
        <section className="space-y-4">
          <StockPageHeader stock={stock} displayName={displayName} term={term} locale={locale} />
          <MarketPriceCard hyperliquidSymbol={stock.hyperliquidSymbol} locale={locale} category={stock.category} quoteUnit={getProductInfo(stock, locale).quoteUnit} ranking={<SearchRankBadge symbol={stock.symbol} category={stock.category} />} />
        </section>

        <ProductInfo stock={stock} locale={locale} />
        {locale === 'ko' && <StudyAILabBanner variant="investingGuide" />}

        <div className="max-w-3xl space-y-6">
          {guide.sections.map(section => (
            <section key={section.title} className="space-y-2">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="leading-relaxed text-muted-foreground">{section.text}</p>
            </section>
          ))}
        </div>

        <Separator />
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{labels.relatedStocks}</h2>
          <InternalLinks stock={stock} locale={locale} />
        </section>

        <section className="space-y-4 max-w-3xl">
          <h2 className="text-xl font-semibold">{labels.faq}</h2>
          {faqData.map(item => (
            <div key={item.q} className="space-y-2">
              <h3 className="font-semibold">{item.q}</h3>
              <p className="leading-relaxed text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </section>
        <Separator />
        <ComplianceNotice />
      </div>
    </>
  );
}
