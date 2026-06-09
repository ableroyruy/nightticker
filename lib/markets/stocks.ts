import { Stock } from '../providers/types';

export const stocks: Stock[] = [
  // US Stocks
  {
    symbol: 'AAPL',
    name: 'Apple',
    nameKo: '애플',
    slug: 'apple',
    category: 'US',
    hyperliquidSymbol: 'xyz:AAPL',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla',
    nameKo: '테슬라',
    slug: 'tesla',
    category: 'US',
    hyperliquidSymbol: 'xyz:TSLA',
  },
  {
    symbol: 'NVDA',
    name: 'Nvidia',
    nameKo: '엔비디아',
    slug: 'nvidia',
    category: 'US',
    hyperliquidSymbol: 'xyz:NVDA',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft',
    nameKo: '마이크로소프트',
    slug: 'microsoft',
    category: 'US',
    hyperliquidSymbol: 'xyz:MSFT',
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet (Google)',
    nameKo: '알파벳 (구글)',
    slug: 'google',
    category: 'US',
    hyperliquidSymbol: 'xyz:GOOGL',
  },
  {
    symbol: 'AMZN',
    name: 'Amazon',
    nameKo: '아마존',
    slug: 'amazon',
    category: 'US',
    hyperliquidSymbol: 'xyz:AMZN',
  },
  {
    symbol: 'META',
    name: 'Meta',
    nameKo: '메타',
    slug: 'meta',
    category: 'US',
    hyperliquidSymbol: 'xyz:META',
  },
  {
    symbol: 'AMD',
    name: 'AMD',
    nameKo: 'AMD',
    slug: 'amd',
    category: 'US',
    hyperliquidSymbol: 'xyz:AMD',
  },
  {
    symbol: 'PLTR',
    name: 'Palantir',
    nameKo: '팔란티어',
    slug: 'palantir',
    category: 'US',
    hyperliquidSymbol: 'xyz:PLTR',
  },
  {
    symbol: 'MSTR',
    name: 'MicroStrategy',
    nameKo: '마이크로스트래티지',
    slug: 'microstrategy',
    category: 'US',
    hyperliquidSymbol: 'xyz:MSTR',
  },
  // Korean Stocks
  {
    symbol: 'SMSN',
    name: 'Samsung Electronics',
    nameKo: '삼성전자',
    slug: 'samsung',
    category: 'KR',
    hyperliquidSymbol: 'xyz:SMSN',
  },
  {
    symbol: 'SKHX',
    name: 'SK Hynix',
    nameKo: 'SK하이닉스',
    slug: 'sk-hynix',
    category: 'KR',
    hyperliquidSymbol: 'xyz:SKHX',
  },
  {
    symbol: 'HYUNDAI',
    name: 'Hyundai Motor',
    nameKo: '현대자동차',
    slug: 'hyundai',
    category: 'KR',
    hyperliquidSymbol: 'xyz:HYUNDAI',
  },
  // Index Markets
  {
    symbol: 'SP500',
    name: 'S&P 500',
    nameKo: 'S&P 500',
    slug: 'sp500',
    category: 'INDEX',
    hyperliquidSymbol: 'xyz:SP500',
  },
  {
    symbol: 'XYZ100',
    name: 'Nasdaq 100',
    nameKo: '나스닥 100',
    slug: 'nasdaq-100',
    category: 'INDEX',
    hyperliquidSymbol: 'xyz:XYZ100',
  },
];

export function getStockBySymbol(symbol: string): Stock | undefined {
  return stocks.find(
    (s) => s.symbol.toLowerCase() === symbol.toLowerCase()
  );
}

export function getStockBySlug(slug: string): Stock | undefined {
  return stocks.find((s) => s.slug === slug.toLowerCase());
}

export function getStocksByCategory(category: 'US' | 'KR' | 'INDEX'): Stock[] {
  return stocks.filter((s) => s.category === category);
}

export function getAllSymbols(): string[] {
  return stocks.map((s) => s.symbol.toLowerCase());
}

export function getAllSlugs(): string[] {
  return stocks.map((s) => s.slug);
}

export function getPopularStocks(): Stock[] {
  return stocks.slice(0, 6);
}
