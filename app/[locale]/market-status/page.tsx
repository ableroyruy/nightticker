import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MarketStatusBadge } from '@/components/market/MarketStatusBadge';
import { ComplianceNotice } from '@/components/common/ComplianceNotice';
import { isMarketOpen, getMarketStatus, US_MARKET, KR_MARKET } from '@/lib/markets/hours';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.marketStatus' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: '/market-status',
      languages: {
        en: '/market-status',
        ko: '/ko/market-status',
      },
    },
  };
}

export default async function MarketStatusPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.marketStatus');

  const usStatus = getMarketStatus(US_MARKET);
  const krStatus = getMarketStatus(KR_MARKET);

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
        {/* US Market */}
        <Card>
          <CardHeader>
            <CardTitle>
              {locale === 'ko' ? US_MARKET.nameKo : US_MARKET.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {locale === 'ko' ? '상태:' : 'Status:'}
              </span>
              <MarketStatusBadge isOpen={usStatus.isOpen} />
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                {locale === 'ko' ? '거래 시간:' : 'Trading Hours:'}{' '}
                {US_MARKET.openTime} - {US_MARKET.closeTime} (ET)
              </p>
              <p>
                {locale === 'ko' ? '거래일:' : 'Trading Days:'}{' '}
                {locale === 'ko' ? '월요일 - 금요일' : 'Monday - Friday'}
              </p>
              <p>{usStatus.nextEvent}</p>
            </div>
          </CardContent>
        </Card>

        {/* Korean Market */}
        <Card>
          <CardHeader>
            <CardTitle>
              {locale === 'ko' ? KR_MARKET.nameKo : KR_MARKET.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {locale === 'ko' ? '상태:' : 'Status:'}
              </span>
              <MarketStatusBadge isOpen={krStatus.isOpen} />
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                {locale === 'ko' ? '거래 시간:' : 'Trading Hours:'}{' '}
                {KR_MARKET.openTime} - {KR_MARKET.closeTime} (KST)
              </p>
              <p>
                {locale === 'ko' ? '거래일:' : 'Trading Days:'}{' '}
                {locale === 'ko' ? '월요일 - 금요일' : 'Monday - Friday'}
              </p>
              <p>{krStatus.nextEvent}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="prose dark:prose-invert max-w-3xl">
        <p>
          {locale === 'ko'
            ? '참고: 이 페이지는 일반적인 마켓 시간 정보만 제공합니다. 휴일이나 특별 일정으로 인해 실제 거래 시간이 다를 수 있습니다.'
            : 'Note: This page provides general market hours information only. Actual trading hours may differ due to holidays or special schedules.'}
        </p>
      </div>

      <Separator />

      <ComplianceNotice />
    </div>
  );
}
