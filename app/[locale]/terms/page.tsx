import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Separator } from '@/components/ui/separator';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.terms' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: '/terms',
      languages: {
        en: '/terms',
        ko: '/ko/terms',
      },
    },
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.terms');

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
            {locale === 'ko' ? '약관 동의' : 'Acceptance of Terms'}
          </h2>
          <p>
            {locale === 'ko'
              ? 'NightTicker 웹사이트를 사용함으로써 이 이용약관에 동의하는 것으로 간주됩니다.'
              : 'By using the NightTicker website, you agree to these terms of service.'}
          </p>
        </section>

        <section>
          <h2>
            {locale === 'ko' ? '서비스 설명' : 'Description of Service'}
          </h2>
          <p>
            {locale === 'ko'
              ? 'NightTicker는 Hyperliquid Market Prices를 참고용으로 표시하는 정보 제공 웹사이트입니다. NightTicker는 브로커, 거래소, 증권사, 거래 플랫폼, 재정 고문 또는 투자 서비스가 아닙니다.'
              : 'NightTicker is an informational website that displays Hyperliquid Market Prices for reference purposes. NightTicker is not a broker, exchange, securities firm, trading platform, financial advisor, or investment service.'}
          </p>
        </section>

        <section>
          <h2>
            {locale === 'ko' ? '면책조항' : 'Disclaimer'}
          </h2>
          <p>
            {locale === 'ko'
              ? '모든 정보는 참고용으로만 제공됩니다. 투자 또는 거래 결정에 표시된 정보를 사용하지 마세요. NightTicker는 표시된 정보의 정확성, 완전성, 가용성 또는 적시성에 대해 어떠한 보장도 하지 않습니다.'
              : 'All information is provided for reference purposes only. Do not rely on displayed information for investment or trading decisions. NightTicker makes no representation regarding the accuracy, completeness, availability, or timeliness of displayed information.'}
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
            {locale === 'ko' ? '지적 재산권' : 'Intellectual Property'}
          </h2>
          <p>
            {locale === 'ko'
              ? 'NightTicker의 콘텐츠, 디자인 및 코드는 저작권으로 보호됩니다.'
              : 'NightTicker\'s content, design, and code are protected by copyright.'}
          </p>
        </section>

        <section>
          <h2>
            {locale === 'ko' ? '약관 변경' : 'Changes to Terms'}
          </h2>
          <p>
            {locale === 'ko'
              ? '이 이용약관은 변경될 수 있습니다. 변경 사항은 이 페이지에 게시됩니다. 계속해서 서비스를 사용하면 변경된 약관에 동의하는 것으로 간주됩니다.'
              : 'These terms of service may change. Changes will be posted on this page. Continued use of the service constitutes acceptance of the modified terms.'}
          </p>
        </section>
      </div>
    </div>
  );
}
