'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useCurrency } from '@/lib/context/CurrencyContext';
import { currencies, currencyList, CurrencyCode } from '@/lib/constants/currencies';
import { cn } from '@/lib/utils';

interface ExchangeRateItemProps {
  currency: CurrencyCode;
  rate: number;
  changePercent: number | null;
}

function ExchangeRateItem({ currency, rate, changePercent }: ExchangeRateItemProps) {
  const info = currencies[currency];
  const isPositive = changePercent !== null && changePercent >= 0;
  const hasChange = changePercent !== null;

  // Format rate based on currency
  const formattedRate = useMemo(() => {
    if (currency === 'USD') return '1.00';
    if (info.decimals === 0) {
      return rate.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }
    return rate.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [currency, rate, info.decimals]);

  return (
    <div className="flex items-center gap-2 px-6 whitespace-nowrap">
      <span className="text-base">{info.flag}</span>
      <span className="text-xs text-muted-foreground">USD/{currency}</span>
      <span className="font-mono font-medium text-sm">
        {info.symbol}
        {formattedRate}
      </span>
      {hasChange && (
        <span
          className={cn(
            'flex items-center text-xs font-medium',
            isPositive ? 'text-gain' : 'text-loss'
          )}
        >
          <span className="text-[10px] mr-0.5">{isPositive ? '▲' : '▼'}</span>
          {Math.abs(changePercent).toFixed(2)}%
        </span>
      )}
    </div>
  );
}

export function ExchangeRateTicker() {
  const locale = useLocale();
  const { rates, isLoading } = useCurrency();

  // Filter out USD and get rates for ticker
  const tickerRates = useMemo(() => {
    return currencyList
      .filter((code) => code !== 'USD')
      .map((code) => {
        const rateData = rates.find((r) => r.currency === code);
        return {
          currency: code,
          rate: rateData?.rate ?? currencies[code].decimals === 0 ? 1000 : 1,
          changePercent: rateData?.changePercent ?? null,
        };
      });
  }, [rates]);

  // Duplicate items for seamless loop
  const duplicatedRates = [...tickerRates, ...tickerRates, ...tickerRates];

  if (isLoading) {
    return (
      <div className="w-full bg-muted/30 border-y border-border/30 py-2">
        <div className="flex items-center justify-center">
          <div className="animate-pulse h-4 w-48 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const prefix = locale === 'en' ? '' : `/${locale}`;

  return (
    <div className="w-full bg-gradient-to-r from-primary/5 via-transparent to-primary/5 border-y border-border/30 py-2 overflow-hidden">
      <Link href={`${prefix}/exchange-rates`} className="block">
        <div className="relative flex">
          <div className="flex animate-ticker hover:pause-animation">
            {duplicatedRates.map((item, index) => (
              <ExchangeRateItem
                key={`${item.currency}-${index}`}
                currency={item.currency}
                rate={item.rate}
                changePercent={item.changePercent}
              />
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
}
