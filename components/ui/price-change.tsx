'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PriceChangeProps {
  value: number | null;
  type?: 'amount' | 'percent';
  showIcon?: boolean;
  showBackground?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriceChange({
  value,
  type = 'percent',
  showIcon = true,
  showBackground = false,
  size = 'md',
  className,
}: PriceChangeProps) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  const isPositive = value > 0;
  const isNegative = value < 0;
  const isZero = value === 0;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  const formattedValue =
    type === 'percent'
      ? `${isPositive ? '+' : ''}${value.toFixed(2)}%`
      : `${isPositive ? '+' : ''}${value.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 tabular-nums font-medium',
        sizeClasses[size],
        isPositive && 'text-gain',
        isNegative && 'text-loss',
        isZero && 'text-muted-foreground',
        showBackground && isPositive && 'bg-gain px-1.5 py-0.5 rounded',
        showBackground && isNegative && 'bg-loss px-1.5 py-0.5 rounded',
        className
      )}
    >
      {showIcon && (
        <>
          {isPositive && <TrendingUp className={iconSizes[size]} />}
          {isNegative && <TrendingDown className={iconSizes[size]} />}
          {isZero && <Minus className={iconSizes[size]} />}
        </>
      )}
      {formattedValue}
    </span>
  );
}

interface PriceDisplayProps {
  price: number | null;
  previousPrice?: number | null;
  change?: number | null;
  changePercent?: number | null;
  currency?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showChange?: boolean;
  className?: string;
}

export function PriceDisplay({
  price,
  previousPrice,
  change,
  changePercent,
  currency = 'USD',
  size = 'md',
  showChange = true,
  className,
}: PriceDisplayProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  if (price === null || price === undefined) {
    return (
      <div className={cn('tabular-nums', className)}>
        <span className="text-muted-foreground">Price unavailable</span>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: price < 1 ? 6 : 2,
  }).format(price);

  // Calculate change from previous price if not provided
  const calculatedChange =
    change ?? (previousPrice ? price - previousPrice : null);
  const calculatedChangePercent =
    changePercent ??
    (previousPrice && previousPrice !== 0
      ? ((price - previousPrice) / previousPrice) * 100
      : null);

  const isUp =
    calculatedChange !== null
      ? calculatedChange > 0
      : previousPrice !== null && previousPrice !== undefined
        ? price > previousPrice
        : null;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span
        className={cn(
          'tabular-nums font-semibold',
          sizeClasses[size],
          isUp === true && 'text-gain',
          isUp === false && 'text-loss'
        )}
      >
        {formattedPrice}
      </span>
      {showChange && calculatedChange !== null && (
        <div className="flex items-center gap-2">
          <PriceChange value={calculatedChange} type="amount" size="sm" />
          {calculatedChangePercent !== null && (
            <PriceChange
              value={calculatedChangePercent}
              type="percent"
              size="sm"
              showIcon={false}
            />
          )}
        </div>
      )}
    </div>
  );
}
