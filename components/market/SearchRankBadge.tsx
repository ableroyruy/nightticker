'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { TrendingUp, Flame } from 'lucide-react';
import { useSearchRanking } from '@/lib/context/SearchRankingContext';
import { cn } from '@/lib/utils';

interface SearchRankBadgeProps {
  symbol: string;
  className?: string;
}

export function SearchRankBadge({ symbol, className }: SearchRankBadgeProps) {
  const locale = useLocale();
  const { rankings } = useSearchRanking();
  const prefix = locale === 'ko' ? '/ko' : '';

  const item = rankings.find((r) => r.symbol === symbol);

  if (!item || item.rank > 20) return null;

  const isTop3 = item.rank <= 3;
  const isTop10 = item.rank <= 10;

  return (
    <Link
      href={`${prefix}/popular`}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
        isTop3 && 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30',
        !isTop3 && isTop10 && 'bg-primary/20 text-primary hover:bg-primary/30',
        !isTop10 && 'bg-muted/50 text-muted-foreground hover:bg-muted',
        className
      )}
    >
      {isTop3 ? (
        <Flame className="h-3 w-3" />
      ) : (
        <TrendingUp className="h-3 w-3" />
      )}
      <span>
        {locale === 'ko' ? '인기' : 'Hot'} #{item.rank}
      </span>
      {item.rankChange !== null && item.rankChange !== 0 && (
        <span
          className={cn(
            'text-[10px]',
            item.rankChange > 0 && 'text-gain',
            item.rankChange < 0 && 'text-loss'
          )}
        >
          {item.rankChange > 0 ? '▲' : '▼'}
          {Math.abs(item.rankChange)}
        </span>
      )}
    </Link>
  );
}
