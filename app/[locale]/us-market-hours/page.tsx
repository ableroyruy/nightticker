import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
      title: '미국 주식시장 거래시간 - NYSE/나스닥 개장시간 | 나이트티커',
      description: '미국 주식시장 거래시간을 확인하세요. NYSE, 나스닥 개장시간, 프리마켓, 애프터마켓 시간 정보를 제공합니다. 장마감 후 야간 주가는 하이퍼리퀴드 기반.',
      keywords: ['미국 주식시장 시간', '뉴욕증시 개장시간', '나스닥 거래시간', 'NYSE 시간', '프리마켓', '나이트티커'],
    },
    en: {
      title: 'US Stock Market Hours - NYSE & NASDAQ Trading Hours | NightTicker',
      description: 'Check US stock market trading hours. Get NYSE, NASDAQ opening hours, pre-market, and after-hours trading schedule. Powered by Hyperliquid.',
      keywords: ['US stock market hours', 'NYSE trading hours', 'NASDAQ hours', 'pre-market hours', 'after hours trading', 'NightTicker'],
    },
    ja: {
      title: '米国株式市場 取引時間 - NYSE/NASDAQ営業時間 | ナイトティッカー',
      description: '米国株式市場の取引時間を確認。NYSE、NASDAQ開場時間、プレマーケット、アフターマーケット情報。ハイパーリキッド基盤。',
      keywords: ['米国株式市場 時間', 'NYSE 取引時間', 'NASDAQ 時間', 'プレマーケット', 'ナイトティッカー'],
    },
  };

  const current = isJa ? meta.ja : isKo ? meta.ko : meta.en;
  const canonicalUrl = locale === 'en' ? `${BASE_URL}/us-market-hours` : `${BASE_URL}/${locale}/us-market-hours`;

  return {
    title: current.title,
    description: current.description,
    keywords: current.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${BASE_URL}/us-market-hours`,
        ko: `${BASE_URL}/ko/us-market-hours`,
        ja: `${BASE_URL}/ja/us-market-hours`,
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

export default async function USMarketHoursPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.usMarketHours');

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold">{t('title')}</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          {t('description')}
        </p>
      </div>

      <Separator />

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {locale === 'ko' ? '정규 거래 시간' : 'Regular Trading Hours'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>
              <strong>{locale === 'ko' ? '시간:' : 'Time:'}</strong> 9:30 AM -
              4:00 PM ET
            </p>
            <p>
              <strong>{locale === 'ko' ? '요일:' : 'Days:'}</strong>{' '}
              {locale === 'ko' ? '월요일 - 금요일' : 'Monday - Friday'}
            </p>
            <p>
              <strong>{locale === 'ko' ? '시간대:' : 'Timezone:'}</strong>{' '}
              Eastern Time (ET)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {locale === 'ko' ? '주요 거래소' : 'Major Exchanges'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>NYSE (New York Stock Exchange)</p>
            <p>NASDAQ</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="prose dark:prose-invert max-w-3xl">
        <h2>
          {locale === 'ko'
            ? 'NightTicker가 유용한 이유'
            : 'Why NightTicker is Useful'}
        </h2>
        <p>
          {locale === 'ko'
            ? '미국 주식 시장이 닫혀 있는 동안에도 Hyperliquid Market Prices를 통해 시장 동향을 참고할 수 있습니다. NightTicker는 야간, 주말, 휴일에 참고용 가격 정보를 제공합니다.'
            : 'While US stock markets are closed, you can still monitor market activity through Hyperliquid Market Prices. NightTicker provides reference price information during overnight hours, weekends, and holidays.'}
        </p>
        <p>
          {locale === 'ko'
            ? '참고: NightTicker는 공식 거래소 가격이 아닌 Hyperliquid Market Prices를 표시합니다. 투자 결정에 이 정보를 사용하지 마세요.'
            : 'Note: NightTicker displays Hyperliquid Market Prices, not official exchange prices. Do not use this information for investment decisions.'}
        </p>
      </div>

      <Separator />

      <ComplianceNotice />
    </div>
  );
}
