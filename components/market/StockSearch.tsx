'use client';

import { useState, useMemo, useRef, useEffect, useId } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Search, TrendingUp, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { stocks } from '@/lib/markets/stocks';
import { cn } from '@/lib/utils';
import { TrendingTicker } from './TrendingTicker';
import { Stock } from '@/lib/providers/types';
import { useSearchRanking } from '@/lib/context/SearchRankingContext';

function getLocalizedName(stock: Stock, locale: string): string {
  switch (locale) {
    case 'ko': return stock.nameKo || stock.name;
    case 'ja': return stock.nameJa || stock.name;
    case 'zh': return stock.nameZh || stock.name;
    case 'pt': return stock.namePt || stock.name;
    case 'es': return stock.nameEs || stock.name;
    default: return stock.name;
  }
}

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
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const composingRef = useRef(false);
  const listId = useId();
  const router = useRouter();
  const t = useTranslations('search');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const labels = { en: { clear: 'Clear search', results: 'Search results', suggested: 'Explore assets' }, ko: { clear: '검색어 지우기', results: '검색 결과', suggested: '종목 둘러보기' }, ja: { clear: '検索をクリア', results: '検索結果', suggested: '銘柄を探す' }, zh: { clear: '清除搜索', results: '搜索结果', suggested: '浏览品种' }, pt: { clear: 'Limpar pesquisa', results: 'Resultados da pesquisa', suggested: 'Explorar ativos' }, es: { clear: 'Borrar búsqueda', results: 'Resultados de búsqueda', suggested: 'Explorar activos' } }[locale as 'en' | 'ko' | 'ja' | 'zh' | 'pt' | 'es'] ?? { clear: 'Clear search', results: 'Search results', suggested: 'Explore assets' };
  const { getTopRankings } = useSearchRanking();

  // Get popular stocks based on search ranking
  const popularStocks = useMemo(() => {
    const topRankings = getTopRankings(8).filter(ranking => ranking.views > 0);
    // Map rankings to stock objects
    return topRankings
      .map((ranking) => stocks.find((s) => s.symbol === ranking.symbol))
      .filter((s): s is Stock => s !== undefined);
  }, [getTopRankings]);

  const filteredStocks = useMemo(() => {
    if (!query.trim()) {
      // Show popular stocks based on ranking when no query
      return popularStocks.length ? popularStocks : stocks.slice(0, 6);
    }

    const lowerQuery = query.toLowerCase();
    return stocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(lowerQuery) ||
        stock.name.toLowerCase().includes(lowerQuery) ||
        [stock.nameKo, stock.nameJa, stock.nameZh, stock.namePt, stock.nameEs].some(name => name?.toLowerCase().includes(lowerQuery))
    );
  }, [query, popularStocks]);

  // Reset selected index when filtered results change
  const [previousResults, setPreviousResults] = useState(filteredStocks);
  if (previousResults !== filteredStocks) {
    setPreviousResults(filteredStocks);
    setSelectedIndex(0);
  }

  const handleSelect = (slug: string) => {
    // Page view is tracked on the stock detail page
    router.push(`${prefix}/stock/${slug}`);
    setQuery('');
    setIsOpen(false);
    onSelect?.();
  };

  useEffect(() => {
    if (isOpen) optionRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [isOpen, selectedIndex, filteredStocks]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Safari can report keyCode 229 when composition has just ended.
    if (composingRef.current || e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === 'Tab') { setIsOpen(false); return; }
    if (e.key === 'Escape') {
      if (isOpen) e.preventDefault();
      setIsOpen(false);
      return; // Keep DOM focus on the combobox, rather than dropping it.
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      if (!filteredStocks.length) return;
      if (!isOpen) setSelectedIndex(e.key === 'ArrowDown' ? 0 : filteredStocks.length - 1);
      else setSelectedIndex(previous => e.key === 'ArrowDown'
        ? (previous + 1) % filteredStocks.length
        : (previous - 1 + filteredStocks.length) % filteredStocks.length);
      return;
    }
    if (isOpen && e.key === 'Enter' && filteredStocks[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredStocks[selectedIndex].slug);
    }
  };

  const clearQuery = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className={cn('relative w-full max-w-lg', className)} onBlurCapture={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsOpen(false);
    }}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label={t('placeholder')}
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-activedescendant={isOpen && filteredStocks[selectedIndex] ? `${listId}-${selectedIndex}` : undefined}
          autoComplete="off"
          onCompositionStart={() => { composingRef.current = true; }}
          onCompositionEnd={() => { composingRef.current = false; }}
          placeholder={t('placeholder')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="h-12 pl-12 pr-10 text-base glass-card border-border/50 focus:border-primary/50 rounded-xl"
        />
        {query && (
          <button
            type="button"
            aria-label={labels.clear}
            onClick={clearQuery}
            className="absolute right-1 top-1/2 -translate-y-1/2 flex h-11 w-9 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring"
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
              {popularStocks.length ? tNav('popular') : labels.suggested}
            </div>
          )}

          {filteredStocks.length > 0 ? (
            <div id={listId} role="listbox" aria-label={labels.results} className="py-1">
              {filteredStocks.map((stock, index) => (
                <div
                  key={stock.symbol}
                  ref={element => { optionRefs.current[index] = element; }}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === selectedIndex}
                  onMouseDown={event => event.preventDefault()}
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
                    {!query.trim() && popularStocks.length > 0 ? (
                      <span className="flex items-center justify-center h-4 w-4 text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                    ) : (
                      <TrendingUp className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold break-words [overflow-wrap:anywhere]">{getLocalizedName(stock, locale)}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {stock.category}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground truncate block">
                      {stock.symbol}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div id={listId} role="listbox" aria-label={labels.results} className="px-4 py-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p role="option" aria-disabled="true" aria-selected="false">{t('noResults')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
