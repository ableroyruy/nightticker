import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LosersPage } from '@/components/pages/LosersPage';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.losers' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: '/losers',
      languages: {
        en: '/losers',
        ko: '/ko/losers',
      },
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LosersPage />;
}
