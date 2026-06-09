'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  IChartApi,
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
  autoResize?: boolean;
}

type CandlestickSeriesApi = ReturnType<IChartApi['addSeries']>;

export function MiniChart({
  candles,
  loading = false,
  error = null,
  width = 120,
  height = 48,
  className,
  autoResize = false,
}: MiniChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<CandlestickSeriesApi | null>(null);
  // 차트 준비 상태를 state로 추적
  const [chartReady, setChartReady] = useState(false);

  // Initialize chart - 한 번만 실행
  useEffect(() => {
    if (!containerRef.current) return;

    // 이미 차트가 있으면 스킵
    if (chartRef.current) return;

    const chartWidth = autoResize ? containerRef.current.clientWidth : width;
    const chartHeight = height;

    const chart = createChart(containerRef.current, {
      width: chartWidth,
      height: chartHeight,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'transparent',
        attributionLogo: false,
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
        mode: 0,
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
      priceLineVisible: false,
      lastValueVisible: false,
    });

    chartRef.current = chart;
    seriesRef.current = series;
    setChartReady(true);

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      setChartReady(false);
    };
  }, [width, height, autoResize]);

  // Update chart data - chartReady 상태에 의존
  useEffect(() => {
    if (!chartReady || !seriesRef.current || !candles.length) return;

    const chartData: CandlestickData<Time>[] = candles.map((c) => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    seriesRef.current.setData(chartData);

    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [candles, chartReady]);

  // Resize chart
  useEffect(() => {
    if (!chartRef.current || !containerRef.current) return;

    if (autoResize) {
      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry && chartRef.current) {
          const newWidth = entry.contentRect.width;
          if (newWidth > 0) {
            chartRef.current.resize(newWidth, height);
            chartRef.current.timeScale().fitContent();
          }
        }
      });

      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    } else {
      chartRef.current.resize(width, height);
    }
  }, [width, height, autoResize]);

  const containerStyle = autoResize
    ? { height, width: '100%' }
    : { width, height };

  if (loading) {
    return (
      <Skeleton
        className={cn('rounded', className)}
        style={containerStyle}
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
        style={containerStyle}
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
        style={containerStyle}
      >
        No data
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('overflow-hidden pointer-events-none', className)}
      style={containerStyle}
    />
  );
}
