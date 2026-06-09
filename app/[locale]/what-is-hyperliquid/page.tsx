import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Separator } from '@/components/ui/separator';
import { HyperliquidBadge } from '@/components/common/HyperliquidBadge';
import { ComplianceNotice } from '@/components/common/ComplianceNotice';
import { SourceMarketLink } from '@/components/common/SourceMarketLink';

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
      title: '하이퍼리퀴드란 - 나이트티커 야간 주가 출처 | 나이트티커',
      description: '나이트티커의 야간 주가 출처인 하이퍼리퀴드에 대해 알아보세요. 하이퍼리퀴드 시장과 참고가격의 특징을 설명합니다.',
      keywords: ['하이퍼리퀴드', 'Hyperliquid', '야간 주가 출처', '나이트티커'],
    },
    en: {
      title: 'What is Hyperliquid - NightTicker Price Source | NightTicker',
      description: 'Learn about Hyperliquid, the source of night stock prices on NightTicker. Understand how Hyperliquid market prices work.',
      keywords: ['Hyperliquid', 'night price source', 'market prices', 'NightTicker'],
    },
    ja: {
      title: 'ハイパーリキッドとは - ナイトティッカーの価格ソース | ナイトティッカー',
      description: 'ナイトティッカーの夜間株価ソースであるハイパーリキッドについて解説。ハイパーリキッド市場価格の特徴を説明。',
      keywords: ['ハイパーリキッド', 'Hyperliquid', '夜間株価ソース', 'ナイトティッカー'],
    },
  };

  const current = isJa ? meta.ja : isKo ? meta.ko : meta.en;
  const canonicalUrl = locale === 'en' ? `${BASE_URL}/what-is-hyperliquid` : `${BASE_URL}/${locale}/what-is-hyperliquid`;

  return {
    title: current.title,
    description: current.description,
    keywords: current.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${BASE_URL}/what-is-hyperliquid`,
        ko: `${BASE_URL}/ko/what-is-hyperliquid`,
        ja: `${BASE_URL}/ja/what-is-hyperliquid`,
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

export default async function WhatIsHyperliquidPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.whatIsHyperliquid');

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
            {locale === 'ko' ? 'Hyperliquid 소개' : 'About Hyperliquid'}
          </h2>
          <p>
            {locale === 'ko'
              ? 'Hyperliquid는 NightTicker에 표시되는 시장 가격의 소스입니다. NightTicker는 Hyperliquid Market Prices를 참고용으로 표시합니다.'
              : 'Hyperliquid is the source of market prices displayed on NightTicker. NightTicker displays Hyperliquid Market Prices for reference purposes.'}
          </p>
        </section>

        <section>
          <h2>
            {locale === 'ko' ? '왜 Hyperliquid인가?' : 'Why Hyperliquid?'}
          </h2>
          <p>
            {locale === 'ko'
              ? 'Hyperliquid는 전통적인 거래소가 닫혀 있는 시간에도 시장 활동을 반영할 수 있습니다. 이를 통해 사용자는 야간, 주말, 휴일에도 시장 동향을 참고할 수 있습니다.'
              : 'Hyperliquid can reflect market activity even when traditional exchanges are closed. This allows users to monitor market trends during overnight hours, weekends, and holidays.'}
          </p>
        </section>

        <section>
          <h2>
            {locale === 'ko' ? '중요 안내' : 'Important Notice'}
          </h2>
          <p>
            {locale === 'ko'
              ? 'Hyperliquid Market Prices는 공식 거래소 가격이 아닙니다. 가격은 전통적인 거래소 가격과 크게 다를 수 있습니다. 투자 또는 거래 결정에 이 정보를 사용하지 마세요.'
              : 'Hyperliquid Market Prices are not official exchange prices. Prices may differ significantly from traditional exchange prices. Do not use this information for investment or trading decisions.'}
          </p>
        </section>

        <section>
          <h2>
            {locale === 'ko' ? '더 알아보기' : 'Learn More'}
          </h2>
          <p>
            {locale === 'ko'
              ? '상세한 시장 정보는 Hyperliquid를 직접 방문해 주세요.'
              : 'For detailed market information, please visit Hyperliquid directly.'}
          </p>
          <SourceMarketLink symbol="" showDisclosure />
        </section>
      </div>

      <Separator />

      <ComplianceNotice />
    </div>
  );
}
