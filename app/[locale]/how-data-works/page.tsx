import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Separator } from '@/components/ui/separator';
import { HyperliquidBadge } from '@/components/common/HyperliquidBadge';
import { ComplianceNotice } from '@/components/common/ComplianceNotice';

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
  const tInfo = await getTranslations('infoPages.howDataWorks');

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
          <h2>{tInfo('dataSource')}</h2>
          <p>{tInfo('dataSourceContent')}</p>
        </section>

        <section>
          <h2>{tInfo('referencePrices')}</h2>
          <p>{tInfo('referencePricesContent')}</p>
        </section>

        <section>
          <h2>{tInfo('accuracy')}</h2>
          <p>{tInfo('accuracyContent')}</p>
        </section>

        <section>
          <h2>{tInfo('details')}</h2>
          <p>{tInfo('detailsContent')}</p>
        </section>
      </div>

      <Separator />

      <ComplianceNotice />
    </div>
  );
}
