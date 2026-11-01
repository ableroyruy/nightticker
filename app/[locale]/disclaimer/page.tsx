import { staticPageMetadata } from '@/lib/seo/static-metadata';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Separator } from '@/components/ui/separator';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, 'disclaimer');
}

export default async function DisclaimerPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.disclaimer');
  const tInfo = await getTranslations('infoPages.disclaimer');

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
          <h2>{tInfo('general')}</h2>
          <p>{tInfo('generalContent')}</p>
        </section>

        <section>
          <h2>{tInfo('dataAccuracy')}</h2>
          <p>{tInfo('dataAccuracyContent')}</p>
          <p>{tInfo('dataAccuracyNote')}</p>
        </section>

        <section>
          <h2>{tInfo('notAdvice')}</h2>
          <p>{tInfo('notAdviceContent')}</p>
        </section>

        <section>
          <h2>{tInfo('liability')}</h2>
          <p>{tInfo('liabilityContent')}</p>
        </section>

        <section>
          <h2>{tInfo('source')}</h2>
          <p>{tInfo('sourceContent')}</p>
        </section>

        <section>
          <h2>{tInfo('userResponsibility')}</h2>
          <p>{tInfo('userResponsibilityContent')}</p>
        </section>
      </div>
    </div>
  );
}
