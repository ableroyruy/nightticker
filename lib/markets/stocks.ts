import { Stock } from '../providers/types';

export const stocks: Stock[] = [
  // US Stocks
  {
    symbol: 'AAPL',
    name: 'Apple',
    nameKo: '애플',
    category: 'US',
    hyperliquidSymbol: 'AAPL',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla',
    nameKo: '테슬라',
    category: 'US',
    hyperliquidSymbol: 'TSLA',
  },
  {
    symbol: 'NVDA',
    name: 'Nvidia',
    nameKo: '엔비디아',
    category: 'US',
    hyperliquidSymbol: 'NVDA',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft',
    nameKo: '마이크로소프트',
    category: 'US',
    hyperliquidSymbol: 'MSFT',
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet (Google)',
    nameKo: '알파벳 (구글)',
    category: 'US',
    hyperliquidSymbol: 'GOOGL',
  },
  {
    symbol: 'AMZN',
    name: 'Amazon',
    nameKo: '아마존',
    category: 'US',
    hyperliquidSymbol: 'AMZN',
  },
  {
    symbol: 'META',
    name: 'Meta',
    nameKo: '메타',
    category: 'US',
    hyperliquidSymbol: 'META',
  },
  {
    symbol: 'AMD',
    name: 'AMD',
    nameKo: 'AMD',
    category: 'US',
    hyperliquidSymbol: 'AMD',
  },
  {
    symbol: 'PLTR',
    name: 'Palantir',
    nameKo: '팔란티어',
    category: 'US',
    hyperliquidSymbol: 'PLTR',
  },
  {
    symbol: 'MSTR',
    name: 'MicroStrategy',
    nameKo: '마이크로스트래티지',
    category: 'US',
    hyperliquidSymbol: 'MSTR',
  },
  // Korean Stocks
  {
    symbol: 'SMSN',
    name: 'Samsung Electronics',
    nameKo: '삼성전자',
    category: 'KR',
    hyperliquidSymbol: 'SMSN',
  },
  {
    symbol: 'SKHX',
    name: 'SK Hynix',
    nameKo: 'SK하이닉스',
    category: 'KR',
    hyperliquidSymbol: 'SKHX',
  },
  {
    symbol: 'HYUNDAI',
    name: 'Hyundai Motor',
    nameKo: '현대자동차',
    category: 'KR',
    hyperliquidSymbol: 'HYUNDAI',
  },
  // Index Markets
  {
    symbol: 'SP500',
    name: 'S&P 500',
    nameKo: 'S&P 500',
    category: 'INDEX',
    hyperliquidSymbol: 'SP500',
  },
  {
    symbol: 'XYZ100',
    name: 'Nasdaq 100',
    nameKo: '나스닥 100',
    category: 'INDEX',
    hyperliquidSymbol: 'XYZ100',
  },
];

export function getStockBySymbol(symbol: string): Stock | undefined {
  return stocks.find(
    (s) => s.symbol.toLowerCase() === symbol.toLowerCase()
  );
}

export function getStocksByCategory(category: 'US' | 'KR' | 'INDEX'): Stock[] {
  return stocks.filter((s) => s.category === category);
}

export function getAllSymbols(): string[] {
  return stocks.map((s) => s.symbol.toLowerCase());
}

export function getPopularStocks(): Stock[] {
  // Return first 6 stocks as popular
  return stocks.slice(0, 6);
}
