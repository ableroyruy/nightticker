'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Moon, Clock } from 'lucide-react';
import { ConnectionStatus } from '@/components/ui/connection-status';
import { ConnectionStatus as ConnectionStatusType } from '@/lib/types/market';
import { useTimeOfDay } from '@/lib/hooks/useTimeOfDay';

interface HeroSectionProps {
  connectionStatus: ConnectionStatusType;
  lastUpdate: Date | null;
}

export function HeroSection({ connectionStatus, lastUpdate }: HeroSectionProps) {
  const t = useTranslations('hero');
  const locale = useLocale();
  const timeInfo = useTimeOfDay(locale);

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

          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 pt-4">
            <ConnectionStatus
              status={connectionStatus}
              lastUpdate={lastUpdate}
            />

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="tabular-nums font-medium">
                {timeInfo.localTime}
              </span>
              <span className="text-muted-foreground/60">
                {timeInfo.timezone}
              </span>
            </div>
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
