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
          <h2>
            {locale === 'ko' ? '수집하는 정보' : 'Information We Collect'}
          </h2>
          <p>
            {locale === 'ko'
              ? 'NightTicker는 최소한의 정보만 수집합니다. 관심 종목 기능은 브라우저의 localStorage에 저장되며 서버로 전송되지 않습니다.'
              : 'NightTicker collects minimal information. The watchlist feature is stored in your browser\'s localStorage and is not transmitted to our servers.'}
          </p>
        </section>

        <section>
          <h2>
            {locale === 'ko' ? 'localStorage 사용' : 'Use of localStorage'}
          </h2>
          <p>
            {locale === 'ko'
              ? '관심 종목 기능을 위해 브라우저의 localStorage를 사용합니다. 이 데이터는 사용자의 기기에만 저장되며 NightTicker 서버로 전송되지 않습니다.'
              : 'We use browser localStorage for the watchlist feature. This data is stored only on your device and is not transmitted to NightTicker servers.'}
          </p>
        </section>

        <section>
          <h2>
            {locale === 'ko' ? '분석 및 쿠키' : 'Analytics and Cookies'}
          </h2>
          <p>
            {locale === 'ko'
              ? 'NightTicker는 웹사이트 사용 분석을 위해 쿠키 또는 유사한 기술을 사용할 수 있습니다. 이 정보는 서비스 개선을 위해 사용됩니다.'
              : 'NightTicker may use cookies or similar technologies for website usage analytics. This information is used to improve our service.'}
          </p>
        </section>

        <section>
          <h2>
            {locale === 'ko' ? '제3자 링크' : 'Third-Party Links'}
          </h2>
          <p>
            {locale === 'ko'
              ? 'NightTicker는 Hyperliquid로 연결되는 링크를 포함합니다. 이러한 링크에는 레퍼럴 속성이 포함될 수 있습니다. Hyperliquid의 개인정보처리방침은 NightTicker의 통제 범위 밖입니다.'
              : 'NightTicker contains links to Hyperliquid. These links may contain referral attribution. Hyperliquid\'s privacy practices are outside NightTicker\'s control.'}
          </p>
        </section>

        <section>
          <h2>
            {locale === 'ko' ? '정책 변경' : 'Changes to This Policy'}
          </h2>
          <p>
            {locale === 'ko'
              ? '이 개인정보처리방침은 변경될 수 있습니다. 변경 사항은 이 페이지에 게시됩니다.'
              : 'This privacy policy may change. Changes will be posted on this page.'}
          </p>
        </section>
      </div>
    </div>
  );
}
