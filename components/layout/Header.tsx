'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Moon, Menu, X, Home, Star, TrendingUp, TrendingDown, ChevronDown, BarChart3, Coins, Globe, Cpu, Building2, DollarSign, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { StockCategory } from '@/lib/providers/types';

const categoryIcons: Record<StockCategory | 'all', React.ElementType> = {
  all: Globe,
  US: Building2,
  KR: Building2,
  JP: Building2,
  INDEX: BarChart3,
  ETF: BarChart3,
  COMMODITY: Coins,
  FX: DollarSign,
  SPECIAL: Cpu,
  SEMICONDUCTOR: Cpu,
};

export function Header() {
  const t = useTranslations('nav');
  const tCat = useTranslations('categories');
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const prefix = locale === 'ko' ? '/ko' : '';

  const navLinks = [
    { href: `${prefix}/`, label: t('home'), icon: Home },
    { href: `${prefix}/favorites`, label: t('favorites'), icon: Star },
    { href: `${prefix}/popular`, label: locale === 'ko' ? '인기순위' : 'Hot', icon: Flame },
    { href: `${prefix}/gainers`, label: t('topGainers'), icon: TrendingUp },
    { href: `${prefix}/losers`, label: t('topLosers'), icon: TrendingDown },
  ];

  const categories: (StockCategory | 'all')[] = ['all', 'US', 'KR', 'JP', 'INDEX', 'ETF', 'COMMODITY', 'FX', 'SEMICONDUCTOR'];

  const isActive = (href: string) => {
    if (href === prefix || href === `${prefix}/`) {
      return pathname === prefix || pathname === `${prefix}/` || pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const isCategoryActive = pathname.includes('/category/');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={prefix || '/'} className="flex items-center gap-2.5">
            <div className="p-1.5 glass-card rounded-lg">
              <Moon className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight">NightTicker</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}

            {/* Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isCategoryActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
              >
                <BarChart3 className="h-4 w-4" />
                {tCat('all')}
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {categories.map((cat, index) => {
                  const Icon = categoryIcons[cat];
                  return (
                    <div key={cat}>
                      {index === 4 && <DropdownMenuSeparator />}
                      <Link href={cat === 'all' ? `${prefix}/` : `${prefix}/category/${cat.toLowerCase()}`}>
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                          <Icon className="h-4 w-4" />
                          {tCat(cat)}
                        </DropdownMenuItem>
                      </Link>
                    </div>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-border/50 p-4 space-y-1 bg-background/95 backdrop-blur-xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}

          {/* Mobile Categories */}
          <div className="pt-2 border-t border-border/50 mt-2">
            <p className="px-4 py-2 text-xs text-muted-foreground uppercase tracking-wider">{tCat('all')}</p>
            {categories.filter(c => c !== 'all').map((cat) => {
              const Icon = categoryIcons[cat];
              return (
                <Link
                  key={cat}
                  href={`${prefix}/category/${cat.toLowerCase()}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {tCat(cat)}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
