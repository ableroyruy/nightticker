import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Separator } from '@/components/ui/separator';
import { MarketPriceCard } from '@/components/market/MarketPriceCard';
import { ComplianceNotice } from '@/components/common/ComplianceNotice';
import { InternalLinks } from '@/components/stock/InternalLinks';
import { StockPageHeader } from '@/components/stock/StockPageHeader';
import { getStockBySlug, getAllSlugs, categoryNames } from '@/lib/markets/stocks';
import { Stock } from '@/lib/providers/types';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  const locales = ['en', 'ko', 'ja', 'zh', 'pt', 'es'];

  return locales.flatMap((locale) =>
    slugs.map((slug) => ({
      locale,
      slug,
    }))
  );
}

const BASE_URL = 'https://www.nightticker.com';

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
    return { title: 'Not Found' };
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
  const canonicalUrl = locale === 'en' ? `${BASE_URL}/stock/${slug}` : `${BASE_URL}/${locale}/stock/${slug}`;

  const siteNames: Record<string, string> = {
    ko: '나이트티커',
    ja: 'ナイトティッカー',
    zh: 'NightTicker',
    pt: 'NightTicker',
    es: 'NightTicker',
    en: 'NightTicker',
  };

  const ogLocales: Record<string, string> = {
    ko: 'ko_KR',
    ja: 'ja_JP',
    zh: 'zh_CN',
    pt: 'pt_BR',
    es: 'es_ES',
    en: 'en_US',
  };

  return {
    title: current.title,
    description: current.description,
    keywords: current.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${BASE_URL}/stock/${slug}`,
        ko: `${BASE_URL}/ko/stock/${slug}`,
        ja: `${BASE_URL}/ja/stock/${slug}`,
        zh: `${BASE_URL}/zh/stock/${slug}`,
        pt: `${BASE_URL}/pt/stock/${slug}`,
        es: `${BASE_URL}/es/stock/${slug}`,
      },
    },
    openGraph: {
      title: current.title,
      description: current.description,
      url: canonicalUrl,
      siteName: siteNames[locale] ?? 'NightTicker',
      locale: ogLocales[locale] ?? 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: current.title,
      description: current.description,
    },
  };
}

// FAQ data for structured data
function getFAQData(stock: Stock, locale: string) {
  const name =
    locale === 'ko' ? stock.nameKo :
    locale === 'ja' ? (stock.nameJa ?? stock.name) :
    locale === 'zh' ? (stock.nameZh ?? stock.name) :
    locale === 'pt' ? (stock.namePt ?? stock.name) :
    locale === 'es' ? (stock.nameEs ?? stock.name) :
    stock.name;
  const { term } = getAssetType(stock, locale);

  if (locale === 'ko') {
    return [
      { q: '야간 주가란 무엇인가요?', a: '야간 주가는 전통적인 거래소가 닫힌 시간 동안의 참고 가격입니다. NightTicker는 Hyperliquid Market Prices를 기반으로 야간 참고가격을 제공합니다.' },
      { q: '주말에도 가격을 확인할 수 있나요?', a: '네, NightTicker에서 주말에도 Hyperliquid Market Prices 기반의 참고 가격을 확인할 수 있습니다.' },
      { q: '휴일에도 가격이 있나요?', a: '네, 공휴일이나 휴장일에도 Hyperliquid Market Prices를 통해 참고 가격을 확인할 수 있습니다.' },
      { q: 'Hyperliquid 가격이란 무엇인가요?', a: 'Hyperliquid는 NightTicker에서 표시하는 시장 가격의 소스입니다. 이 가격은 참고용이며 공식 거래소 가격과 다를 수 있습니다.' },
      { q: '공식 거래소 가격인가요?', a: '아니요, NightTicker에서 표시하는 가격은 Hyperliquid Market Prices로, 공식 거래소 가격이 아닙니다. 투자 결정에 사용하지 마세요.' },
      { q: `${name}의 야간 ${term}를 어떻게 확인하나요?`, a: `이 페이지에서 ${name}의 야간 ${term}를 실시간으로 확인할 수 있습니다. 가격은 Hyperliquid Market Prices 기반입니다.` },
    ];
  }

  if (locale === 'ja') {
    return [
      { q: '夜間株価とは何ですか？', a: '夜間株価は、従来の取引所が閉まっている時間帯の参考価格です。NightTickerはHyperliquid Market Pricesに基づいた夜間参考価格を提供します。' },
      { q: '週末も価格を確認できますか？', a: 'はい、NightTickerでは週末もHyperliquid Market Pricesに基づく参考価格を確認できます。' },
      { q: '休日も価格がありますか？', a: 'はい、祝日や市場休場日もHyperliquid Market Pricesを通じて参考価格を確認できます。' },
      { q: 'Hyperliquid価格とは何ですか？', a: 'HyperliquidはNightTickerで表示される市場価格のソースです。この価格は参考用であり、公式取引所価格と異なる場合があります。' },
      { q: '公式取引所価格ですか？', a: 'いいえ、NightTickerで表示される価格はHyperliquid Market Pricesであり、公式取引所価格ではありません。投資判断に使用しないでください。' },
    ];
  }

  if (locale === 'zh') {
    return [
      { q: '什么是夜间股价？', a: '夜间股价是传统交易所休市时的参考价格。NightTicker提供基于Hyperliquid Market Prices的夜间参考价格。' },
      { q: '周末可以查看价格吗？', a: '可以，您可以在NightTicker上查看周末的参考价格，数据来源于Hyperliquid Market Prices。' },
      { q: '节假日也有价格吗？', a: '是的，您可以通过Hyperliquid Market Prices查看节假日和休市期间的参考价格。' },
      { q: '什么是Hyperliquid价格？', a: 'Hyperliquid是NightTicker上显示的市场价格的来源。这些价格仅供参考，可能与官方交易所价格不同。' },
      { q: '这是官方交易所价格吗？', a: '不是，NightTicker上显示的价格是Hyperliquid Market Prices，而非官方交易所价格。请勿用于投资决策。' },
    ];
  }

  if (locale === 'pt') {
    return [
      { q: 'O que sao precos noturnos de acoes?', a: 'Precos noturnos sao precos de referencia quando as bolsas tradicionais estao fechadas. NightTicker fornece precos de referencia noturnos baseados em Hyperliquid Market Prices.' },
      { q: 'Posso verificar precos nos fins de semana?', a: 'Sim, voce pode verificar precos de referencia nos fins de semana via NightTicker, alimentado por Hyperliquid Market Prices.' },
      { q: 'Ha precos em feriados?', a: 'Sim, voce pode verificar precos de referencia em feriados atraves de Hyperliquid Market Prices.' },
      { q: 'O que sao precos Hyperliquid?', a: 'Hyperliquid e a fonte dos precos de mercado exibidos no NightTicker. Esses precos sao apenas para referencia e podem diferir dos precos oficiais da bolsa.' },
      { q: 'Sao precos oficiais da bolsa?', a: 'Nao, os precos exibidos no NightTicker sao Hyperliquid Market Prices, nao precos oficiais da bolsa. Nao use para decisoes de investimento.' },
    ];
  }

  if (locale === 'es') {
    return [
      { q: 'Que son los precios nocturnos de acciones?', a: 'Los precios nocturnos son precios de referencia cuando las bolsas tradicionales estan cerradas. NightTicker proporciona precios de referencia nocturnos basados en Hyperliquid Market Prices.' },
      { q: 'Puedo verificar precios los fines de semana?', a: 'Si, puedes verificar precios de referencia los fines de semana via NightTicker, impulsado por Hyperliquid Market Prices.' },
      { q: 'Hay precios en dias festivos?', a: 'Si, puedes verificar precios de referencia en dias festivos a traves de Hyperliquid Market Prices.' },
      { q: 'Que son los precios de Hyperliquid?', a: 'Hyperliquid es la fuente de los precios de mercado mostrados en NightTicker. Estos precios son solo de referencia y pueden diferir de los precios oficiales de la bolsa.' },
      { q: 'Son precios oficiales de la bolsa?', a: 'No, los precios mostrados en NightTicker son Hyperliquid Market Prices, no precios oficiales de la bolsa. No uses para decisiones de inversion.' },
    ];
  }

  return [
    { q: 'What are overnight stock prices?', a: 'Overnight stock prices are reference prices during hours when traditional exchanges are closed. NightTicker provides overnight reference prices based on Hyperliquid Market Prices.' },
    { q: 'Can I check prices on weekends?', a: 'Yes, you can check reference prices on weekends via NightTicker, powered by Hyperliquid Market Prices.' },
    { q: 'Are there prices on holidays?', a: 'Yes, you can check reference prices on holidays and market closures through Hyperliquid Market Prices.' },
    { q: 'What are Hyperliquid prices?', a: 'Hyperliquid is the source of market prices displayed on NightTicker. These prices are for reference only and may differ from official exchange prices.' },
    { q: 'Are these official exchange prices?', a: 'No, prices displayed on NightTicker are Hyperliquid Market Prices, not official exchange prices. Do not use for investment decisions.' },
  ];
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
  const { term, typeName } = getAssetType(stock, locale);
  const isStock = ['US', 'KR', 'JP'].includes(stock.category);
  const faqData = getFAQData(stock, locale);

  // Labels by locale
  const labels = {
    overnightPrice: locale === 'ko' ? '야간' : locale === 'ja' ? '夜間' : locale === 'zh' ? '夜间' : locale === 'pt' ? 'Noturno' : locale === 'es' ? 'Nocturno' : 'Overnight',
    weekendPrice: locale === 'ko' ? '주말' : locale === 'ja' ? '週末' : locale === 'zh' ? '周末' : locale === 'pt' ? 'Fim de Semana' : locale === 'es' ? 'Fin de Semana' : 'Weekend',
    holidayPrice: locale === 'ko' ? '휴일' : locale === 'ja' ? '休日' : locale === 'zh' ? '节假日' : locale === 'pt' ? 'Feriado' : locale === 'es' ? 'Festivo' : 'Holiday',
    relatedStocks: locale === 'ko' ? '관련 종목' : locale === 'ja' ? '関連銘柄' : locale === 'zh' ? '相关标的' : locale === 'pt' ? 'Relacionados' : locale === 'es' ? 'Relacionados' : 'Related',
    faq: locale === 'ko' ? 'FAQ' : locale === 'ja' ? 'よくある質問' : locale === 'zh' ? '常见问题' : locale === 'pt' ? 'FAQ' : locale === 'es' ? 'FAQ' : 'FAQ',
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
        item: locale === 'en' ? BASE_URL : `${BASE_URL}/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryNames[stock.category][locale === 'ko' ? 'ko' : locale === 'ja' ? 'ja' : 'en'],
        item: locale === 'en' ? `${BASE_URL}/category/${stock.category.toLowerCase()}` : `${BASE_URL}/${locale}/category/${stock.category.toLowerCase()}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: displayName,
        item: locale === 'en' ? `${BASE_URL}/stock/${slug}` : `${BASE_URL}/${locale}/stock/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="container py-8 space-y-8">
        {/* H1: Stock Name + Overnight Price */}
        <StockPageHeader
          stock={stock}
          displayName={displayName}
          term={term}
          locale={locale}
        />

        <Separator />

        {/* Real-time Price Card */}
        <MarketPriceCard hyperliquidSymbol={stock.hyperliquidSymbol} locale={locale} category={stock.category} />

        {/* H2: Weekend Price Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            {displayName} {labels.weekendPrice} {term}
          </h2>
          <p className="text-muted-foreground">
            {locale === 'ko'
              ? `토요일, 일요일에도 ${displayName}의 참고 가격을 확인할 수 있습니다. Hyperliquid Market Prices 기반.`
              : locale === 'ja'
                ? `土曜日、日曜日も${displayName}の参考価格を確認できます。Hyperliquid Market Prices基盤。`
                : `Check ${displayName} reference prices on Saturday and Sunday. Powered by Hyperliquid Market Prices.`}
          </p>
        </section>

        {/* H2: Holiday Price Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            {displayName} {labels.holidayPrice} {term}
          </h2>
          <p className="text-muted-foreground">
            {locale === 'ko'
              ? `공휴일, 휴장일에도 ${displayName}의 참고 가격을 제공합니다. 투자 결정에 사용하지 마세요.`
              : locale === 'ja'
                ? `祝日、市場休場日も${displayName}の参考価格を提供します。投資判断に使用しないでください。`
                : `${displayName} reference prices available on holidays and market closures. Not for investment decisions.`}
          </p>
        </section>

        {/* H2: Night Price Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            {displayName} {locale === 'ko' ? '야간 시세' : locale === 'ja' ? '夜間相場' : 'After Hours'}
          </h2>
          <p className="text-muted-foreground">
            {locale === 'ko'
              ? `장마감 후 ${displayName}의 시세 동향을 확인하세요. NightTicker는 Hyperliquid Market Prices를 참고용으로 제공합니다.`
              : locale === 'ja'
                ? `市場終了後の${displayName}の相場動向を確認。NightTickerはHyperliquid Market Pricesを参考用に提供します。`
                : `Monitor ${displayName} price trends after market close. NightTicker provides Hyperliquid Market Prices for reference.`}
          </p>
        </section>

        <Separator />

        {/* Compliance Notice (compact) */}
        <ComplianceNotice variant="compact" />

        <Separator />

        {/* H2: Related Stocks (Internal Links) */}
        <section>
          <h2 className="text-2xl font-bold mb-6">{labels.relatedStocks}</h2>
          <InternalLinks stock={stock} locale={locale} />
        </section>

        <Separator />

        {/* H2: FAQ Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">{labels.faq}</h2>
          <div className="space-y-6 max-w-3xl">
            {faqData.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="font-semibold">{item.q}</h3>
                <p className="text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Full Compliance Notice */}
        <ComplianceNotice />
      </div>
    </>
  );
}
