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
  return staticPageMetadata(locale, 'how-data-works');
}

export default async function HowDataWorksPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.howDataWorks');
  const tInfo = await getTranslations('infoPages.howDataWorks');

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
          <h2>{tInfo('dataSource')}</h2>
          <p>{tInfo('dataSourceContent')}</p>
        </section>

        <section>
          <h2>{tInfo('referencePrices')}</h2>
          <p>{tInfo('referencePricesContent')}</p>
        </section>

        <section>
          <h2>{tInfo('accuracy')}</h2>
          <p>{tInfo('accuracyContent')}</p>
        </section>

        <section>
          <h2>{tInfo('details')}</h2>
          <p>{tInfo('detailsContent')}</p>
        </section>
      </div>

      <Separator />

      <ComplianceNotice />
    </div>
  );
}
