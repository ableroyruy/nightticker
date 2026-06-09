'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Clock, Globe } from 'lucide-react';
import { useTimeOfDay } from '@/lib/hooks/useTimeOfDay';
import { useMarketStatus } from '@/lib/hooks/useMarketStatus';
import { Badge } from '@/components/ui/badge';

export function MarketClock() {
  const locale = useLocale();
  const t = useTranslations('marketClock');
  const timeInfo = useTimeOfDay(locale);
  const marketStatus = useMarketStatus(locale);

  return (
    <div className="w-full bg-card/50 backdrop-blur-sm border rounded-lg p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Local Time */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {t('localTime')}
            </p>
            <p className="text-lg font-mono font-semibold">{timeInfo.localTime}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {timeInfo.timezone}
            </p>
          </div>
        </div>

        {/* US Market */}
        <div className="flex items-center gap-3">
          <MarketStatusIndicator isOpen={marketStatus.us.isOpen} />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {locale === 'ko' ? marketStatus.us.nameKo : marketStatus.us.name}
            </p>
            <div className="flex items-center gap-2">
              <Badge
                variant={marketStatus.us.isOpen ? 'default' : 'secondary'}
                className={
                  marketStatus.us.isOpen
                    ? 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30'
                    : 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30'
                }
              >
                {marketStatus.us.isOpen ? (locale === 'ko' ? '개장' : 'Open') : (locale === 'ko' ? '휴장' : 'Closed')}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {marketStatus.us.currentTime} ET
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {marketStatus.us.nextEvent} {marketStatus.us.nextEventTime}
            </p>
          </div>
        </div>

        {/* Korea Market */}
        <div className="flex items-center gap-3">
          <MarketStatusIndicator isOpen={marketStatus.kr.isOpen} />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {locale === 'ko' ? marketStatus.kr.nameKo : marketStatus.kr.name}
            </p>
            <div className="flex items-center gap-2">
              <Badge
                variant={marketStatus.kr.isOpen ? 'default' : 'secondary'}
                className={
                  marketStatus.kr.isOpen
                    ? 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30'
                    : 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30'
                }
              >
                {marketStatus.kr.isOpen ? (locale === 'ko' ? '개장' : 'Open') : (locale === 'ko' ? '휴장' : 'Closed')}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {marketStatus.kr.currentTime} KST
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {marketStatus.kr.nextEvent} {marketStatus.kr.nextEventTime}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketStatusIndicator({ isOpen }: { isOpen: boolean }) {
  return (
    <div className={`relative p-2 rounded-lg ${isOpen ? 'bg-green-500/10' : 'bg-gray-500/10'}`}>
      <div
        className={`h-3 w-3 rounded-full ${
          isOpen ? 'bg-green-500' : 'bg-gray-400'
        }`}
      />
      {isOpen && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-green-500 animate-ping opacity-75" />
        </div>
      )}
    </div>
  );
}
