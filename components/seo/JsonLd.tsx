import { SITE_URL, seoLocale } from '@/lib/seo/site';

type WebsiteJsonLd = {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  alternateName?: string;
  url: string;
  description: string;
  inLanguage: string[];

};

type OrganizationJsonLd = {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo?: string;
  description: string;
};

type FinancialProductJsonLd = {
  '@context': 'https://schema.org';
  '@type': 'FinancialProduct';
  name: string;
  description: string;
  provider: {
    '@type': 'Organization';
    name: string;
  };
};

interface JsonLdProps {
  type: 'website' | 'organization' | 'financialProduct';
  locale: string;
  baseUrl?: string;
  stockName?: string;
  stockSymbol?: string;
}

export function JsonLd({ type, locale, baseUrl = SITE_URL, stockName, stockSymbol }: JsonLdProps) {
  let data: WebsiteJsonLd | OrganizationJsonLd | FinancialProductJsonLd;

  if (type === 'website') {
    data = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'NightTicker',
      alternateName: locale === 'ko' ? '나이트티커' : undefined,
      url: baseUrl,
      description: {
        en: 'Overnight, weekend and holiday reference prices from Hyperliquid markets.',
        ko: 'Hyperliquid 시장 기반 야간·주말·휴일 참고 시세 서비스.',
        ja: 'Hyperliquid市場に基づく夜間・週末・休日の参考相場サービス。',
        zh: '基于Hyperliquid市场的夜间、周末与节假日参考行情服务。',
        pt: 'Preços de referência dos mercados Hyperliquid à noite, nos fins de semana e feriados.',
        es: 'Precios de referencia de los mercados Hyperliquid de noche, en fines de semana y festivos.',
      }[seoLocale(locale)],
      inLanguage: ['en', 'ko', 'ja', 'zh', 'pt', 'es'],

    };
  } else if (type === 'organization') {
    data = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'NightTicker',
      url: baseUrl,
      description: {
        en: 'Market reference price information service using Hyperliquid data.',
        ko: 'Hyperliquid 데이터를 사용하는 시장 참고가격 정보 서비스.',
        ja: 'Hyperliquidデータを利用する市場参考価格情報サービス。',
        zh: '使用Hyperliquid数据的市场参考价格信息服务。',
        pt: 'Serviço de informações sobre preços de referência com dados Hyperliquid.',
        es: 'Servicio de información de precios de referencia con datos Hyperliquid.',
      }[seoLocale(locale)],
    };
  } else {
    data = {
      '@context': 'https://schema.org',
      '@type': 'FinancialProduct',
      name: stockName
        ? locale === 'ko'
          ? `${stockName} 야간 시세`
          : `${stockName} Night Price`
        : 'Stock Price Information',
      description:
        locale === 'ko'
          ? `${stockSymbol || ''} Hyperliquid Market Prices 기준 참고가격. 공식 거래소 가격이 아닙니다.`
          : `${stockSymbol || ''} reference price using Hyperliquid Market Prices. Not an official exchange price.`,
      provider: {
        '@type': 'Organization',
        name: 'NightTicker',
      },
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
