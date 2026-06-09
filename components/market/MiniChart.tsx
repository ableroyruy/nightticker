'use client';

import { useEffect, useRef } from 'react';
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

  // 차트 생성 및 데이터 설정을 하나의 effect로 통합
  useEffect(() => {
    if (!containerRef.current || !candles.length) return;

    // 기존 차트 정리
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
    }

    const chartWidth = autoResize ? containerRef.current.clientWidth : width;

    const chart = createChart(containerRef.current, {
      width: chartWidth,
      height,
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

    // 데이터 설정
    const chartData: CandlestickData<Time>[] = candles.map((c) => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    series.setData(chartData);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [candles, width, height, autoResize]);

  // Resize observer (autoResize 전용)
  useEffect(() => {
    if (!autoResize || !containerRef.current || !chartRef.current) return;

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
  }, [autoResize, height]);

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
      className={cn('overflow-hidden', className)}
      style={containerStyle}
    />
  );
}
