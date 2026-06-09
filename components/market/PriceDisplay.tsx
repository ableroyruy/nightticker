'use client';

import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  price: number | null;
  change24h?: number | null;
  changePercent24h?: number | null;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showChange?: boolean;
}

export function PriceDisplay({
  price,
  change24h,
  changePercent24h,
  isLoading = false,
  size = 'md',
  showChange = true,
}: PriceDisplayProps) {
  const t = useTranslations('market');

  const sizeClasses = {
    sm: 'text-xl font-semibold',
    md: 'text-3xl font-bold',
    lg: 'text-5xl font-bold',
  };

  const changeSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
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

  const isPositive = changePercent24h != null && changePercent24h > 0;
  const isNegative = changePercent24h != null && changePercent24h < 0;

  return (
    <div className="space-y-1">
      <span className={sizeClasses[size]}>{formattedPrice}</span>
      {showChange && changePercent24h != null && (
        <div
          className={cn(
            'flex items-center gap-2',
            changeSizeClasses[size],
            isPositive && 'text-gain',
            isNegative && 'text-loss',
            !isPositive && !isNegative && 'text-muted-foreground'
          )}
        >
          {isPositive && <TrendingUp className="h-4 w-4" />}
          {isNegative && <TrendingDown className="h-4 w-4" />}
          {!isPositive && !isNegative && <Minus className="h-4 w-4" />}
          <span className="font-medium">
            {isPositive ? '+' : ''}
            {changePercent24h.toFixed(2)}%
          </span>
          {change24h != null && (
            <span className="text-muted-foreground">
              ({isPositive ? '+' : ''}${change24h.toFixed(2)})
            </span>
          )}
        </div>
      )}
    </div>
  );
}
