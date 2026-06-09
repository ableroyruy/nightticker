'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Moon } from 'lucide-react';
import { ConnectionStatus } from '@/components/ui/connection-status';
import { TimeIcon } from '@/components/ui/time-icon';
import { StockSearch } from '@/components/market/StockSearch';
import { ConnectionStatus as ConnectionStatusType } from '@/lib/types/market';

interface HeroSectionProps {
  connectionStatus: ConnectionStatusType;
  lastUpdate: Date | null;
}

export function HeroSection({ connectionStatus, lastUpdate }: HeroSectionProps) {
  const t = useTranslations('hero');
  const locale = useLocale();

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 gradient-mesh opacity-50" />

      <div className="relative container py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Logo and Brand */}
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 glass-card rounded-2xl">
              <Moon className="h-10 w-10 text-primary" />
            </div>
            <TimeIcon size="lg" locale={locale} />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            NightTicker
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground font-medium">
            {t('subtitle')}
          </p>

          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            {t('description')}
          </p>

          {/* Search Bar */}
          <div className="flex justify-center pt-4">
            <StockSearch />
          </div>

          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 pt-4">
            <ConnectionStatus
              status={connectionStatus}
              lastUpdate={lastUpdate}
            />
          </div>

          {/* Tagline pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {['Overnight', 'Weekend', 'Holiday'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 glass-card rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
