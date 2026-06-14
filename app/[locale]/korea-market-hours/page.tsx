import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
      title: '한국 주식시장 거래시간 - 코스피/코스닥 개장시간 | 나이트티커',
      description: '한국 주식시장 거래시간을 확인하세요. 코스피, 코스닥 개장시간, 동시호가, 시간외거래 정보를 제공합니다. 장마감 후 야간 주가는 하이퍼리퀴드 기반.',
      keywords: ['한국 주식시장 시간', '코스피 개장시간', '코스닥 거래시간', 'KRX 시간', '시간외거래', '나이트티커'],
    },
    en: {
      title: 'Korea Stock Market Hours - KOSPI & KOSDAQ Trading Hours | NightTicker',
      description: 'Check Korean stock market trading hours. Get KOSPI, KOSDAQ opening hours and pre/post-market trading schedule. Powered by Hyperliquid.',
      keywords: ['Korea stock market hours', 'KOSPI trading hours', 'KOSDAQ hours', 'KRX hours', 'Korean market schedule', 'NightTicker'],
    },
    ja: {
      title: '韓国株式市場 取引時間 - KOSPI/KOSDAQ営業時間 | ナイトティッカー',
      description: '韓国株式市場の取引時間を確認。KOSPI、KOSDAQ開場時間、時間外取引情報。ハイパーリキッド基盤。',
      keywords: ['韓国株式市場 時間', 'KOSPI 取引時間', 'KOSDAQ 時間', '韓国市場 時間', 'ナイトティッカー'],
    },
  };

  const current = isJa ? meta.ja : isKo ? meta.ko : meta.en;
  const canonicalUrl = locale === 'en' ? `${BASE_URL}/korea-market-hours` : `${BASE_URL}/${locale}/korea-market-hours`;

  return {
    title: current.title,
    description: current.description,
    keywords: current.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${BASE_URL}/korea-market-hours`,
        ko: `${BASE_URL}/ko/korea-market-hours`,
        ja: `${BASE_URL}/ja/korea-market-hours`,
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

export default async function KoreaMarketHoursPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.koreaMarketHours');
  const tInfo = await getTranslations('infoPages.marketHours');

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
            <CardTitle>{tInfo('regularHours')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>
              <strong>{tInfo('time')}</strong> 9:00 AM - 3:30 PM KST
            </p>
            <p>
              <strong>{tInfo('days')}</strong> {tInfo('mondayFriday')}
            </p>
            <p>
              <strong>{tInfo('timezone')}</strong> Korea Standard Time (KST)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tInfo('majorExchange')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>KRX (Korea Exchange)</p>
            <p>KOSPI</p>
            <p>KOSDAQ</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="prose dark:prose-invert max-w-3xl">
        <p>{tInfo('note1')}</p>
        <p>{tInfo('note2')}</p>
        <p>{tInfo('note3')}</p>
      </div>

      <Separator />

      <ComplianceNotice />
    </div>
  );
}
