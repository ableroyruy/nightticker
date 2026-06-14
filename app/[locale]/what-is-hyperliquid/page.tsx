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
  const tInfo = await getTranslations('infoPages.whatIsHyperliquid');

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
          <h2>{tInfo('about')}</h2>
          <p>{tInfo('aboutContent')}</p>
        </section>

        <section>
          <h2>{tInfo('why')}</h2>
          <p>{tInfo('whyContent')}</p>
        </section>

        <section>
          <h2>{tInfo('notice')}</h2>
          <p>{tInfo('noticeContent')}</p>
        </section>
      </div>

      <Separator />

      <ComplianceNotice />
    </div>
  );
}
