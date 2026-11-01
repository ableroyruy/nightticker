import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CategoryPage } from '@/components/pages/CategoryPage';
import type { StockCategory, Stock } from '@/lib/providers/types';
import { categoryNames, getStocksByCategory, getStocksBySectorForCategory } from '@/lib/markets/stocks';
import { pageMetadata, SEO_LOCALES, seoLocale } from '@/lib/seo/site';

type Props = { params: Promise<{ locale: string; category: string }> };
const validCategories: StockCategory[] = ['US', 'KR', 'JP', 'INDEX', 'ETF', 'COMMODITY', 'FX', 'SPECIAL', 'SEMICONDUCTOR'];
function getCategoryFromSlug(slug: string): StockCategory | null {
  const category = slug.toUpperCase() as StockCategory;
  return validCategories.includes(category) ? category : null;
}
function categoryStocks(category: StockCategory) {
  return category === 'SEMICONDUCTOR' ? getStocksBySectorForCategory('Semiconductors') : getStocksByCategory(category);
}
function name(stock: Stock, locale: string) {
  const language = seoLocale(locale);
  return language === 'en' ? stock.name : stock[{ ko: 'nameKo', ja: 'nameJa', zh: 'nameZh', pt: 'namePt', es: 'nameEs' }[language] as keyof Stock] as string || stock.name;
}
function categoryCopy(category: StockCategory, locale: string) {
  const language = seoLocale(locale);
  const label = categoryNames[category][language];
  const examples = categoryStocks(category).slice(0, 4).map(stock => name(stock, language)).join(', ');
  return {
    en: { title: `${label} Overnight Reference Prices`, description: `Explore ${label.toLowerCase()} reference markets including ${examples}. Compare Hyperliquid prices and 24-hour changes during overnight, weekend and holiday sessions.`, heading: 'About these reference markets', guidance: 'These markets track underlying assets through derivatives. Open a market to check its product type, quote unit and underlying reference; prices may differ from the official exchange or spot market.', directory: 'All markets' },
    ko: { title: `${label} 야간 참고 시세`, description: `${examples} 등 ${label}의 야간·주말·휴일 참고 시세를 확인하세요. Hyperliquid 가격과 24시간 변동을 비교할 수 있습니다.`, heading: '이 분류의 참고 시세', guidance: '기초자산을 참고하는 파생상품 시장입니다. 종목 상세에서 상품 종류·표시 단위·기초자산을 확인하세요. 공식 거래소나 현물 시장의 가격과 다를 수 있습니다.', directory: '전체 종목' },
    ja: { title: `${label} 夜間参考相場`, description: `${examples}など${label}の夜間・週末・休日の参考相場を確認。Hyperliquidの価格と24時間変動を比較できます。`, heading: 'このカテゴリの参考相場', guidance: '原資産を参照するデリバティブ市場です。詳細ページで商品種別、表示単位、参照対象をご確認ください。取引所の公式価格や現物価格と異なる場合があります。', directory: '全銘柄' },
    zh: { title: `${label}夜间参考行情`, description: `查看${examples}等${label}的夜间、周末和节假日参考行情，比较Hyperliquid价格与24小时变化。`, heading: '本分类的参考市场', guidance: '这些衍生品市场参考相关标的资产。请在详情页核对产品类型、报价单位和参考标的；价格可能与交易所官方价格或现货市场不同。', directory: '全部资产' },
    pt: { title: `${label}: preços de referência noturnos`, description: `Explore mercados de referência de ${label}, incluindo ${examples}. Compare preços Hyperliquid e variações de 24 horas à noite, nos fins de semana e feriados.`, heading: 'Sobre estes mercados de referência', guidance: 'São mercados de derivativos que acompanham ativos subjacentes. Consulte o tipo de produto, a unidade da cotação e a referência na página do ativo; o preço pode diferir da bolsa oficial ou do mercado à vista.', directory: 'Todos os mercados' },
    es: { title: `${label}: precios de referencia nocturnos`, description: `Explora mercados de referencia de ${label}, incluidos ${examples}. Compara precios Hyperliquid y variaciones de 24 horas de noche, en fines de semana y festivos.`, heading: 'Sobre estos mercados de referencia', guidance: 'Son mercados de derivados que siguen activos subyacentes. Consulta el tipo de producto, la unidad de cotización y la referencia en la página del activo; el precio puede diferir de la bolsa oficial o del mercado al contado.', directory: 'Todos los mercados' },
  }[language];
}
export async function generateStaticParams() {
  return SEO_LOCALES.flatMap(locale => validCategories.map(category => ({ locale, category: category.toLowerCase() })));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category: slug } = await params;
  const category = getCategoryFromSlug(slug);
  if (!category || !categoryStocks(category).length) notFound();
  const copy = categoryCopy(category, locale);
  return pageMetadata(locale, `/category/${category.toLowerCase()}`, copy.title, copy.description);
}
export default async function Page({ params }: Props) {
  const { locale, category: slug } = await params;
  setRequestLocale(locale);
  const category = getCategoryFromSlug(slug);
  if (!category) notFound();
  const stocks = categoryStocks(category);
  if (!stocks.length) notFound();
  const copy = categoryCopy(category, locale);
  const prefix = locale === 'en' ? '' : `/${locale}`;
  return <>
    <CategoryPage category={category} />
    <section className="container py-6 space-y-3">
      <h2 className="text-lg font-semibold">{copy.heading}</h2>
      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{copy.guidance}</p>
      <h2 className="text-lg font-semibold pt-3">{copy.directory}</h2>
      <ul className="flex flex-wrap gap-3">{stocks.map(stock => <li key={stock.symbol}><a className="text-sm underline" href={`${prefix}/stock/${stock.slug}`}>{name(stock, locale)} ({stock.symbol})</a></li>)}</ul>
    </section>
  </>;
}
