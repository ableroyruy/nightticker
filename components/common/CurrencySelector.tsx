'use client';

import { useLocale } from 'next-intl';
import { useCurrency } from '@/lib/context/CurrencyContext';
import {
  currencies,
  currencyList,
  CurrencyCode,
  getCurrencyName,
} from '@/lib/constants/currencies';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function CurrencySelector() {
  const locale = useLocale();
  const { currency, setCurrency, rates } = useCurrency();

  const currentCurrency = currencies[currency];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3">
        <span>{currentCurrency.flag}</span>
        <span className="font-mono">{currency}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {currencyList.map((code) => {
          const info = currencies[code];
          const rate = rates.find((r) => r.currency === code);
          const isSelected = code === currency;

          return (
            <DropdownMenuItem
              key={code}
              onClick={() => setCurrency(code)}
              className={cn(
                'flex items-center justify-between cursor-pointer',
                isSelected && 'bg-accent'
              )}
            >
              <div className="flex items-center gap-2">
                <span>{info.flag}</span>
                <span className="font-mono font-medium">{code}</span>
                <span className="text-xs text-muted-foreground">
                  {getCurrencyName(code, locale)}
                </span>
              </div>
              {isSelected && (
                <span className="text-primary">✓</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
