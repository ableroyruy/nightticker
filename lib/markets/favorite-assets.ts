import type { FavoriteAsset } from '../types/market';
import type { Stock } from '../providers/types';

/** Resolve persisted favorites to current metadata, including old sector-view keys. */
export function normalizeFavoriteAssets(value: unknown, catalog: readonly Stock[], now = Date.now()): FavoriteAsset[] {
  if (!Array.isArray(value)) return [];
  const stocks = new Map(catalog.map(stock => [stock.symbol, stock]));
  const seen = new Set<string>();
  return value.flatMap(item => {
    if (!item || typeof item !== 'object') return [];
    const symbol = typeof item.symbol === 'string' ? item.symbol.toUpperCase() : '';
    const stock = stocks.get(symbol);
    if (!stock || seen.has(symbol)) return [];
    seen.add(symbol);
    return [{ symbol, market: stock.category, name: stock.name, nameKo: stock.nameKo, nameJa: stock.nameJa, nameZh: stock.nameZh, namePt: stock.namePt, nameEs: stock.nameEs, slug: stock.slug, addedAt: Number.isFinite(item.addedAt) ? item.addedAt : now }];
  });
}
