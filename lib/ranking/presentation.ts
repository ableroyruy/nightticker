import type { RankingItem } from './core';

/** A default/recommended item is never a measured popularity rank. */
export function measuredRankings(items: readonly RankingItem[], limit?: number): RankingItem[] {
  const measured = items.filter(item => Number.isSafeInteger(item.views) && item.views > 0 && Number.isSafeInteger(item.rank) && item.rank > 0);
  return limit === undefined ? measured : measured.slice(0, Math.max(0, Math.floor(limit)));
}

const movementLabels = {
  en: { unknown: 'No prior rank', unchanged: 'Unchanged' },
  ko: { unknown: '비교 없음', unchanged: '변동 없음' },
  ja: { unknown: '比較なし', unchanged: '変動なし' },
  zh: { unknown: '暂无对比', unchanged: '排名不变' },
  pt: { unknown: 'Sem comparação', unchanged: 'Sem alteração' },
  es: { unknown: 'Sin comparación', unchanged: 'Sin cambios' },
};
export function rankingMovement(change: number | null, locale: string): { text: string; direction: -1 | 0 | 1 | null } {
  const labels = movementLabels[locale as keyof typeof movementLabels] ?? movementLabels.en;
  if (change == null || !Number.isSafeInteger(change)) return { text: labels.unknown, direction: null };
  if (change === 0) return { text: labels.unchanged, direction: 0 };
  return { text: String(Math.abs(change)), direction: change > 0 ? 1 : -1 };
}

/** Include the calendar date: a stale quote from yesterday must not look current. */
export function formatRankingUpdatedAt(timestamp: number, locale: string): string {
  const date = new Date(timestamp);
  if (!Number.isFinite(timestamp) || !Number.isFinite(date.getTime()) || timestamp <= 0) return '—';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
