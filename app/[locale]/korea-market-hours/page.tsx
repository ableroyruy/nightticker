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
  return staticPageMetadata(locale, 'korea-market-hours');
}

export default async function KoreaMarketHoursPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.koreaMarketHours');
  const tInfo = await getTranslations('infoPages.marketHours');
  const copy = marketHoursCopy(locale, 'KR');

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

      <section className="max-w-3xl space-y-3">
        <h2 className="text-xl font-semibold">{copy.title}</h2>
        <p className="leading-relaxed text-muted-foreground">{copy.session}</p>
        <p className="leading-relaxed text-muted-foreground">{copy.reference}</p>
        <p className="text-sm">{copy.calendar}: <a className="underline" href="https://global.krx.co.kr/">KRX</a></p>
      </section>

      <Separator />

      <ComplianceNotice />
    </div>
  );
}
