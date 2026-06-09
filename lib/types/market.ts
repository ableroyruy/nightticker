export type MarketType = 'KR' | 'US' | 'CRYPTO';

export interface MarketAsset {
  symbol: string;
  name: string;
  nameKo?: string;
  market: MarketType;
  price: number | null;
  previousPrice?: number | null;
  change24h?: number | null;
  changePercent24h?: number | null;
  volume24h?: number | null;
  lastUpdated?: Date;
  hyperliquidSymbol?: string;
}

export interface FavoriteAsset {
  market: MarketType;
  symbol: string;
  name: string;
  nameKo?: string;
  addedAt: number;
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  previousPrice?: number;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export interface WebSocketState {
  status: ConnectionStatus;
  lastUpdate: Date | null;
  error: string | null;
}
