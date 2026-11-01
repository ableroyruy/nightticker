import { staticPageMetadata } from '@/lib/seo/static-metadata';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Separator } from '@/components/ui/separator';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, 'privacy');
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.privacy');
  const tInfo = await getTranslations('infoPages.privacy');

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
          <h2>{tInfo('collection')}</h2>
          <p>{tInfo('collectionContent')}</p>
        </section>

        <section>
          <h2>{tInfo('localStorage')}</h2>
          <p>{tInfo('localStorageContent')}</p>
        </section>

        <section>
          <h2>{tInfo('analytics')}</h2>
          <p>{tInfo('analyticsContent')}</p>
        </section>

        <section>
          <h2>{tInfo('account')}</h2>
          <p>{tInfo('accountContent')}</p>
        </section>

        <section>
          <h2>{tInfo('network')}</h2>
          <p>{tInfo('networkContent')}</p>
        </section>

        <section>
          <h2>{tInfo('futureAds')}</h2>
          <p>{tInfo('futureAdsContent')}</p>
        </section>

        <section>
          <h2>{tInfo('changes')}</h2>
          <p>{tInfo('changesContent')}</p>
        </section>
      </div>
    </div>
  );
}
