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
          <h2>{locale === 'ko' ? 'NightTicker란?' : 'What is NightTicker?'}</h2>
          <p>
            {locale === 'ko'
              ? 'NightTicker는 전통적인 거래소가 닫혀 있을 때 시장 동향을 확인할 수 있는 독립적인 정보 제공 웹사이트입니다.'
              : 'NightTicker is an independent informational website that allows you to monitor market activity when traditional exchanges are closed.'}
          </p>
        </section>

        <section>
          <h2>{locale === 'ko' ? '우리의 미션' : 'Our Mission'}</h2>
          <p>
            {locale === 'ko'
              ? 'NightTicker는 야간, 주말, 휴일에 Hyperliquid Market Prices를 통해 참고용 가격 정보를 제공합니다. 우리는 투자 조언을 제공하지 않습니다.'
              : 'NightTicker provides reference price information through Hyperliquid Market Prices during overnight hours, weekends, and holidays. We do not provide investment advice.'}
          </p>
        </section>

        <section>
          <h2>
            {locale === 'ko' ? 'NightTicker가 아닌 것' : 'What NightTicker is NOT'}
          </h2>
          <ul>
            <li>{locale === 'ko' ? '브로커' : 'A broker'}</li>
            <li>{locale === 'ko' ? '거래소' : 'An exchange'}</li>
            <li>{locale === 'ko' ? '증권사' : 'A securities firm'}</li>
            <li>{locale === 'ko' ? '거래 플랫폼' : 'A trading platform'}</li>
            <li>{locale === 'ko' ? '재정 고문' : 'A financial advisor'}</li>
            <li>{locale === 'ko' ? '투자 서비스' : 'An investment service'}</li>
            <li>
              {locale === 'ko'
                ? '공식 주식 데이터 제공자'
                : 'An official stock data provider'}
            </li>
            <li>
              {locale === 'ko' ? '주식 차트 플랫폼' : 'A stock charting platform'}
            </li>
          </ul>
        </section>

        <section>
          <h2>{locale === 'ko' ? '데이터 소스' : 'Data Source'}</h2>
          <p>
            {locale === 'ko'
              ? 'NightTicker는 Hyperliquid Market Prices를 표시합니다. 이는 공식 거래소 가격이 아니며 참고용 정보입니다.'
              : 'NightTicker displays Hyperliquid Market Prices. These are not official exchange prices and are provided for reference purposes only.'}
          </p>
          <HyperliquidBadge />
        </section>
      </div>

      <Separator />

      <ComplianceNotice />
    </div>
  );
}
