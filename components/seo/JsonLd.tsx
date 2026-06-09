type WebsiteJsonLd = {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  alternateName?: string;
  url: string;
  description: string;
  inLanguage: string[];
  potentialAction?: {
    '@type': 'SearchAction';
    target: {
      '@type': 'EntryPoint';
      urlTemplate: string;
    };
    'query-input': string;
  };
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

export function JsonLd({ type, locale, baseUrl = 'https://nightticker.com', stockName, stockSymbol }: JsonLdProps) {
  let data: WebsiteJsonLd | OrganizationJsonLd | FinancialProductJsonLd;

  if (type === 'website') {
    data = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'NightTicker',
      alternateName: locale === 'ko' ? '나이트티커' : undefined,
      url: baseUrl,
      description:
        locale === 'ko'
          ? 'Hyperliquid Market Prices 기준 야간, 주말, 휴일 주식 참고가격 조회'
          : 'Check overnight, weekend, and holiday stock reference prices using Hyperliquid Market Prices',
      inLanguage: ['en', 'ko'],
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${baseUrl}/stock/{search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    };
  } else if (type === 'organization') {
    data = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'NightTicker',
      url: baseUrl,
      description:
        locale === 'ko'
          ? 'Hyperliquid Market Prices 기준 주식 참고가격 정보 제공 서비스'
          : 'Stock reference price information service using Hyperliquid Market Prices',
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
