import type { MarketAsset } from './types/market';
import type { Stock } from './providers/types';

const numberFormats = new Map<number, Intl.NumberFormat>();
function formatNumber(value: number, digits: number): string {
  let formatter = numberFormats.get(digits);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: digits });
    numberFormats.set(digits, formatter);
  }
  return formatter.format(value);
}

/** Keep small and FX quotes useful without adding artificial trailing zeroes. */
function precision(value: number): number {
  const amount = Math.abs(value);
  return amount < 1 ? 8 : amount < 100 ? 5 : 4;
}
function rounded(value: number, type: 'amount' | 'percent'): number {
  return Number(value.toFixed(type === 'percent' ? 2 : precision(value)));
}
export function marketDirection(value: number | null | undefined, type: 'amount' | 'percent' = 'percent'): -1 | 0 | 1 | null {
  if (value == null || !Number.isFinite(value)) return null;
  const visible = rounded(value, type);
  return visible > 0 ? 1 : visible < 0 ? -1 : 0;
}
export function formatMarketPrice(value: number | null | undefined, showCurrency = true): string {
  if (value == null || !Number.isFinite(value)) return '—';
  const amount = rounded(value, 'amount');
  const formatted = formatNumber(Math.abs(amount), precision(value));
  return `${amount < 0 ? '-' : ''}${showCurrency ? '$' : ''}${formatted}`;
}
export function formatMarketChange(value: number | null | undefined, type: 'amount' | 'percent' = 'percent', showCurrency = true): string {
  const direction = marketDirection(value, type);
  if (direction === null || value == null) return '—';
  const sign = direction > 0 ? '+' : direction < 0 ? '-' : '';
  return type === 'percent'
    ? `${sign}${Math.abs(rounded(value, type)).toFixed(2)}%`
    : `${sign}${formatMarketPrice(Math.abs(value), showCurrency)}`;
}
interface LocalizedName { name: string; nameKo?: string; nameJa?: string; nameZh?: string; namePt?: string; nameEs?: string }
export function getLocalizedAssetName(asset: LocalizedName, locale: string): string {
  const names: Record<string, string | undefined> = { ko: asset.nameKo, ja: asset.nameJa, zh: asset.nameZh, pt: asset.namePt, es: asset.nameEs };
  return names[locale] || asset.name;
}
interface Quote { price: number; prevDayPx: number | null; change24h: number | null; changePercent24h: number | null }
/** One mapper prevents list pages from dropping translated names. */
export function toMarketAsset(stock: Stock, quote?: Quote): MarketAsset {
  return {
    symbol: stock.symbol, name: stock.name, nameKo: stock.nameKo,
    nameJa: stock.nameJa, nameZh: stock.nameZh, namePt: stock.namePt, nameEs: stock.nameEs,
    slug: stock.slug, market: stock.category, hyperliquidSymbol: stock.hyperliquidSymbol,
    price: quote?.price ?? null, prevDayPx: quote?.prevDayPx ?? null,
    change24h: quote?.change24h ?? null, changePercent24h: quote?.changePercent24h ?? null,
  };
}
