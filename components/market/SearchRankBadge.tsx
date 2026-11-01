'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowUpRight, Flame } from 'lucide-react';
import { useSearchRanking } from '@/lib/context/SearchRankingContext';
import { categoryNames } from '@/lib/markets/stocks';
import type { StockCategory } from '@/lib/providers/types';
import { cn } from '@/lib/utils';

const copy = {
  ko: { overall: '전체', rank: (n: number) => `${n}위`, more: '전체 인기순위', basis: '최근 24시간 조회 기준', pending: '조회수 집계 중', loading: '인기순위 불러오는 중', delayed: '순위 갱신 지연' },
  en: { overall: 'Overall', rank: (n: number) => `#${n}`, more: 'Explore rankings', basis: 'Views in the last 24 hours', pending: 'Awaiting view data', loading: 'Loading rankings', delayed: 'Ranking update delayed' },
  ja: { overall: '全体', rank: (n: number) => `${n}位`, more: '人気ランキング', basis: '直近24時間の閲覧数', pending: '閲覧数を集計中', loading: 'ランキング読込中', delayed: '更新が遅れています' },
  zh: { overall: '全部', rank: (n: number) => `第${n}名`, more: '查看人气排行', basis: '最近24小时浏览量', pending: '浏览量统计中', loading: '正在加载排行', delayed: '排行更新延迟' },
  pt: { overall: 'Geral', rank: (n: number) => `#${n}`, more: 'Ver rankings', basis: 'Visualizacoes nas ultimas 24 horas', pending: 'Aguardando visualizacoes', loading: 'Carregando ranking', delayed: 'Atualizacao atrasada' },
  es: { overall: 'General', rank: (n: number) => `#${n}`, more: 'Ver rankings', basis: 'Visitas en las ultimas 24 horas', pending: 'Esperando visitas', loading: 'Cargando ranking', delayed: 'Actualizacion retrasada' },
};

export function SearchRankBadge({ symbol, category, className }: { symbol: string; category: StockCategory; className?: string }) {
  const locale = useLocale();
  const { rankings, getCategoryRankings, rankingStatus } = useSearchRanking();
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const text = copy[locale as keyof typeof copy] ?? copy.en;
  const overall = rankings.find(item => item.symbol === symbol && item.views > 0);
  const withinCategory = getCategoryRankings(category).find(item => item.symbol === symbol && item.views > 0);
  const categoryLabel = categoryNames[category][locale as keyof typeof categoryNames.US] ?? categoryNames[category].en;
  const visibleRank = overall && rankingStatus !== 'loading';

  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg bg-muted/40 px-3 py-2 text-xs', className)} aria-label={text.basis}>
      <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
        {visibleRank ? <>
          <Flame className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden="true" />
          <Link href={`${prefix}/popular`} className="font-medium text-foreground hover:underline">{text.overall} {text.rank(overall.rank)}</Link>
          {withinCategory && <><span aria-hidden="true">·</span><Link href={`${prefix}/popular?category=${category}`} className="hover:text-foreground hover:underline">{categoryLabel} {text.rank(withinCategory.rank)}</Link></>}
          <span className="hidden sm:inline">· {text.basis}</span>
        </> : <span>{rankingStatus === 'loading' ? text.loading : text.pending}</span>}
        {rankingStatus === 'degraded' && <span className="text-amber-600 dark:text-amber-400">{text.delayed}</span>}
      </span>
      <Link href={`${prefix}/popular`} className="ml-auto inline-flex shrink-0 items-center gap-0.5 py-1 font-medium text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
        {text.more}<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}
