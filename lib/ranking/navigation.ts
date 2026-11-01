import type { StockCategory } from '../providers/types';

export const RANKING_CATEGORIES: readonly StockCategory[] = ['US', 'KR', 'JP', 'INDEX', 'ETF', 'COMMODITY', 'FX', 'SPECIAL', 'SEMICONDUCTOR'];
export type RankingScope = StockCategory | 'ALL';
export function parseRankingScope(search: string): RankingScope {
  const value = new URLSearchParams(search).get('category')?.trim().toUpperCase();
  return RANKING_CATEGORIES.find(category => category === value) ?? 'ALL';
}
