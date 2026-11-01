'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { TrendingUp, Search, Clock, Eye } from 'lucide-react';
import { useSearchRanking } from '@/lib/context/SearchRankingContext';
import { getStockBySymbol } from '@/lib/markets/stocks';
import { useHyperliquidTicker } from '@/lib/hooks/useHyperliquidTicker';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { PriceChange } from '@/components/ui/price-change';
import { formatMarketPrice, getLocalizedAssetName, marketDirection } from '@/lib/format-market';
import { formatRankingUpdatedAt, rankingMovement } from '@/lib/ranking/presentation';
import { parseRankingScope, RANKING_CATEGORIES, type RankingScope } from '@/lib/ranking/navigation';

const copy = {
  en: { overall: 'Overall', category: 'Ranking category', views: 'views', loading: 'Loading rankings…', degraded: 'Ranking updates are delayed. Available results may be out of date.', unavailable: 'Rankings are temporarily unavailable.', empty: 'No recorded views in this category yet.', emptyHint: 'Visit asset pages to help build the rankings.', discover: 'Explore assets', updated: 'Ranking updated', refresh: 'Updated every 30 minutes', rank: 'Rank', movement: 'Rank change', count: 'Ranked assets' },
  ko: { overall: '전체', category: '인기순위 분류', views: '조회', loading: '인기순위를 불러오는 중입니다…', degraded: '인기순위 갱신이 지연되고 있습니다. 표시된 결과는 최신 정보와 다를 수 있습니다.', unavailable: '인기순위를 일시적으로 확인할 수 없습니다.', empty: '아직 이 분류에 집계된 조회수가 없습니다.', emptyHint: '종목 페이지를 확인하면 인기순위 집계에 반영됩니다.', discover: '종목 둘러보기', updated: '순위 갱신', refresh: '30분마다 갱신', rank: '순위', movement: '순위 변동', count: '집계 종목' },
  ja: { overall: '総合', category: 'ランキング分類', views: '閲覧', loading: 'ランキングを読み込み中…', degraded: 'ランキングの更新が遅れています。表示結果は最新ではない場合があります。', unavailable: 'ランキングを一時的に取得できません。', empty: 'この分類にはまだ閲覧記録がありません。', emptyHint: '銘柄ページの閲覧がランキングに反映されます。', discover: '銘柄を探す', updated: 'ランキング更新', refresh: '30分ごとに更新', rank: '順位', movement: '順位変動', count: '集計銘柄' },
  zh: { overall: '综合', category: '排名分类', views: '次浏览', loading: '正在加载排名…', degraded: '排名更新暂时延迟，显示结果可能不是最新数据。', unavailable: '暂时无法获取排名。', empty: '此分类暂无浏览记录。', emptyHint: '浏览品种详情页可计入人气排名。', discover: '浏览品种', updated: '排名更新', refresh: '每30分钟更新', rank: '排名', movement: '排名变化', count: '已排名品种' },
  pt: { overall: 'Geral', category: 'Categoria do ranking', views: 'visualizações', loading: 'Carregando ranking…', degraded: 'A atualização do ranking está atrasada. Os resultados disponíveis podem estar desatualizados.', unavailable: 'O ranking está temporariamente indisponível.', empty: 'Ainda não há visualizações registradas nesta categoria.', emptyHint: 'Visite as páginas dos ativos para contribuir com o ranking.', discover: 'Explorar ativos', updated: 'Ranking atualizado', refresh: 'Atualizado a cada 30 minutos', rank: 'Posição', movement: 'Variação de posição', count: 'Ativos classificados' },
  es: { overall: 'General', category: 'Categoría del ranking', views: 'visitas', loading: 'Cargando clasificación…', degraded: 'La actualización de la clasificación está retrasada. Los resultados disponibles pueden estar desactualizados.', unavailable: 'La clasificación no está disponible temporalmente.', empty: 'Todavía no hay visitas registradas en esta categoría.', emptyHint: 'Visita las páginas de los activos para contribuir a la clasificación.', discover: 'Explorar activos', updated: 'Clasificación actualizada', refresh: 'Actualización cada 30 minutos', rank: 'Posición', movement: 'Cambio de posición', count: 'Activos clasificados' },
};

