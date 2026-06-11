'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHyperliquidTicker } from '@/lib/hooks/useHyperliquidTicker';
import { useCandleData } from '@/lib/hooks/useCandleData';
import { ConnectionStatus } from '@/components/ui/connection-status';
import { PriceDisplay } from '@/components/market/PriceDisplay';
import { formatLastUpdated } from '@/lib/markets/hours';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamic import for chart to avoid SSR issues
const MiniChart = dynamic(() => import('./MiniChart').then((mod) => mod.MiniChart), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-[200px] rounded" />,
});

interface MarketPriceCardProps {
  hyperliquidSymbol: string;
  locale: string;
}

export function MarketPriceCard({ hyperliquidSymbol, locale }: MarketPriceCardProps) {
  const t = useTranslations('market');
  const { tickers, status, lastUpdate } = useHyperliquidTicker();

  // Remove 'xyz:' prefix to match ticker key
  const tickerKey = hyperliquidSymbol.replace('xyz:', '');
  const ticker = tickers[tickerKey];

  // Candle data for chart
  const { candles, loading: chartLoading, error: chartError } = useCandleData(tickerKey);

  const isLoading = status === 'connecting' && !ticker;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{t('currentPrice')}</CardTitle>
        <ConnectionStatus status={status} lastUpdate={lastUpdate} />
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-48" />
            <Skeleton className="h-6 w-32" />
          </div>
        ) : (
          <PriceDisplay
            price={ticker?.price ?? null}
            change24h={ticker?.change24h ?? null}
            changePercent24h={ticker?.changePercent24h ?? null}
            size="lg"
          />
        )}

        {/* Chart */}
        <div className="w-full overflow-hidden rounded-lg">
          <MiniChart
            candles={candles}
            loading={chartLoading}
            error={chartError}
            height={300}
            autoResize
          />
        </div>

        {lastUpdate && (
          <div className="text-sm text-muted-foreground">
            <span>{t('lastUpdated')}: </span>
            <span>{formatLastUpdated(lastUpdate, locale)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
