import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Separator } from '@/components/ui/separator';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.disclaimer' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: '/disclaimer',
      languages: {
        en: '/disclaimer',
        ko: '/ko/disclaimer',
      },
    },
  };
}

export default async function DisclaimerPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.disclaimer');

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
            {locale === 'ko' ? '일반 면책조항' : 'General Disclaimer'}
          </h2>
          <p>
            {locale === 'ko'
              ? 'NightTicker는 독립적인 정보 제공 웹사이트입니다. NightTicker는 브로커, 거래소, 증권사, 거래 플랫폼, 재정 고문 또는 투자 서비스가 아닙니다.'
              : 'NightTicker is an independent informational website. NightTicker is not a broker, exchange, securities firm, trading platform, financial advisor, or investment service.'}
          </p>
        </section>

        <section>
          <h2>
            {locale === 'ko' ? '데이터 정확성' : 'Data Accuracy'}
          </h2>
          <p>
            {locale === 'ko'
              ? '모든 정보는 참고용으로만 제공됩니다. NightTicker는 공식 거래소 가격이 아닌 Hyperliquid Market Prices를 표시합니다. Hyperliquid Market Prices는 전통적인 거래소 가격과 크게 다를 수 있습니다.'
              : 'All information is provided for reference purposes only. NightTicker displays Hyperliquid Market Prices, not official stock exchange prices. Hyperliquid Market Prices may differ significantly from prices on traditional stock exchanges.'}
          </p>
          <p>
            {locale === 'ko'
              ? '표시된 정보에는 지연, 부정확성, 누락 또는 오류가 포함될 수 있습니다. NightTicker는 표시된 정보의 정확성, 완전성, 가용성 또는 적시성에 대해 어떠한 보장도 하지 않습니다.'
              : 'Displayed information may contain delays, inaccuracies, omissions, or errors. NightTicker makes no representation regarding the accuracy, completeness, availability, or timeliness of displayed information.'}
          </p>
        </section>

        <section>
          <h2>
            {locale === 'ko' ? '투자 조언 아님' : 'Not Investment Advice'}
          </h2>
          <p>
            {locale === 'ko'
              ? '투자 또는 거래 결정에 표시된 정보를 사용하지 마세요. NightTicker는 투자 조언, 거래 조언, 재정 조언, 추천, 예측 또는 가격 목표를 제공하지 않습니다.'
              : 'Do not rely on displayed information for investment or trading decisions. NightTicker does not provide investment advice, trading advice, financial advice, recommendations, forecasts, or price targets.'}
          </p>
        </section>

        <section>
          <h2>
            {locale === 'ko' ? '책임 제한' : 'Limitation of Liability'}
          </h2>
          <p>
            {locale === 'ko'
              ? 'NightTicker는 표시된 정보의 사용으로 인해 발생하는 모든 손실 또는 손해에 대해 책임을 지지 않습니다.'
              : 'NightTicker shall not be liable for any loss or damage arising from the use of displayed information.'}
          </p>
        </section>

        <section>
          <h2>
            {locale === 'ko' ? '레퍼럴 링크' : 'Referral Links'}
          </h2>
          <p>
            {locale === 'ko'
              ? 'Hyperliquid로 연결되는 링크에는 레퍼럴 속성이 포함될 수 있습니다.'
              : 'Links to Hyperliquid may contain referral attribution.'}
          </p>
        </section>
      </div>
    </div>
  );
}
