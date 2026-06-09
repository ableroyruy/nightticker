'use client';

import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';

interface PriceDisplayProps {
  price: number | null;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PriceDisplay({ price, isLoading = false, size = 'md' }: PriceDisplayProps) {
  const t = useTranslations('market');

  const sizeClasses = {
    sm: 'text-xl font-semibold',
    md: 'text-3xl font-bold',
    lg: 'text-5xl font-bold',
  };

  if (isLoading) {
    return <Skeleton className={`h-10 w-32 ${size === 'lg' ? 'h-14 w-48' : ''}`} />;
  }

  if (price === null) {
    return (
      <span className="text-muted-foreground text-lg">
        {t('priceUnavailable')}
      </span>
    );
  }

  // Format price with appropriate decimals
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

  return (
    <span className={sizeClasses[size]}>
      {formattedPrice}
    </span>
  );
}
