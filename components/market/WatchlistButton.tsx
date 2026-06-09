'use client';

import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/lib/context/FavoritesContext';
import { useTranslations } from 'next-intl';
import { MarketType } from '@/lib/types/market';

interface WatchlistButtonProps {
  symbol: string;
  market: MarketType;
  name: string;
  nameKo?: string;
  slug: string;
  size?: 'sm' | 'default';
}

export function WatchlistButton({
  symbol,
  market,
  name,
  nameKo,
  slug,
  size = 'sm',
}: WatchlistButtonProps) {
  const { isFavorite, toggleFavorite, isLoaded } = useFavorites();
  const t = useTranslations('watchlist');
  const watched = isFavorite(symbol, market);

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
      onClick={() => toggleFavorite({ symbol, market, name, nameKo, slug })}
      title={watched ? t('remove') : t('add')}
      className={`h-8 w-8 ${watched ? 'text-yellow-500' : 'text-muted-foreground'}`}
    >
      <Star className={`h-4 w-4 ${watched ? 'fill-current' : ''}`} />
    </Button>
  );
}
