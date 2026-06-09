'use client';

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
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Star
        className={cn(
          iconSizes[size],
          'transition-all',
          isFavorite && 'fill-current'
        )}
      />
    </Button>
  );
}
