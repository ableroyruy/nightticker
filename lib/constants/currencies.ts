export type CurrencyCode = 'USD' | 'KRW' | 'JPY' | 'CNY' | 'EUR' | 'BRL';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  nameKo: string;
  nameJa: string;
  nameZh: string;
  namePt: string;
  nameEs: string;
  flag: string;
  decimals: number;
  locale: string; // Primary locale for this currency
}

export const currencies: Record<CurrencyCode, CurrencyInfo> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    nameKo: '미국 달러',
    nameJa: '米ドル',
    nameZh: '美元',
    namePt: 'Dólar Americano',
    nameEs: 'Dólar Estadounidense',
    flag: '🇺🇸',
    decimals: 2,
    locale: 'en',
  },
  KRW: {
    code: 'KRW',
    symbol: '₩',
    name: 'Korean Won',
    nameKo: '한국 원',
    nameJa: '韓国ウォン',
    nameZh: '韩元',
    namePt: 'Won Coreano',
    nameEs: 'Won Coreano',
    flag: '🇰🇷',
    decimals: 0,
    locale: 'ko',
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    nameKo: '일본 엔',
    nameJa: '日本円',
    nameZh: '日元',
    namePt: 'Iene Japonês',
    nameEs: 'Yen Japonés',
    flag: '🇯🇵',
    decimals: 0,
    locale: 'ja',
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    nameKo: '중국 위안',
    nameJa: '中国元',
    nameZh: '人民币',
    namePt: 'Yuan Chinês',
    nameEs: 'Yuan Chino',
    flag: '🇨🇳',
    decimals: 2,
    locale: 'zh',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    nameKo: '유로',
    nameJa: 'ユーロ',
    nameZh: '欧元',
    namePt: 'Euro',
    nameEs: 'Euro',
    flag: '🇪🇺',
    decimals: 2,
    locale: 'es',
  },
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    name: 'Brazilian Real',
    nameKo: '브라질 헤알',
    nameJa: 'ブラジルレアル',
    nameZh: '巴西雷亚尔',
    namePt: 'Real Brasileiro',
    nameEs: 'Real Brasileño',
    flag: '🇧🇷',
    decimals: 2,
    locale: 'pt',
  },
};

export const currencyList: CurrencyCode[] = ['USD', 'KRW', 'JPY', 'CNY', 'EUR', 'BRL'];

// Map locale to default currency
export const localeToCurrency: Record<string, CurrencyCode> = {
  en: 'USD',
  ko: 'KRW',
  ja: 'JPY',
  zh: 'CNY',
  pt: 'BRL',
  es: 'EUR',
};

// Get currency name by locale
export function getCurrencyName(code: CurrencyCode, locale: string): string {
  const currency = currencies[code];
  switch (locale) {
    case 'ko':
      return currency.nameKo;
    case 'ja':
      return currency.nameJa;
    case 'zh':
      return currency.nameZh;
    case 'pt':
      return currency.namePt;
    case 'es':
      return currency.nameEs;
    default:
      return currency.name;
  }
}

// Format price with currency
export function formatCurrency(
  amount: number | null,
  currencyCode: CurrencyCode,
  options?: { compact?: boolean }
): string {
  if (amount === null || amount === undefined) return '-';

  const currency = currencies[currencyCode];
  const { decimals, symbol } = currency;

  if (options?.compact && Math.abs(amount) >= 1000000) {
    const millions = amount / 1000000;
    return `${symbol}${millions.toFixed(1)}M`;
  }

  if (options?.compact && Math.abs(amount) >= 1000) {
    const thousands = amount / 1000;
    return `${symbol}${thousands.toFixed(1)}K`;
  }

  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${symbol}${formatted}`;
}
