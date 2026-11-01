import { staticPageMetadata } from '@/lib/seo/static-metadata';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Separator } from '@/components/ui/separator';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, 'terms');
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.terms');
  const tInfo = await getTranslations('infoPages.terms');

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
          <h2>{tInfo('acceptance')}</h2>
          <p>{tInfo('acceptanceContent')}</p>
        </section>

        <section>
          <h2>{tInfo('service')}</h2>
          <p>{tInfo('serviceContent')}</p>
        </section>

        <section>
          <h2>{tInfo('disclaimer')}</h2>
          <p>{tInfo('disclaimerContent')}</p>
        </section>

        <section>
          <h2>{tInfo('liability')}</h2>
          <p>{tInfo('liabilityContent')}</p>
        </section>

        <section>
          <h2>{tInfo('ip')}</h2>
          <p>{tInfo('ipContent')}</p>
        </section>

        <section>
          <h2>{tInfo('changes')}</h2>
          <p>{tInfo('changesContent')}</p>
        </section>
      </div>
    </div>
  );
}
