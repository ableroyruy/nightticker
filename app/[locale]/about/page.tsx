import { staticPageMetadata } from '@/lib/seo/static-metadata';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Separator } from '@/components/ui/separator';
import { HyperliquidBadge } from '@/components/common/HyperliquidBadge';
import { ComplianceNotice } from '@/components/common/ComplianceNotice';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, 'about');
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
