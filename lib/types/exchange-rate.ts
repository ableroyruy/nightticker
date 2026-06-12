import { CurrencyCode } from '@/lib/constants/currencies';

export interface ExchangeRate {
  currency: CurrencyCode;
  rate: number; // 1 USD = X currency
  previousRate: number | null; // 24h ago rate
  change: number | null; // rate - previousRate
  changePercent: number | null; // change percentage
}

export interface ExchangeRateResponse {
  base: 'USD';
  rates: ExchangeRate[];
  updatedAt: string;
  nextUpdate: string;
}
