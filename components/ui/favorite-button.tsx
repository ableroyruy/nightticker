'use client';

import { useLocale } from 'next-intl';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FavoriteButton({
  isFavorite,
  onToggle,
  size = 'md',
  className,
}: FavoriteButtonProps) {
  const locale = useLocale();
  const labels = { en: ['Add to favorites', 'Remove from favorites'], ko: ['즐겨찾기 추가', '즐겨찾기 해제'], ja: ['お気に入りに追加', 'お気に入りから削除'], zh: ['添加到收藏', '从收藏中移除'], pt: ['Adicionar aos favoritos', 'Remover dos favoritos'], es: ['Añadir a favoritos', 'Quitar de favoritos'] }[locale as 'en' | 'ko' | 'ja' | 'zh' | 'pt' | 'es'] ?? ['Add to favorites', 'Remove from favorites'];
  const label = labels[isFavorite ? 1 : 0];
  const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-9 w-9',
  };

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        sizeClasses[size],
        'transition-colors',
        isFavorite
          ? 'text-yellow-500 hover:text-yellow-400'
          : 'text-muted-foreground hover:text-yellow-500',
        className
      )}
      aria-label={label}
      aria-pressed={isFavorite}
      title={label}
      type="button"
    >
      <Star
        aria-hidden="true"
        className={cn(
          iconSizes[size],
          'transition-all',
          isFavorite && 'fill-current'
        )}
      />
    </Button>
  );
}
