'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { formatMarketPrice, formatMarketChange, marketDirection } from '@/lib/format-market';

interface PriceChangeProps {
  value: number | null;
  type?: 'amount' | 'percent';
  showIcon?: boolean;
  showBackground?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  hideCurrency?: boolean;
}

export function PriceChange({
  value,
  type = 'percent',
  showIcon = true,
  showBackground = false,
  size = 'md',
  className,
  hideCurrency = false,
}: PriceChangeProps) {

  if (value == null || !Number.isFinite(value)) {
    return <span className="text-muted-foreground">—</span>;
  }

  const direction = marketDirection(value, type);
  const isPositive = direction === 1;
  const isNegative = direction === -1;
  const isZero = direction === 0;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const triangleSizes = {
    sm: 'text-[8px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  };

  const formattedValue = formatMarketChange(value, type, !hideCurrency);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 tabular-nums font-medium',
        sizeClasses[size],
        isPositive && 'text-gain',
        isNegative && 'text-loss',
        isZero && 'text-muted-foreground',
        showBackground && isPositive && 'bg-gain px-1.5 py-0.5 rounded',
        showBackground && isNegative && 'bg-loss px-1.5 py-0.5 rounded',
        showBackground && isZero && 'bg-muted px-1.5 py-0.5 rounded',
        className
      )}
    >
      {showIcon && (
        <span
          className={cn(
            triangleSizes[size],
            'arrow-bounce'
          )}
        >
          {isPositive && '▲'}
          {isNegative && '▼'}
          {isZero && '−'}
        </span>
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
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showChange?: boolean;
  className?: string;
  hideCurrency?: boolean;
}

export function PriceDisplay({
  price,
  previousPrice,
  change,
  changePercent,
  size = 'md',
  showChange = true,
  className,
  hideCurrency = false,
}: PriceDisplayProps) {
  const t = useTranslations('market');

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  if (price == null || !Number.isFinite(price)) {
    return (
      <div className={cn('tabular-nums', className)}>
        <span className="text-muted-foreground">{t('priceUnavailable')}</span>
      </div>
    );
  }

  // Format price (with or without currency symbol)
  const formattedPrice = formatMarketPrice(price, !hideCurrency);

  // Calculate change from previous price if not provided
  const calculatedChange =
    change ?? (previousPrice ? price - previousPrice : null);
  const calculatedChangePercent =
    changePercent ??
    (previousPrice && previousPrice !== 0
      ? ((price - previousPrice) / previousPrice) * 100
      : null);

  const direction = marketDirection(calculatedChangePercent ?? calculatedChange, calculatedChangePercent != null ? 'percent' : 'amount');
  const isUp = direction === 1;
  const isDown = direction === -1;
  const isFlat = direction === 0;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span
        className={cn(
          'max-w-full tabular-nums font-semibold [overflow-wrap:anywhere]',
          sizeClasses[size],
          isUp === true && 'text-gain',
          isDown === true && 'text-loss',
          isFlat === true && 'text-muted-foreground'
        )}
      >
        {formattedPrice}
      </span>
      {showChange && calculatedChange !== null && (
        <div className="flex flex-wrap items-center gap-2">
          <PriceChange value={calculatedChange} type="amount" size="sm" hideCurrency={hideCurrency} />
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
