import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { GainersPage } from '@/components/pages/GainersPage';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.gainers' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: '/gainers',
      languages: {
        en: '/gainers',
        ko: '/ko/gainers',
      },
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <GainersPage />;
}
