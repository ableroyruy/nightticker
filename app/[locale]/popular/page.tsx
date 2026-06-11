import { setRequestLocale } from 'next-intl/server';
import { PopularSearchesPage } from '@/components/pages/PopularSearchesPage';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;

  const title = locale === 'ko' ? '인기 검색 순위' : 'Popular Searches';
  const description =
    locale === 'ko'
      ? '최근 24시간 동안 가장 많이 검색된 종목'
      : 'Top searched stocks in the last 24 hours';

  return {
    title,
    description,
  };
}

export default async function PopularPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PopularSearchesPage />;
}
