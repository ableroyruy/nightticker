import { staticPageMetadata } from '@/lib/seo/static-metadata';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { FavoritesPage } from '@/components/pages/FavoritesPage';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { ...staticPageMetadata(locale, 'favorites'), robots: { index: false, follow: true } };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <FavoritesPage />;
}
