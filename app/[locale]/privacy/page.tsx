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
      title: '개인정보처리방침 | 나이트티커',
      description: '나이트티커 개인정보처리방침입니다. 나이트티커가 수집하는 정보와 처리 방식을 안내합니다.',
      keywords: ['개인정보처리방침', '개인정보', '나이트티커'],
    },
    en: {
      title: 'Privacy Policy | NightTicker',
      description: 'NightTicker privacy policy. Learn about what information we collect and how we handle your data.',
      keywords: ['privacy policy', 'privacy', 'NightTicker'],
    },
    ja: {
      title: 'プライバシーポリシー | ナイトティッカー',
      description: 'ナイトティッカーのプライバシーポリシー。収集する情報とその取り扱い方法について説明します。',
      keywords: ['プライバシーポリシー', '個人情報', 'ナイトティッカー'],
    },
  };

  const current = isJa ? meta.ja : isKo ? meta.ko : meta.en;
  const canonicalUrl = locale === 'en' ? `${BASE_URL}/privacy` : `${BASE_URL}/${locale}/privacy`;

  return {
    title: current.title,
    description: current.description,
    keywords: current.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${BASE_URL}/privacy`,
        ko: `${BASE_URL}/ko/privacy`,
        ja: `${BASE_URL}/ja/privacy`,
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

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.privacy');
  const tInfo = await getTranslations('infoPages.privacy');

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
          <h2>{tInfo('collection')}</h2>
          <p>{tInfo('collectionContent')}</p>
        </section>

        <section>
          <h2>{tInfo('localStorage')}</h2>
          <p>{tInfo('localStorageContent')}</p>
        </section>

        <section>
          <h2>{tInfo('analytics')}</h2>
          <p>{tInfo('analyticsContent')}</p>
        </section>

        <section>
          <h2>{tInfo('account')}</h2>
          <p>{tInfo('accountContent')}</p>
        </section>

        <section>
          <h2>{tInfo('network')}</h2>
          <p>{tInfo('networkContent')}</p>
        </section>

        <section>
          <h2>{tInfo('futureAds')}</h2>
          <p>{tInfo('futureAdsContent')}</p>
        </section>

        <section>
          <h2>{tInfo('changes')}</h2>
          <p>{tInfo('changesContent')}</p>
        </section>
      </div>
    </div>
  );
}
