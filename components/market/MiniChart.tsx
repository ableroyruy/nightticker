'use client';

import { useEffect, useRef, memo } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  Time,
  ColorType,
  CandlestickSeries,
} from 'lightweight-charts';
import { CandleData } from '@/lib/hooks/useCandleData';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface MiniChartProps {
  candles: CandleData[];
  loading?: boolean;
  error?: string | null;
  width?: number;
  height?: number;
  className?: string;
  isPositive?: boolean;
}

type CandlestickSeriesApi = ReturnType<IChartApi['addSeries']>;

export const MiniChart = memo(function MiniChart({
  candles,
  loading = false,
  error = null,
  width = 120,
  height = 48,
  className,
  isPositive = true,
}: MiniChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<CandlestickSeriesApi | null>(null);

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width,
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'transparent',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      timeScale: {
        visible: false,
        borderVisible: false,
      },
      rightPriceScale: {
        visible: false,
        borderVisible: false,
      },
      leftPriceScale: {
        visible: false,
        borderVisible: false,
      },
      crosshair: {
        mode: 0, // Hidden
        vertLine: { visible: false },
        horzLine: { visible: false },
      },
      handleScale: false,
      handleScroll: false,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [width, height]);

  // Update chart data
  useEffect(() => {
    if (!seriesRef.current || !candles.length) return;

    const chartData: CandlestickData<Time>[] = candles.map((c) => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    seriesRef.current.setData(chartData);

    // Fit content to visible area
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [candles]);

  // Resize chart if dimensions change
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.resize(width, height);
    }
  }, [width, height]);

  if (loading) {
    return (
      <Skeleton
        className={cn('rounded', className)}
        style={{ width, height }}
      />
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center text-xs text-muted-foreground',
          className
        )}
        style={{ width, height }}
      >
        --
      </div>
    );
  }

  if (!candles.length) {
    return (
      <div
        className={cn(
          'flex items-center justify-center text-xs text-muted-foreground',
          className
        )}
        style={{ width, height }}
      >
        No data
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('overflow-hidden', className)}
      style={{ width, height }}
    />
  );
});
