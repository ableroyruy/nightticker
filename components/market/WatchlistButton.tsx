'use client';

import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWatchlist } from '@/lib/hooks/useWatchlist';
import { useTranslations } from 'next-intl';

interface WatchlistButtonProps {
  symbol: string;
  size?: 'sm' | 'default';
}

export function WatchlistButton({ symbol, size = 'sm' }: WatchlistButtonProps) {
  const { isWatched, toggle, isLoaded } = useWatchlist();
  const t = useTranslations('watchlist');
  const watched = isWatched(symbol);

  if (!isLoaded) {
    return (
      <Button variant="ghost" size="icon" disabled className="h-8 w-8">
        <Star className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => toggle(symbol)}
      title={watched ? t('remove') : t('add')}
      className={`h-8 w-8 ${watched ? 'text-yellow-500' : 'text-muted-foreground'}`}
    >
      <Star className={`h-4 w-4 ${watched ? 'fill-current' : ''}`} />
    </Button>
  );
}