export function PopularSearchesPage() {
  const locale = useLocale();
  const labels = copy[locale as keyof typeof copy] ?? copy.en;
  const t = useTranslations('popularRanking');
  const tMarket = useTranslations('market');
  const tCategory = useTranslations('categories');
  const { rankings, getCategoryRankings, rankingStatus, lastUpdated } = useSearchRanking();
  const { tickers } = useHyperliquidTicker();
  const [scope, setScope] = useState<RankingScope>('ALL');
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const choices: RankingScope[] = ['ALL', ...RANKING_CATEGORIES];
  const scopeLabel = (value: RankingScope) => value === 'ALL' ? labels.overall : tCategory(value);


  function selectScope(value: RankingScope) {
    setScope(value);
    const url = new URL(window.location.href);
    if (value === 'ALL') url.searchParams.delete('category');
    else url.searchParams.set('category', value);
    if (url.href !== window.location.href) window.history.pushState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }

  const displayRankings = (scope === 'ALL' ? rankings : getCategoryRankings(scope)).filter(item => item.views > 0 && getStockBySymbol(item.symbol));
  const rankedViews = displayRankings.reduce((sum, item) => sum + item.views, 0);
  const loading = rankingStatus === 'loading';
  const rankingDate = new Date(lastUpdated);
  const hasRankingDate = lastUpdated > 0 && Number.isFinite(rankingDate.getTime());

  return (
    <div className="min-h-screen">
      <Suspense fallback={null}><RankingScopeSync onChange={setScope} /></Suspense>
      <div className="border-b border-border/50 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="container py-8 sm:py-12 space-y-5">
          <div className="flex items-start gap-3">
            <div className="shrink-0 rounded-xl bg-primary/15 p-2.5 sm:p-3"><TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary" aria-hidden="true" /></div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold break-words">{t('title')}</h1>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground">{t('description')}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" aria-hidden="true" />{t('timeframe')}</span>
            <span>{labels.refresh}</span>
            {hasRankingDate && <span>{labels.updated}: <time dateTime={rankingDate.toISOString()}>{formatRankingUpdatedAt(lastUpdated, locale)}</time></span>}
          </div>
        </div>
      </div>

      <div className="container py-6 sm:py-8 space-y-5">
        <div className="sm:hidden">
          <label htmlFor="ranking-category" className="mb-2 block text-sm font-medium">{labels.category}</label>
          <select id="ranking-category" value={scope} onChange={event => selectScope(event.target.value as RankingScope)} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm">
            {choices.map(value => <option key={value} value={value}>{scopeLabel(value)}</option>)}
          </select>
        </div>
        <nav aria-label={labels.category} className="hidden sm:flex flex-wrap gap-2">
          {choices.map(value => (
            <a key={value} href={`${prefix}/popular${value === 'ALL' ? '' : `?category=${value}`}`} aria-current={scope === value ? 'page' : undefined}
              onClick={event => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault(); selectScope(value);
              }}
              className={cn('rounded-full border px-4 py-2 text-sm font-medium transition-colors', scope === value ? 'border-primary/30 bg-primary/15 text-primary' : 'border-border/60 bg-card/40 text-muted-foreground hover:bg-accent hover:text-foreground')}>
              {scopeLabel(value)}
            </a>
          ))}
        </nav>

        {rankingStatus === 'degraded' && <p role="status" className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-muted-foreground">{labels.degraded}</p>}

        <section aria-labelledby="ranking-heading" aria-busy={loading} className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <h2 id="ranking-heading" className="text-lg font-semibold">{scopeLabel(scope)}</h2>
            {!loading && displayRankings.length > 0 && <span className="text-xs text-muted-foreground">{labels.count}: {displayRankings.length.toLocaleString(locale)} · {rankedViews.toLocaleString(locale)} {labels.views}</span>}
          </div>
          {loading ? (
            <div role="status" className="glass-card rounded-2xl p-8 text-center text-muted-foreground">{labels.loading}</div>
          ) : displayRankings.length === 0 ? (
            <div className="glass-card rounded-2xl px-5 py-12 text-center">
              <Search className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
              <p className="font-medium">{rankingStatus === 'degraded' ? labels.unavailable : labels.empty}</p>
              {rankingStatus !== 'degraded' && <p className="mt-2 text-sm text-muted-foreground">{labels.emptyHint}</p>}
              <Link href={prefix || '/'} className="mt-5 inline-flex rounded-full bg-primary/15 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/25">{labels.discover}</Link>
            </div>
          ) : (
            <ol className="space-y-3">
              {displayRankings.map(item => {
                const stock = getStockBySymbol(item.symbol)!;
                const ticker = tickers[stock.hyperliquidSymbol.replace(/^xyz:/, '')];
                const direction = marketDirection(ticker?.changePercent24h);
                return (
                  <li key={item.symbol}>
                    <Link href={`${prefix}/stock/${stock.slug}`} className="glass-card glass-card-hover block rounded-xl p-3 sm:p-4">
                      <div className="flex items-start gap-3">
                        <RankBadge rank={item.rank} label={labels.rank} />
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="font-semibold break-words">{getLocalizedAssetName(stock, locale)}</span>
                            <span className="text-xs text-muted-foreground">{stock.symbol}</span>
                            <Badge variant="outline" className="text-[10px]">{tCategory(stock.category)}</Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            <span className={cn('font-semibold tabular-nums', direction === 1 && 'text-gain', direction === -1 && 'text-loss')}>
                              {ticker?.price != null ? formatMarketPrice(ticker.price, stock.category !== 'INDEX' && stock.category !== 'FX') : <span className="text-xs font-normal text-muted-foreground">{tMarket('priceUnavailable')}</span>}
                            </span>
                            <PriceChange value={ticker?.changePercent24h ?? null} type="percent" size="sm" showIcon={false} />
                          </div>
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Eye className="h-3 w-3" aria-hidden="true" />{item.views.toLocaleString(locale)} {labels.views}</span>
                        </div>
                        <RankChangeIndicator change={item.rankChange} label={labels.movement} locale={locale} />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}

/** Isolate request-dependent query access so static prerendering keeps the page shell. */
function RankingScopeSync({ onChange }: { onChange: (scope: RankingScope) => void }) {
  const params = useSearchParams();
  useEffect(() => { onChange(parseRankingScope(params.toString())); }, [params, onChange]);
  return null;
}

function RankBadge({ rank, label }: { rank: number; label: string }) {
  const colors: Record<number, string> = { 1: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/25', 2: 'bg-slate-400/15 text-slate-400 border-slate-400/25', 3: 'bg-amber-600/15 text-amber-600 border-amber-600/25' };
  return <span aria-label={`${label} ${rank}`} className={cn('inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold tabular-nums', colors[rank] ?? 'bg-muted/30 text-muted-foreground border-border/30')}>{rank}</span>;
}
function RankChangeIndicator({ change, label, locale }: { change: number | null; label: string; locale: string }) {
  const movement = rankingMovement(change, locale);
  const ariaValue = movement.direction === 1 ? `+${movement.text}` : movement.direction === -1 ? `-${movement.text}` : movement.text;
  return <span aria-label={`${label}: ${ariaValue}`} className={cn('inline-flex max-w-20 shrink-0 items-center justify-end gap-1 pt-2 text-right text-[10px] sm:text-xs tabular-nums', movement.direction === 1 && 'text-gain', movement.direction === -1 && 'text-loss', (movement.direction == null || movement.direction === 0) && 'text-muted-foreground')}>
    {(movement.direction === 1 || movement.direction === -1) && <span className="shrink-0 text-[8px]" aria-hidden="true">{movement.direction === 1 ? '▲' : '▼'}</span>}
    <span className="break-words">{movement.text}</span>
  </span>;
}
