'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { stocks } from '@/lib/markets/stocks';

export function StockSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations('search');
  const locale = useLocale();
  const prefix = locale === 'ko' ? '/ko' : '';

  const filteredStocks = useMemo(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return stocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(lowerQuery) ||
        stock.name.toLowerCase().includes(lowerQuery) ||
        stock.nameKo.includes(query)
    );
  }, [query]);

  const handleSelect = (symbol: string) => {
    router.push(`${prefix}/markets/${symbol.toLowerCase()}`);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t('placeholder')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="pl-10"
        />
      </div>

      {isOpen && query.trim() && (
        <div className="absolute top-full mt-1 w-full bg-background border rounded-md shadow-lg z-50 max-h-64 overflow-auto">
          {filteredStocks.length > 0 ? (
            filteredStocks.map((stock) => (
              <button
                key={stock.symbol}
                className="w-full px-4 py-2 text-left hover:bg-muted flex items-center justify-between"
                onClick={() => handleSelect(stock.symbol)}
              >
                <span className="font-medium">{stock.symbol}</span>
                <span className="text-sm text-muted-foreground">
                  {locale === 'ko' ? stock.nameKo : stock.name}
                </span>
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-muted-foreground">
              {t('noResults')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
