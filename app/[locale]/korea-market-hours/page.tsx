import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ComplianceNotice } from '@/components/common/ComplianceNotice';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.koreaMarketHours' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: '/korea-market-hours',
      languages: {
        en: '/korea-market-hours',
        ko: '/ko/korea-market-hours',
      },
    },
  };
}

export default async function KoreaMarketHoursPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.koreaMarketHours');

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
              <strong>{locale === 'ko' ? '시간:' : 'Time:'}</strong> 9:00 AM -
              3:30 PM KST
            </p>
            <p>
              <strong>{locale === 'ko' ? '요일:' : 'Days:'}</strong>{' '}
              {locale === 'ko' ? '월요일 - 금요일' : 'Monday - Friday'}
            </p>
            <p>
              <strong>{locale === 'ko' ? '시간대:' : 'Timezone:'}</strong>{' '}
              Korea Standard Time (KST)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {locale === 'ko' ? '주요 거래소' : 'Major Exchange'}
            </CardTitle>
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
        <h2>
          {locale === 'ko'
            ? 'NightTicker가 유용한 이유'
            : 'Why NightTicker is Useful'}
        </h2>
        <p>
          {locale === 'ko'
            ? '한국 주식 시장이 닫혀 있는 동안에도 Hyperliquid Market Prices를 통해 시장 동향을 참고할 수 있습니다. NightTicker는 야간, 주말, 휴일에 참고용 가격 정보를 제공합니다.'
            : 'While Korean stock markets are closed, you can still monitor market activity through Hyperliquid Market Prices. NightTicker provides reference price information during overnight hours, weekends, and holidays.'}
        </p>
        <p>
          {locale === 'ko'
            ? '참고: NightTicker는 KRX 시간외 거래 가격이 아닌 Hyperliquid Market Prices를 표시합니다. 투자 결정에 이 정보를 사용하지 마세요.'
            : 'Note: NightTicker displays Hyperliquid Market Prices, not KRX after-hours trading prices. Do not use this information for investment decisions.'}
        </p>
      </div>

      <Separator />

      <ComplianceNotice />
    </div>
  );
}
