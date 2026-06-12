import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ExchangeRatesPage } from '@/components/pages/ExchangeRatesPage';

type Props = {
  params: Promise<{ locale: string }>;
};

const BASE_URL = 'https://nightticker.com';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === 'ko';
  const isJa = locale === 'ja';
  const isZh = locale === 'zh';
  const isPt = locale === 'pt';
  const isEs = locale === 'es';

  const meta = {
    ko: {
      title: '실시간 환율 - USD/KRW/JPY/EUR 환율 정보 | 나이트티커',
      description:
        '미국 달러, 한국 원, 일본 엔, 유로 등 주요 통화의 실시간 환율을 확인하세요. 24시간 변동률과 함께 제공됩니다.',
      keywords: ['환율', '실시간 환율', 'USD', 'KRW', 'JPY', 'EUR', '달러 환율', '원 환율'],
    },
    ja: {
      title: 'リアルタイム為替レート - USD/JPY/KRW/EUR | ナイトティッカー',
      description:
        '米ドル、日本円、韓国ウォン、ユーロなど主要通貨のリアルタイム為替レートを確認。24時間変動率も提供。',
      keywords: ['為替レート', 'リアルタイム為替', 'USD', 'JPY', 'KRW', 'EUR'],
    },
    zh: {
      title: '实时汇率 - USD/CNY/JPY/EUR汇率信息 | NightTicker',
      description: '查看美元、人民币、日元、欧元等主要货币的实时汇率。提供24小时变动率。',
      keywords: ['汇率', '实时汇率', 'USD', 'CNY', 'JPY', 'EUR'],
    },
    pt: {
      title: 'Taxas de Câmbio em Tempo Real - USD/BRL/EUR | NightTicker',
      description:
        'Confira as taxas de câmbio em tempo real do dólar americano, real brasileiro, euro e outras moedas importantes.',
      keywords: ['taxa de câmbio', 'câmbio em tempo real', 'USD', 'BRL', 'EUR'],
    },
    es: {
      title: 'Tipos de Cambio en Tiempo Real - USD/EUR/JPY | NightTicker',
      description:
        'Consulta los tipos de cambio en tiempo real del dólar estadounidense, euro, yen japonés y otras divisas importantes.',
      keywords: ['tipo de cambio', 'cambio en tiempo real', 'USD', 'EUR', 'JPY'],
    },
    en: {
      title: 'Live Exchange Rates - USD/EUR/JPY/KRW Rates | NightTicker',
      description:
        'Check real-time exchange rates for US Dollar, Euro, Japanese Yen, Korean Won and more. 24h change rates included.',
      keywords: ['exchange rate', 'live exchange rate', 'USD', 'EUR', 'JPY', 'KRW', 'currency'],
    },
  };

  const current = isKo
    ? meta.ko
    : isJa
      ? meta.ja
      : isZh
        ? meta.zh
        : isPt
          ? meta.pt
          : isEs
            ? meta.es
            : meta.en;

  const canonicalUrl =
    locale === 'en' ? `${BASE_URL}/exchange-rates` : `${BASE_URL}/${locale}/exchange-rates`;

  return {
    title: current.title,
    description: current.description,
    keywords: current.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${BASE_URL}/exchange-rates`,
        ko: `${BASE_URL}/ko/exchange-rates`,
        ja: `${BASE_URL}/ja/exchange-rates`,
        zh: `${BASE_URL}/zh/exchange-rates`,
        pt: `${BASE_URL}/pt/exchange-rates`,
        es: `${BASE_URL}/es/exchange-rates`,
      },
    },
    openGraph: {
      title: current.title,
      description: current.description,
      url: canonicalUrl,
      siteName: isKo ? '나이트티커' : isJa ? 'ナイトティッカー' : 'NightTicker',
      locale: isKo ? 'ko_KR' : isJa ? 'ja_JP' : isZh ? 'zh_CN' : isPt ? 'pt_BR' : isEs ? 'es_ES' : 'en_US',
      type: 'website',
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ExchangeRatesPage />;
}
