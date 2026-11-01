import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { HomePage } from '@/components/pages/HomePage';
import { pageMetadata, seoLocale } from '@/lib/seo/site';

type Props = { params: Promise<{ locale: string }> };
const homeMeta = {
  en: { title: 'Overnight Stock Prices · Weekend & Holiday Markets', description: 'Track US, Korean and Japanese stocks, ETFs, indices and commodity reference markets overnight, on weekends and on holidays. Hyperliquid prices, charts and market context.' },
  ko: { title: '야간 주가 · 주말·휴일 참고 시세', description: '미국·한국·일본 주식과 ETF, 지수, 원자재의 야간·주말·휴일 참고 시세를 확인하세요. Hyperliquid 기반 가격·차트와 상품 정보를 제공합니다.' },
  ja: { title: '夜間株価 · 週末・休日の参考相場', description: '米国・韓国・日本株、ETF、指数、商品の夜間・週末・休日の参考相場を確認。Hyperliquidの価格、チャートと商品情報を提供します。' },
  zh: { title: '夜间股价 · 周末与节假日参考行情', description: '查看美国、韩国、日本股票以及ETF、指数和大宗商品的夜间、周末与节假日参考行情。提供Hyperliquid价格、图表和产品信息。' },
  pt: { title: 'Cotações noturnas · Fins de semana e feriados', description: 'Acompanhe ações dos EUA, Coreia e Japão, ETFs, índices e commodities à noite, nos fins de semana e feriados. Preços de referência, gráficos e informações dos mercados Hyperliquid.' },
  es: { title: 'Cotizaciones nocturnas · Fines de semana y festivos', description: 'Sigue acciones de EEUU, Corea y Japón, ETF, índices y materias primas de noche, en fines de semana y festivos. Precios de referencia, gráficos e información de los mercados Hyperliquid.' },
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const current = homeMeta[seoLocale(locale)];
  return pageMetadata(locale, '', current.title, current.description);
}
export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomePage />;
}
