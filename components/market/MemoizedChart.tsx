'use client';

import { memo } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { useCandleData } from '@/lib/hooks/useCandleData';

const MiniChart = dynamic(() => import('./MiniChart').then((mod) => mod.MiniChart), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-12 rounded" />,
});

interface MemoizedChartProps {
  symbol: string;
  isPositive: boolean;
  width?: number;
  height?: number;
}

// 심볼이 같으면 리렌더링하지 않음
export const MemoizedChart = memo(function MemoizedChart({
  symbol,
  isPositive,
  width = 180,
  height = 72,
}: MemoizedChartProps) {
  const { candles, loading, error } = useCandleData(symbol);

  return (
    <MiniChart
      candles={candles}
      loading={loading}
      error={error}
      width={width}
      height={height}
      isPositive={isPositive}
    />
  );
}, (prevProps, nextProps) => {
  // symbol과 isPositive가 같으면 리렌더링 안함
  return prevProps.symbol === nextProps.symbol &&
         prevProps.isPositive === nextProps.isPositive;
});
