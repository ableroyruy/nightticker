import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Separator } from '@/components/ui/separator';
import { HyperliquidBadge } from '@/components/common/HyperliquidBadge';
import { ComplianceNotice } from '@/components/common/ComplianceNotice';

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
      title: '나이트티커 소개 - 야간 주가 서비스 | 나이트티커',
      description: '나이트티커는 야간, 주말, 휴일에 주식 참고가격을 제공하는 서비스입니다. 나이트티커의 미션과 서비스에 대해 알아보세요. 하이퍼리퀴드 기반.',
      keywords: ['나이트티커', '야간 주가 서비스', '야간 주식 시세', '하이퍼리퀴드'],
    },
    en: {
      title: 'About NightTicker - Night Stock Price Service | NightTicker',
      description: 'NightTicker provides night, weekend, and holiday stock reference prices. Learn about our mission and service. Powered by Hyperliquid.',
      keywords: ['NightTicker', 'night stock price', 'about NightTicker', 'Hyperliquid'],
    },
    ja: {
      title: 'ナイトティッカーについて - 夜間株価サービス | ナイトティッカー',
      description: 'ナイトティッカーは夜間、週末、休日に株式参考価格を提供するサービスです。ハイパーリキッド基盤。',
      keywords: ['ナイトティッカー', '夜間株価サービス', 'ハイパーリキッド'],
    },
  };

  const current = isJa ? meta.ja : isKo ? meta.ko : meta.en;
  const canonicalUrl = locale === 'en' ? `${BASE_URL}/about` : `${BASE_URL}/${locale}/about`;

  return {
    title: current.title,
    description: current.description,
    keywords: current.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${BASE_URL}/about`,
        ko: `${BASE_URL}/ko/about`,
        ja: `${BASE_URL}/ja/about`,
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

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.about');
  const tInfo = await getTranslations('infoPages.about');

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold">{t('title')}</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          {t('description')}
        </p>
      </div>

      <Separator />

      <div className="prose dark:prose-invert max-w-3xl space-y-8">
        <section>
          <h2>{tInfo('whatIs')}</h2>
          <p>{tInfo('whatIsContent')}</p>
        </section>

        <section>
          <h2>{tInfo('mission')}</h2>
          <p>{tInfo('missionContent')}</p>
        </section>

        <section>
          <h2>{tInfo('whatWeAreNot')}</h2>
          <ul>
            <li>{tInfo('notBroker')}</li>
            <li>{tInfo('notExchange')}</li>
            <li>{tInfo('notSecuritiesFirm')}</li>
            <li>{tInfo('notTradingPlatform')}</li>
            <li>{tInfo('notFinancialAdvisor')}</li>
            <li>{tInfo('notInvestmentService')}</li>
            <li>{tInfo('notOfficialPrices')}</li>
            <li>{tInfo('notChartPlatform')}</li>
          </ul>
        </section>

        <section>
          <h2>{tInfo('dataSource')}</h2>
          <p>{tInfo('dataSourceContent')}</p>
          <HyperliquidBadge />
        </section>
      </div>

      <Separator />

      <ComplianceNotice />
    </div>
  );
}
