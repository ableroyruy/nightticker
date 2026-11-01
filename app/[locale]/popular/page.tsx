import { staticPageMetadata } from '@/lib/seo/static-metadata';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { PopularSearchesPage } from '@/components/pages/PopularSearchesPage';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, 'popular');
}

export default async function PopularPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PopularSearchesPage />;
}
