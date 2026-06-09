import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Separator } from '@/components/ui/separator';
import { HyperliquidBadge } from '@/components/common/HyperliquidBadge';
import { ComplianceNotice } from '@/components/common/ComplianceNotice';
import { ReferralDisclosure } from '@/components/common/ReferralDisclosure';

type Props = {
  params: Promise<{ locale: string }>;
};

const BASE_URL = 'https://nightticker.com';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const isJa = locale === 'ja';

  const meta = {
    ko: {
      title: '데이터 작동 방식 - 나이트티커 야간 주가 출처 | 나이트티커',
      description: '나이트티커가 야간 주가를 제공하는 방식을 알아보세요. 하이퍼리퀴드 시장 가격 데이터 소스와 참고가격에 대해 설명합니다.',
      keywords: ['야간 주가 출처', '데이터 소스', '하이퍼리퀴드', '나이트티커'],
    },
    en: {
      title: 'How Data Works - NightTicker Price Source | NightTicker',
      description: 'Learn how NightTicker provides night stock prices. Understand our Hyperliquid market price data source and reference price information.',
      keywords: ['night price source', 'data source', 'Hyperliquid', 'NightTicker'],
    },
    ja: {
      title: 'データの仕組み - ナイトティッカーの価格ソース | ナイトティッカー',
      description: 'ナイトティッカーが夜間株価を提供する仕組みを説明。ハイパーリキッド市場価格データソースについて解説。',
      keywords: ['夜間株価 ソース', 'データソース', 'ハイパーリキッド', 'ナイトティッカー'],
    },
  };

  const current = isJa ? meta.ja : isKo ? meta.ko : meta.en;
  const canonicalUrl = locale === 'en' ? `${BASE_URL}/how-data-works` : `${BASE_URL}/${locale}/how-data-works`;

  return {
    title: current.title,
    description: current.description,
    keywords: current.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${BASE_URL}/how-data-works`,
        ko: `${BASE_URL}/ko/how-data-works`,
        ja: `${BASE_URL}/ja/how-data-works`,
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

export default async function HowDataWorksPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.howDataWorks');

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold">{t('title')}</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          {t('description')}
        </p>
        <HyperliquidBadge />
      </div>

      <Separator />

      <div className="prose dark:prose-invert max-w-3xl space-y-8">
        <section>
          <h2>
            {locale === 'ko' ? '데이터 소스' : 'Data Source'}
          </h2>
          <p>
            {locale === 'ko'
              ? 'NightTicker는 Hyperliquid Market Prices를 표시합니다. Hyperliquid는 NightTicker에 표시되는 시장 가격의 소스입니다.'
              : 'NightTicker displays Hyperliquid Market Prices. Hyperliquid is the source of market prices displayed on NightTicker.'}
          </p>
        </section>

        <section>
          <h2>
            {locale === 'ko' ? '참고 가격' : 'Reference Prices'}
          </h2>
          <p>
            {locale === 'ko'
              ? 'Hyperliquid Market Prices는 참고 가격입니다. 이는 공식 거래소 가격이 아니며 전통적인 거래소 가격과 크게 다를 수 있습니다.'
              : 'Hyperliquid Market Prices are reference prices. They are not official exchange prices and may differ significantly from traditional exchange prices.'}
          </p>
        </section>

        <section>
          <h2>
            {locale === 'ko' ? '데이터 정확성' : 'Data Accuracy'}
          </h2>
          <p>
            {locale === 'ko'
              ? 'NightTicker는 시장 데이터의 정확성을 검증하지 않습니다. 표시된 정보에는 지연, 부정확성, 누락 또는 오류가 포함될 수 있습니다.'
              : 'NightTicker does not verify market data accuracy. Displayed information may contain delays, inaccuracies, omissions, or errors.'}
          </p>
        </section>

        <section>
          <h2>
            {locale === 'ko' ? '상세 정보' : 'Detailed Information'}
          </h2>
          <p>
            {locale === 'ko'
              ? '상세한 차트, 과거 데이터 및 고급 시장 정보는 Hyperliquid를 직접 방문해 주세요.'
              : 'For detailed charts, historical data, and advanced market information, please visit Hyperliquid directly.'}
          </p>
        </section>

        <section>
          <h2>
            {locale === 'ko' ? '레퍼럴 링크' : 'Referral Links'}
          </h2>
          <p>
            {locale === 'ko'
              ? 'Hyperliquid로 연결되는 링크에는 레퍼럴 속성이 포함될 수 있습니다.'
              : 'Links to Hyperliquid may contain referral attribution.'}
          </p>
          <ReferralDisclosure />
        </section>
      </div>

      <Separator />

      <ComplianceNotice />
    </div>
  );
}
