import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FavoritesPage } from '@/components/pages/FavoritesPage';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.favorites' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: '/favorites',
      languages: {
        en: '/favorites',
        ko: '/ko/favorites',
      },
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <FavoritesPage />;
}
