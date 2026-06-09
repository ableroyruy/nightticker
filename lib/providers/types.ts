export interface MarketPrice {
  symbol: string;
  price: number | null;
  prevDayPx: number | null;
  change24h: number | null;
  changePercent24h: number | null;
  lastUpdated: Date;
}

export interface MarketDataProvider {
  getPrice(symbol: string): Promise<MarketPrice | null>;
  getAllPrices(): Promise<Record<string, MarketPrice>>;
  isAvailable(): Promise<boolean>;
}

export type StockCategory = 'US' | 'KR' | 'JP' | 'INDEX' | 'ETF' | 'COMMODITY' | 'FX' | 'SPECIAL';

export interface Stock {
  symbol: string;
  name: string;
  nameKo: string;
  nameJa?: string;
  slug: string;
  category: StockCategory;
  hyperliquidSymbol: string;
}
