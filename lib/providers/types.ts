export interface MarketPrice {
  symbol: string;
  price: number | null;
  lastUpdated: Date;
}

export interface MarketDataProvider {
  getPrice(symbol: string): Promise<MarketPrice | null>;
  getAllPrices(): Promise<Record<string, MarketPrice>>;
  isAvailable(): Promise<boolean>;
}

export interface Stock {
  symbol: string;
  name: string;
  nameKo: string;
  category: 'US' | 'KR' | 'INDEX';
  hyperliquidSymbol: string;
}
