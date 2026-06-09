import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HomePage } from '@/components/pages/HomePage';

type Props = {
  params: Promise<{ locale: string }>;
};

const BASE_URL = 'https://nightticker.com';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site' });

  const title = `${t('name')} - ${t('tagline')}`;
  const description = t('description');

  return {
    title,
    description,
    keywords:
      locale === 'ko'
        ? [
            '야간 주식 가격',
            '주말 주식 시세',
            '휴일 주식 가격',
            'overnight stock price',
            'weekend stock price',
            'hyperliquid',
          ]
        : [
            'overnight stock price',
            'night stock price',
            'weekend stock price',
            'holiday stock price',
            'after hours price',
            'hyperliquid',
          ],
    alternates: {
      canonical: locale === 'ko' ? `${BASE_URL}/ko` : BASE_URL,
      languages: {
        en: BASE_URL,
        ko: `${BASE_URL}/ko`,
      },
    },
    openGraph: {
      title,
      description,
      url: locale === 'ko' ? `${BASE_URL}/ko` : BASE_URL,
      siteName: 'NightTicker',
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomePage />;
}
