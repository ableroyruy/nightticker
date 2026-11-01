import { marketHoursCopy } from '@/lib/seo/market-hours-copy';
import { staticPageMetadata } from '@/lib/seo/static-metadata';
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
  return staticPageMetadata(locale, 'us-market-hours');
}

export default async function USMarketHoursPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.usMarketHours');
  const tInfo = await getTranslations('infoPages.marketHours');
  const copy = marketHoursCopy(locale, 'US');

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
              {tInfo('regularHours')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>
              <strong>{tInfo('time')}</strong> 9:30 AM -
              4:00 PM ET
            </p>
            <p>
              <strong>{tInfo('days')}</strong>{' '}
              {tInfo('mondayFriday')}
            </p>
            <p>
              <strong>{tInfo('timezone')}</strong>{' '}
              Eastern Time (ET)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {tInfo('majorExchange')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>NYSE (New York Stock Exchange)</p>
            <p>NASDAQ</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <section className="max-w-3xl space-y-3">
        <h2 className="text-xl font-semibold">{copy.title}</h2>
        <p className="leading-relaxed text-muted-foreground">{copy.session}</p>
        <p className="leading-relaxed text-muted-foreground">{copy.reference}</p>
        <p className="text-sm">{copy.calendar}: <a className="underline" href="https://www.nyse.com/markets/hours-calendars">NYSE</a> · <a className="underline" href="https://www.nasdaq.com/market-activity/stock-market-holiday-schedule">Nasdaq</a></p>
      </section>

      <Separator />

      <ComplianceNotice />
    </div>
  );
}
