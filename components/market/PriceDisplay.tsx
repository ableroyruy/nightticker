'use client';

import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatMarketPrice, marketDirection } from '@/lib/format-market';
import { PriceChange } from '@/components/ui/price-change';

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
    md: 'text-2xl sm:text-3xl font-bold',
    lg: 'text-3xl sm:text-5xl font-bold',
  };

  const changeSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
  };

  if (isLoading) {
    return <Skeleton className={`h-10 w-32 ${size === 'lg' ? 'h-14 w-48' : ''}`} />;
  }

  if (price == null || !Number.isFinite(price)) {
    return (
      <span className="text-muted-foreground text-lg">
        {t('priceUnavailable')}
      </span>
    );
  }

  const formattedPrice = formatMarketPrice(price, !hideCurrency);
  const direction = marketDirection(changePercent24h ?? change24h, changePercent24h != null ? 'percent' : 'amount');
  const isPositive = direction === 1;
  const isNegative = direction === -1;
  const isZero = direction === 0;

  return (
    <div className="space-y-2">
      <span className={cn(
        'max-w-full tabular-nums leading-tight [overflow-wrap:anywhere]',
        sizeClasses[size],
        isPositive && 'text-gain',
        isNegative && 'text-loss',
        isZero && 'text-muted-foreground'
      )}>{formattedPrice}</span>
      {showChange && (changePercent24h != null || change24h != null) && (
        <div className="flex items-center gap-3 flex-wrap">
          {change24h != null && (
            <PriceChange value={change24h} type="amount" hideCurrency={hideCurrency} showBackground size={size} className={changeSizeClasses[size]} />
          )}
          {changePercent24h != null && (
            <PriceChange value={changePercent24h} type="percent" showIcon={false} size={size} className={changeSizeClasses[size]} />
          )}
        </div>
      )}
    </div>
  );
}
