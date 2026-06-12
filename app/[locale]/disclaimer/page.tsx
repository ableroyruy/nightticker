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
      title: '면책조항 - 나이트티커 법적 고지 | 나이트티커',
      description: '나이트티커 면책조항 및 법적 고지사항입니다. 야간 주가는 참고용 정보이며 투자 조언이 아닙니다.',
      keywords: ['면책조항', '법적 고지', '나이트티커'],
    },
    en: {
      title: 'Disclaimer - NightTicker Legal Notice | NightTicker',
      description: 'NightTicker disclaimer and legal notice. Night stock prices are for reference only and not investment advice.',
      keywords: ['disclaimer', 'legal notice', 'NightTicker'],
    },
    ja: {
      title: '免責事項 - ナイトティッカー法的告知 | ナイトティッカー',
      description: 'ナイトティッカーの免責事項および法的告知。夜間株価は参考情報であり、投資アドバイスではありません。',
      keywords: ['免責事項', '法的告知', 'ナイトティッカー'],
    },
  };

  const current = isJa ? meta.ja : isKo ? meta.ko : meta.en;
  const canonicalUrl = locale === 'en' ? `${BASE_URL}/disclaimer` : `${BASE_URL}/${locale}/disclaimer`;

  return {
    title: current.title,
    description: current.description,
    keywords: current.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${BASE_URL}/disclaimer`,
        ko: `${BASE_URL}/ko/disclaimer`,
        ja: `${BASE_URL}/ja/disclaimer`,
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

export default async function DisclaimerPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.disclaimer');
  const tInfo = await getTranslations('infoPages.disclaimer');

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
          <h2>{tInfo('general')}</h2>
          <p>{tInfo('generalContent')}</p>
        </section>

        <section>
          <h2>{tInfo('dataAccuracy')}</h2>
          <p>{tInfo('dataAccuracyContent')}</p>
          <p>{tInfo('dataAccuracyNote')}</p>
        </section>

        <section>
          <h2>{tInfo('notAdvice')}</h2>
          <p>{tInfo('notAdviceContent')}</p>
        </section>

        <section>
          <h2>{tInfo('liability')}</h2>
          <p>{tInfo('liabilityContent')}</p>
        </section>

        <section>
          <h2>{tInfo('source')}</h2>
          <p>{tInfo('sourceContent')}</p>
        </section>

        <section>
          <h2>{tInfo('userResponsibility')}</h2>
          <p>{tInfo('userResponsibilityContent')}</p>
        </section>
      </div>
    </div>
  );
}
