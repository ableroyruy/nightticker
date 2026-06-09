export type MarketType = 'US' | 'KR' | 'JP' | 'INDEX' | 'ETF' | 'COMMODITY' | 'FX' | 'SPECIAL' | 'SEMICONDUCTOR';

export interface MarketAsset {
  symbol: string;
  name: string;
  nameKo?: string;
  nameJa?: string;
  nameZh?: string;
  namePt?: string;
  nameEs?: string;
  slug: string;
  market: MarketType;
  price: number | null;
  prevDayPx: number | null;
  change24h: number | null;
  changePercent24h: number | null;
  hyperliquidSymbol?: string;
}

export interface FavoriteAsset {
  market: MarketType;
  symbol: string;
  name: string;
  nameKo?: string;
  slug: string;
  addedAt: number;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export interface WebSocketState {
  status: ConnectionStatus;
  lastUpdate: Date | null;
  error: string | null;
}
