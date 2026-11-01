import factsData from './product-facts.json';
import topicsData from './product-topics.json';
import type { Stock } from '../providers/types';

export type ProductLocale = 'en' | 'ko' | 'ja' | 'zh' | 'pt' | 'es';
export type ProductKind = 'equity' | 'ads' | 'registry-share' | 'preferred' | 'etf' | 'leveraged-etf' | 'index' | 'commodity' | 'fx' | 'pre-ipo' | 'investment-company';
export interface ProductFacts {
  country: string;
  kind: ProductKind;
  exchange: string;
  unit: string;
  description: string;
  topic: string;
  source: string;
  adsRatio?: number;
  dailyLeverage?: number;
  convertedFrom?: string;
  nativeIndexCurrency?: string;
}
const facts = factsData as Record<string, ProductFacts>;
const topics = topicsData as Record<string, Record<ProductLocale, string>>;
const languages: ProductLocale[] = ['en', 'ko', 'ja', 'zh', 'pt', 'es'];
const local = (items: string[], locale: ProductLocale) => items[languages.indexOf(locale)];
const kinds: Record<ProductKind, string[]> = {
  equity: ['Equity reference', '주식 참고시장', '株式参考市場', '股票参考市场', 'Referência de ações', 'Referencia de acciones'],
  ads: ['Depositary share (ADS)', '미국 예탁주식 (ADS)', '米国預託株式（ADS）', '美国存托股（ADS）', 'Ação depositária (ADS)', 'Acción depositaria (ADS)'],
  'registry-share': ['New York Registry Share', '뉴욕 등록주식', 'ニューヨーク登録株式', '纽约登记股份', 'Ação registada em Nova Iorque', 'Acción registrada en Nueva York'],
  preferred: ['Preferred stock', '우선주', '優先株', '优先股', 'Ação preferencial', 'Acción preferente'],
  etf: ['ETF reference', 'ETF 참고시장', 'ETF参考市場', 'ETF参考市场', 'Referência de ETF', 'Referencia de ETF'],
  'leveraged-etf': ['Daily leveraged ETF', '일일 레버리지 ETF', '日次レバレッジETF', '每日杠杆ETF', 'ETF de alavancagem diária', 'ETF de apalancamiento diario'],
  index: ['Equity index', '주가지수', '株価指数', '股票指数', 'Índice de ações', 'Índice bursátil'],
  commodity: ['Commodity reference', '원자재 참고시장', '商品参考市場', '大宗商品参考市场', 'Referência de matéria-prima', 'Referencia de materia prima'],
  fx: ['Spot FX reference', '현물환 참고시장', '直物為替参考市場', '即期外汇参考市场', 'Referência cambial à vista', 'Referencia cambiaria al contado'],
  'pre-ipo': ['Pre-IPO reference', '상장 전 참고시장', '上場前参考市場', '上市前参考市场', 'Referência pré-IPO', 'Referencia pre-IPO'],
  'investment-company': ['Closed-end investment company', '폐쇄형 투자회사', 'クローズドエンド投資会社', '封闭式投资公司', 'Sociedade de investimento fechada', 'Sociedad de inversión cerrada'],
};
const countries: Record<string, string[]> = {
  US: ['United States', '미국', '米国', '美国', 'Estados Unidos', 'Estados Unidos'],
  KR: ['South Korea', '대한민국', '韓国', '韩国', 'Coreia do Sul', 'Corea del Sur'],
  JP: ['Japan', '일본', '日本', '日本', 'Japão', 'Japón'],
  CN: ['China', '중국', '中国', '中国', 'China', 'China'],
  HK: ['China · Hong Kong market', '중국 · 홍콩 시장', '中国・香港市場', '中国·香港市场', 'China · mercado de Hong Kong', 'China · mercado de Hong Kong'],
  IN: ['India', '인도', 'インド', '印度', 'Índia', 'India'],
  TW: ['Taiwan', '대만', '台湾', '台湾', 'Taiwan', 'Taiwán'],
  GB: ['United Kingdom', '영국', '英国', '英国', 'Reino Unido', 'Reino Unido'],
  NL: ['Netherlands', '네덜란드', 'オランダ', '荷兰', 'Países Baixos', 'Países Bajos'],
  FI: ['Finland', '핀란드', 'フィンランド', '芬兰', 'Finlândia', 'Finlandia'],
  BR: ['Brazil', '브라질', 'ブラジル', '巴西', 'Brasil', 'Brasil'],
  CA: ['Canada', '캐나다', 'カナダ', '加拿大', 'Canadá', 'Canadá'],
  AU: ['Australia', '호주', 'オーストラリア', '澳大利亚', 'Austrália', 'Australia'],
  EU: ['Euro area', '유로존', 'ユーロ圏', '欧元区', 'Área do euro', 'Zona del euro'],
  GLOBAL: ['Global', '글로벌', 'グローバル', '全球', 'Global', 'Global'],
};
const units: Record<string, string[]> = {
  share: ['USD per reference share', '기준 주식 1주당 USD', '基準株式1株当たりUSD', '每份参考股份的美元价格', 'USD por ação de referência', 'USD por acción de referencia'],
  'troy-ounce': ['USD per troy ounce', '트로이온스당 USD', 'トロイオンス当たりUSD', '美元/金衡盎司', 'USD por onça troy', 'USD por onza troy'],
  pound: ['USD per pound', '파운드당 USD', 'ポンド当たりUSD', '美元/磅', 'USD por libra', 'USD por libra'],
  barrel: ['USD per barrel', '배럴당 USD', 'バレル当たりUSD', '美元/桶', 'USD por barril', 'USD por barril'],
  mmbtu: ['USD per MMBtu', 'MMBtu당 USD', 'MMBtu当たりUSD', '美元/MMBtu', 'USD por MMBtu', 'USD por MMBtu'],
  gallon: ['USD per US gallon', '미국 갤런당 USD', '米ガロン当たりUSD', '美元/美制加仑', 'USD por galão dos EUA', 'USD por galón estadounidense'],
  'jpy-per-usd': ['JPY per 1 USD', '1 USD당 JPY', '1 USD当たりJPY', '每1美元对应的日元', 'JPY por 1 USD', 'JPY por 1 USD'],
  'usd-per-eur': ['USD per 1 EUR', '1 EUR당 USD', '1 EUR当たりUSD', '每1欧元对应的美元', 'USD por 1 EUR', 'USD por 1 EUR'],
  'usd-per-gbp': ['USD per 1 GBP', '1 GBP당 USD', '1 GBP当たりUSD', '每1英镑对应的美元', 'USD por 1 GBP', 'USD por 1 GBP'],
  'index-points': ['Index points', '지수 포인트', '指数ポイント', '指数点', 'Pontos do índice', 'Puntos del índice'],
};
export const productLabels = {
  en: { heading: 'About this market', country: 'Underlying region', type: 'Product type', underlying: 'Underlying', exchange: 'Underlying listing', unit: 'Price unit', source: 'Supplier specification', original: 'Full supplier description (English)', note: 'Prices reference Hyperliquid derivatives. They do not convey ownership of the underlying asset.' },
  ko: { heading: '종목·상품 정보', country: '기초자산 지역', type: '상품 유형', underlying: '기초자산', exchange: '기초자산 상장시장', unit: '가격 단위', source: '공급자 상품 명세', original: '공급자 전체 설명 (영문)', note: 'Hyperliquid 파생상품의 참고가격이며, 기초자산 소유권을 의미하지 않습니다.' },
  ja: { heading: '銘柄・商品情報', country: '原資産の地域', type: '商品区分', underlying: '原資産', exchange: '原資産の上場市場', unit: '価格単位', source: '提供元の商品仕様', original: '提供元の説明全文（英語）', note: 'Hyperliquidデリバティブの参考価格であり、原資産の所有権を示すものではありません。' },
  zh: { heading: '标的与产品信息', country: '标的资产地区', type: '产品类型', underlying: '标的资产', exchange: '标的上市市场', unit: '价格单位', source: '提供方产品规格', original: '提供方完整说明（英文）', note: '此为Hyperliquid衍生品参考价格，不代表标的资产的所有权。' },
  pt: { heading: 'Informações do ativo e produto', country: 'Região do subjacente', type: 'Tipo de produto', underlying: 'Ativo subjacente', exchange: 'Cotação do subjacente', unit: 'Unidade do preço', source: 'Especificação do fornecedor', original: 'Descrição completa do fornecedor (inglês)', note: 'Preços de referência de derivativos Hyperliquid. Não conferem propriedade do ativo subjacente.' },
  es: { heading: 'Información del activo y producto', country: 'Región del subyacente', type: 'Tipo de producto', underlying: 'Activo subyacente', exchange: 'Cotización del subyacente', unit: 'Unidad del precio', source: 'Especificación del proveedor', original: 'Descripción completa del proveedor (inglés)', note: 'Precios de referencia de derivados Hyperliquid. No otorgan propiedad del activo subyacente.' },
};
export function productLocale(locale: string): ProductLocale {
  return languages.includes(locale as ProductLocale) ? locale as ProductLocale : 'en';
}
export function getProductFacts(symbol: string): ProductFacts {
  const value = facts[symbol];
  if (!value) throw new Error(`Missing reviewed product information: ${symbol}`);
  return value;
}
export function getLocalizedStockName(stock: Stock, locale: string): string {
  switch (productLocale(locale)) {
    case 'ko': return stock.nameKo;
    case 'ja': return stock.nameJa || stock.name;
    case 'zh': return stock.nameZh || stock.name;
    case 'pt': return stock.namePt || stock.name;
    case 'es': return stock.nameEs || stock.name;
    default: return stock.name;
  }
}
export function getProductInfo(stock: Stock, requestedLocale: string) {
  const locale = productLocale(requestedLocale);
  const fact = getProductFacts(stock.symbol);
  const name = getLocalizedStockName(stock, locale);
  const country = local(countries[fact.country], locale);
  const productType = local(kinds[fact.kind], locale);
  const topic = topics[fact.topic][locale];
  const quoteUnit = local(units[fact.unit], locale) + (fact.nativeIndexCurrency ? ` (${fact.nativeIndexCurrency})` : '');
  const exchange = fact.exchange || local(fact.kind === 'pre-ipo'
    ? ['Not yet listed (pre-IPO)', '상장 전', '上場前', '尚未上市', 'Ainda não cotado (pré-IPO)', 'Aún no cotizado (pre-IPO)']
    : ['Provider reference market', '공급자 기준시장', '提供元の基準市場', '提供方参考市场', 'Mercado de referência do fornecedor', 'Mercado de referencia del proveedor'], locale);
  const overview = local([
    `${name} (${stock.symbol}) is a ${productType.toLowerCase()} linked to ${topic}. Its reference price is expressed as ${quoteUnit.toLowerCase()}.`,
    `${name}(${stock.symbol})의 기초자산 지역은 ${country}이며, 상품 유형은 ${productType}입니다. ${topic} 관련 가격 흐름을 참고할 수 있으며, 표시 단위는 ${quoteUnit}입니다.`,
    `${name}（${stock.symbol}）の原資産地域は${country}、商品区分は${productType}です。${topic}に関連する価格動向を参照でき、表示単位は${quoteUnit}です。`,
    `${name}（${stock.symbol}）的标的资产地区为${country}，产品类型为${productType}。可参考${topic}相关价格走势，报价单位为${quoteUnit}。`,
    `${name} (${stock.symbol}) é uma referência da região ${country}, do tipo ${productType}. Permite acompanhar preços relacionados com ${topic}, expressos em ${quoteUnit}.`,
    `${name} (${stock.symbol}) es una referencia de la región ${country}, del tipo ${productType}. Permite seguir precios relacionados con ${topic}, expresados en ${quoteUnit}.`,
  ], locale);
  const notes: string[] = [];
  if (stock.symbol === 'STRC') notes.push(local([
    'The underlying preferred stock has a $100 stated amount and cumulative monthly cash dividends at a variable rate. A derivatives position does not confer ownership of this preferred stock.',
    '기초 우선주는 명시금액 $100을 기준으로 변동금리 누적 월 현금배당을 지급하는 구조입니다. 파생상품 포지션은 이 우선주의 소유권을 부여하지 않습니다.',
    '原資産の優先株は額面基準額100ドルで、変動利率の累積月次現金配当を支払う仕組みです。デリバティブの保有は優先株の所有権を付与しません。',
    '标的优先股的规定金额为100美元，采用浮动利率累积月度现金股息结构。衍生品仓位不赋予该优先股的所有权。',
    'A ação preferencial subjacente tem montante declarado de US$100 e dividendos mensais cumulativos em dinheiro a taxa variável. O derivativo não confere propriedade dessa ação.',
    'La acción preferente subyacente tiene un importe declarado de US$100 y dividendos mensuales acumulativos en efectivo a tipo variable. El derivado no otorga propiedad de esa acción.',
  ], locale));
  if (fact.adsRatio) notes.push(local([
    `1 ADS represents ${fact.adsRatio} underlying ordinary share${fact.adsRatio === 1 ? '' : 's'}.`,
    `ADS 1주는 기초 보통주 ${fact.adsRatio}주를 나타냅니다.`,
    `ADS 1株は原資産の普通株${fact.adsRatio}株を表します。`,
    `1份ADS代表${fact.adsRatio}股标的普通股。`,
    `1 ADS representa ${fact.adsRatio} ação(ões) ordinária(s) subjacente(s).`,
    `1 ADS representa ${fact.adsRatio} acción(es) ordinaria(s) subyacente(s).`,
  ], locale));
  if (fact.kind === 'registry-share') notes.push(local([
    'Each New York Registry Share represents one ordinary share.', '뉴욕 등록주식 1주는 보통주 1주를 나타냅니다.', 'ニューヨーク登録株式1株は普通株1株を表します。', '每份纽约登记股份代表1股普通股。', 'Cada ação registada em Nova Iorque representa uma ação ordinária.', 'Cada acción registrada en Nueva York representa una acción ordinaria.',
  ], locale));
  if (fact.convertedFrom) notes.push(local([
    `The oracle converts the underlying ${fact.convertedFrom} share price into USD. FX movements can affect the displayed price.`,
    `오라클은 기초주식의 ${fact.convertedFrom} 가격을 USD로 환산합니다. 환율 변동도 표시가격에 반영될 수 있습니다.`,
    `オラクルは原資産株式の${fact.convertedFrom}価格をUSDに換算します。為替変動も表示価格に影響します。`,
    `预言机将标的股票的${fact.convertedFrom}价格换算为美元，汇率变化也可能影响显示价格。`,
    `O oráculo converte a cotação do subjacente em ${fact.convertedFrom} para USD. As variações cambiais podem afetar o preço apresentado.`,
    `El oráculo convierte la cotización subyacente en ${fact.convertedFrom} a USD. Las variaciones cambiarias pueden afectar al precio mostrado.`,
  ], locale));
  if (fact.nativeIndexCurrency) notes.push(local([
    'The native index level is not FX-converted; index-point profit and loss is cash-settled in USDC.', '원화·엔화·루피화 기준의 해당 지수 수치를 환산 없이 표시하며, 지수 포인트 손익은 USDC로 현금 결제됩니다.', '現地通貨基準の指数値は為替換算せず、指数ポイントの損益はUSDCで現金決済されます。', '显示当地货币基准的指数水平，不进行外汇换算；指数点盈亏以USDC现金结算。', 'O nível nativo do índice não é convertido por câmbio; os ganhos e perdas em pontos são liquidados em USDC.', 'El nivel nativo del índice no se convierte por divisas; las ganancias y pérdidas en puntos se liquidan en USDC.',
  ], locale));
  if (fact.dailyLeverage) notes.push(local([
    `The underlying fund targets ${fact.dailyLeverage}× daily returns before costs. Daily resetting and compounding mean longer-term performance can differ from ${fact.dailyLeverage}× the benchmark. This is fund leverage, not the derivative market's leverage limit.`,
    `기초 펀드는 비용 차감 전 일일 수익률 ${fact.dailyLeverage}배를 목표로 합니다. 매일 재설정·복리 효과로 장기 수익률은 기준 수익률의 ${fact.dailyLeverage}배와 달라질 수 있습니다. 이는 펀드 배율이며 파생상품 시장의 레버리지 한도가 아닙니다.`,
    `原資産ファンドは費用控除前の日次リターン${fact.dailyLeverage}倍を目標とします。日次リセットと複利により長期成績は基準の${fact.dailyLeverage}倍と異なり得ます。ファンド倍率であり、デリバティブ市場のレバレッジ上限ではありません。`,
    `标的基金以费用前每日收益${fact.dailyLeverage}倍为目标。每日重置和复利可能使长期表现偏离基准的${fact.dailyLeverage}倍。这是基金杠杆倍数，并非衍生品市场杠杆上限。`,
    `O fundo visa ${fact.dailyLeverage}× o retorno diário antes de custos. O reajuste diário e a composição podem afastar o retorno de longo prazo de ${fact.dailyLeverage}× o índice. É alavancagem do fundo, não o limite do derivativo.`,
    `El fondo busca ${fact.dailyLeverage}× el rendimiento diario antes de costes. El reajuste diario y la capitalización pueden alejar el rendimiento a largo plazo de ${fact.dailyLeverage}× el índice. Es apalancamiento del fondo, no el límite del derivado.`,
  ], locale));
  if (fact.kind === 'pre-ipo') notes.push(local([
    'This pre-IPO market reflects an anticipated share price before listing. Listing dates, the ticker and conversion to a standard perpetual remain subject to the supplier terms.',
    '상장 전 예상 주가를 반영하는 시장입니다. 상장일·예정 티커·일반 무기한 선물 전환은 공급자 조건에 따르며 확정 상장을 의미하지 않습니다.',
    '上場前の想定株価を反映する市場です。上場日・予定ティッカー・通常の無期限先物への転換は提供元の条件に従い、上場の確約ではありません。',
    '该上市前市场反映预期股价。上市日期、拟定代码和转换为常规永续合约均以提供方条款为准，不代表上市已获保证。',
    'Este mercado pré-IPO reflete um preço antecipado antes da cotação. Datas, símbolo previsto e conversão para um perpétuo padrão estão sujeitos aos termos do fornecedor.',
    'Este mercado pre-IPO refleja un precio previsto antes de cotizar. Fechas, símbolo previsto y conversión a un perpetuo estándar están sujetos a los términos del proveedor.',
  ], locale));
  return {
    locale, name, heading: `${name} · ${productLabels[locale].heading}`,
    overview, country, productType, underlying: `${name} (${stock.symbol})`, exchange, quoteUnit, notes,
    sourceDescription: stock.description || fact.description,
    sourceUrl: `https://docs.trade.xyz/perpetuals/specifications-and-schedules/${fact.source === 'pre-ipo' ? 'pre-ipo-specification-index' : 'specification-index'}`,
    kind: fact.kind, countryCode: fact.country,
  };
}
