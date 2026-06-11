'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Search, TrendingUp, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { stocks } from '@/lib/markets/stocks';
import { cn } from '@/lib/utils';
import { TrendingTicker } from './TrendingTicker';

interface StockSearchProps {
  className?: string;
  onSelect?: () => void;
  showTrending?: boolean;
}

export function StockSearch({ className, onSelect, showTrending = true }: StockSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const t = useTranslations('search');
  const locale = useLocale();
  const prefix = locale === 'ko' ? '/ko' : '';

  const filteredStocks = useMemo(() => {
    if (!query.trim()) {
      // Show popular stocks when no query
      return stocks.slice(0, 6);
    }

    const lowerQuery = query.toLowerCase();
    return stocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(lowerQuery) ||
        stock.name.toLowerCase().includes(lowerQuery) ||
        stock.nameKo.includes(query)
    );
  }, [query]);

  // Reset selected index when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredStocks]);

  const handleSelect = (slug: string) => {
    // Page view is tracked on the stock detail page
    router.push(`${prefix}/stock/${slug}`);
    setQuery('');
    setIsOpen(false);
    onSelect?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredStocks.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredStocks.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredStocks[selectedIndex]) {
          handleSelect(filteredStocks[selectedIndex].slug);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const clearQuery = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className={cn('relative w-full max-w-lg', className)}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={t('placeholder')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          className="h-12 pl-12 pr-10 text-base glass-card border-border/50 focus:border-primary/50 rounded-xl"
        />
        {query && (
          <button
            onClick={clearQuery}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Trending Ticker */}
      {showTrending && !isOpen && (
        <TrendingTicker
          className="mt-3"
          limit={10}
        />
      )}

      {isOpen && (
        <div className="absolute top-full mt-2 w-full glass-card border border-border/50 rounded-xl shadow-2xl z-50 max-h-80 overflow-auto">
          {!query.trim() && (
            <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border/50">
              {locale === 'ko' ? '인기 종목' : 'Popular'}
            </div>
          )}

          {filteredStocks.length > 0 ? (
            <div className="py-1">
              {filteredStocks.map((stock, index) => (
                <button
                  key={stock.symbol}
                  className={cn(
                    'w-full px-4 py-3 text-left flex items-center gap-3 transition-colors',
                    index === selectedIndex
                      ? 'bg-accent'
                      : 'hover:bg-accent/50'
                  )}
                  onClick={() => handleSelect(stock.slug)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{locale === 'ko' ? stock.nameKo : stock.name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {stock.category}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground truncate block">
                      {stock.symbol}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{t('noResults')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
