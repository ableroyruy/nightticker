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

export type StockCategory = 'US' | 'KR' | 'JP' | 'INDEX' | 'ETF' | 'COMMODITY' | 'FX' | 'SPECIAL' | 'SEMICONDUCTOR';

export type StockSector =
  | 'BigTech'
  | 'Semiconductors'
  | 'EV'
  | 'Fintech'
  | 'AI'
  | 'Retail'
  | 'Healthcare'
  | 'Space'
  | 'Entertainment'
  | 'Energy'
  | 'Metals'
  | 'Agriculture'
  | 'Currency'
  | 'Other';

export interface Stock {
  symbol: string;
  name: string;
  nameKo: string;
  nameJa?: string;
  nameZh?: string;
  slug: string;
  category: StockCategory;
  sector?: StockSector;
  hyperliquidSymbol: string;
}
