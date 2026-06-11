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
            {locale === 'ko' ? '데이터 출처' : 'Data Source'}
          </h2>
          <p>
            {locale === 'ko'
              ? '표시되는 가격은 Hyperliquid Market Prices를 기반으로 합니다. 이는 참고용 정보이며 공식 거래소 가격이 아닙니다.'
              : 'Displayed prices are based on Hyperliquid Market Prices. This is reference information only and not official exchange prices.'}
          </p>
        </section>

        <section>
          <h2>
            {locale === 'ko' ? '사용자 책임' : 'User Responsibility'}
          </h2>
          <p>
            {locale === 'ko'
              ? '사용자는 자신의 투자 결정과 그로 인한 이익 또는 손실에 대해 전적으로 책임집니다. NightTicker는 금전적 손실에 대해 책임지지 않습니다.'
              : 'Users are solely responsible for their own investment decisions and any resulting gains or losses. NightTicker is not liable for any financial losses.'}
          </p>
        </section>
      </div>
    </div>
  );
}
