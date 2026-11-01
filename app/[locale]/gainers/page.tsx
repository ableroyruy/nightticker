import { staticPageMetadata } from '@/lib/seo/static-metadata';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { GainersPage } from '@/components/pages/GainersPage';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, 'gainers');
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <GainersPage />;
}
