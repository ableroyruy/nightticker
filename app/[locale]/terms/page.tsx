import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Separator } from '@/components/ui/separator';

type Props = {
  params: Promise<{ locale: string }>;
};

const BASE_URL = 'https://nightticker.com';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const isJa = locale === 'ja';

  const meta = {
    ko: {
      title: '이용약관 | 나이트티커',
      description: '나이트티커 이용약관입니다. 서비스 이용에 관한 조건과 정책을 안내합니다.',
      keywords: ['이용약관', '서비스 약관', '나이트티커'],
    },
    en: {
      title: 'Terms of Service | NightTicker',
      description: 'NightTicker terms of service. Read about the conditions and policies for using our service.',
      keywords: ['terms of service', 'terms', 'NightTicker'],
    },
    ja: {
      title: '利用規約 | ナイトティッカー',
      description: 'ナイトティッカーの利用規約。サービス利用に関する条件とポリシーを説明します。',
      keywords: ['利用規約', 'サービス規約', 'ナイトティッカー'],
    },
  };

  const current = isJa ? meta.ja : isKo ? meta.ko : meta.en;
  const canonicalUrl = locale === 'en' ? `${BASE_URL}/terms` : `${BASE_URL}/${locale}/terms`;

  return {
    title: current.title,
    description: current.description,
    keywords: current.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${BASE_URL}/terms`,
        ko: `${BASE_URL}/ko/terms`,
        ja: `${BASE_URL}/ja/terms`,
      },
    },
    openGraph: {
      title: current.title,
      description: current.description,
      url: canonicalUrl,
      siteName: isJa ? 'ナイトティッカー' : isKo ? '나이트티커' : 'NightTicker',
      locale: isJa ? 'ja_JP' : isKo ? 'ko_KR' : 'en_US',
      type: 'website',
    },
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.terms');
  const tInfo = await getTranslations('infoPages.terms');

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
          <h2>{tInfo('acceptance')}</h2>
          <p>{tInfo('acceptanceContent')}</p>
        </section>

        <section>
          <h2>{tInfo('service')}</h2>
          <p>{tInfo('serviceContent')}</p>
        </section>

        <section>
          <h2>{tInfo('disclaimer')}</h2>
          <p>{tInfo('disclaimerContent')}</p>
        </section>

        <section>
          <h2>{tInfo('liability')}</h2>
          <p>{tInfo('liabilityContent')}</p>
        </section>

        <section>
          <h2>{tInfo('ip')}</h2>
          <p>{tInfo('ipContent')}</p>
        </section>

        <section>
          <h2>{tInfo('changes')}</h2>
          <p>{tInfo('changesContent')}</p>
        </section>
      </div>
    </div>
  );
}
