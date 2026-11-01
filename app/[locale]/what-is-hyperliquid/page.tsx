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
  return staticPageMetadata(locale, 'what-is-hyperliquid');
}

export default async function WhatIsHyperliquidPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.whatIsHyperliquid');
  const tInfo = await getTranslations('infoPages.whatIsHyperliquid');

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
          <h2>{tInfo('about')}</h2>
          <p>{tInfo('aboutContent')}</p>
        </section>

        <section>
          <h2>{tInfo('why')}</h2>
          <p>{tInfo('whyContent')}</p>
        </section>

        <section>
          <h2>{tInfo('notice')}</h2>
          <p>{tInfo('noticeContent')}</p>
        </section>
      </div>

      <Separator />

      <ComplianceNotice />
    </div>
  );
}
