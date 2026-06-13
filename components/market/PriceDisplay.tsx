'use client';

import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  price: number | null;
  change24h?: number | null;
  changePercent24h?: number | null;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showChange?: boolean;
  hideCurrency?: boolean;
}

export function PriceDisplay({
  price,
  change24h,
  changePercent24h,
  isLoading = false,
  size = 'md',
  showChange = true,
  hideCurrency = false,
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

  const triangleSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
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
  const formattedPrice = hideCurrency
    ? new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price)
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);

  const isPositive = changePercent24h != null && changePercent24h > 0;
  const isNegative = changePercent24h != null && changePercent24h < 0;

  // Format change amount (with or without currency symbol)
  const formattedChange = change24h != null
    ? hideCurrency
      ? `${isPositive ? '+' : '-'}${Math.abs(change24h).toFixed(2)}`
      : `${isPositive ? '+' : '-'}$${Math.abs(change24h).toFixed(2)}`
    : null;

  // Format change percent
  const formattedPercent = changePercent24h != null
    ? `${isPositive ? '+' : ''}${changePercent24h.toFixed(2)}%`
    : null;

  return (
    <div className="space-y-2">
      <span className={sizeClasses[size]}>{formattedPrice}</span>
      {showChange && (changePercent24h != null || change24h != null) && (
        <div className="flex items-center gap-3 flex-wrap">
          {/* Change Amount with background */}
          {formattedChange && (
            <span
              className={cn(
                'inline-flex items-center gap-1 tabular-nums font-medium px-2 py-1 rounded',
                changeSizeClasses[size],
                isPositive && 'text-gain bg-gain',
                isNegative && 'text-loss bg-loss',
                !isPositive && !isNegative && 'text-muted-foreground bg-muted'
              )}
            >
              <span className={cn(triangleSizes[size], 'arrow-bounce')}>
                {isPositive && '▲'}
                {isNegative && '▼'}
                {!isPositive && !isNegative && '−'}
              </span>
              {formattedChange}
            </span>
          )}

          {/* Change Percent */}
          {formattedPercent && (
            <span
              className={cn(
                'inline-flex items-center tabular-nums font-medium',
                changeSizeClasses[size],
                isPositive && 'text-gain',
                isNegative && 'text-loss',
                !isPositive && !isNegative && 'text-muted-foreground'
              )}
            >
              {formattedPercent}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
