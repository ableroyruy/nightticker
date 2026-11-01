'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useLocale } from 'next-intl';
import {
  createChart,
  IChartApi,
  CandlestickData,
  Time,
  ColorType,
  CandlestickSeries,
  TickMarkType,
} from 'lightweight-charts';
import { CandleData } from '@/lib/hooks/useCandleData';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { chartPriceFormat, chartTimeLabel, chartTimeZoneLabel } from '@/lib/chart-format';

interface MiniChartProps {
  candles: CandleData[];
  loading?: boolean;
  error?: string | null;
  width?: number;
  height?: number;
  className?: string;
  autoResize?: boolean;
  variant?: 'compact' | 'detail';
  quoteUnit?: string;
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
  variant = 'compact',
  quoteUnit,
}: MiniChartProps) {
  const locale = useLocale();
  const labels = {
    en: { loading: 'Loading chart', empty: 'No chart data yet', unavailable: 'Chart unavailable', delayed: 'Delayed', chart: 'Six-hour price chart with five-minute candles', detail: '5-minute candles · Last 6 hours', compact: '5 min · 6 hours', from: 'First close', to: 'Latest close' },
    ko: { loading: '차트 불러오는 중', empty: '차트 데이터 부족', unavailable: '차트 일시 이용 불가', delayed: '지연', chart: '5분 캔들로 표시한 최근 6시간 가격 차트', detail: '5분 캔들 · 최근 6시간', compact: '5분 · 6시간', from: '첫 종가', to: '마지막 종가' },
    ja: { loading: 'チャート読込中', empty: 'チャートデータ不足', unavailable: 'チャートを取得できません', delayed: '遅延', chart: '5分足で表示した過去6時間の価格チャート', detail: '5分足 · 過去6時間', compact: '5分足 · 6時間', from: '最初の終値', to: '最新の終値' },
    zh: { loading: '正在加载图表', empty: '图表数据不足', unavailable: '图表暂不可用', delayed: '延迟', chart: '最近6小时的5分钟K线价格图表', detail: '5分钟K线 · 最近6小时', compact: '5分钟 · 6小时', from: '首个收盘价', to: '最新收盘价' },
    pt: { loading: 'Carregando gráfico', empty: 'Sem dados suficientes', unavailable: 'Gráfico indisponível', delayed: 'Atrasado', chart: 'Gráfico das últimas seis horas com velas de cinco minutos', detail: 'Velas de 5 min · Últimas 6 horas', compact: '5 min · 6 horas', from: 'Primeiro fechamento', to: 'Último fechamento' },
    es: { loading: 'Cargando gráfico', empty: 'Sin datos suficientes', unavailable: 'Gráfico no disponible', delayed: 'Retrasado', chart: 'Gráfico de las últimas seis horas con velas de cinco minutos', detail: 'Velas de 5 min · Últimas 6 horas', compact: '5 min · 6 horas', from: 'Primer cierre', to: 'Último cierre' },
  }[locale as 'en' | 'ko' | 'ja' | 'zh' | 'pt' | 'es'] ?? { loading: 'Loading chart', empty: 'No chart data yet', unavailable: 'Chart unavailable', delayed: 'Delayed', chart: 'Six-hour price chart with five-minute candles', detail: '5-minute candles · Last 6 hours', compact: '5 min · 6 hours', from: 'First close', to: 'Latest close' };
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<CandlestickSeriesApi | null>(null);
  const detail = variant === 'detail';
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const priceFormat = useMemo(() => chartPriceFormat(candles, locale), [candles, locale]);
  const firstTime = candles[0]?.time ?? 0;
  const lastTime = candles.at(-1)?.time ?? 0;
  const dayFormat = useMemo(() => new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }), [timeZone]);
  const timeCaption = detail && candles.length ? chartTimeZoneLabel(firstTime, lastTime, locale, timeZone) : '';
  const lastPriceLabel = { en: 'Last candle', ko: '마지막 캔들', ja: '最新の足', zh: '最新K线', pt: 'Última vela', es: 'Última vela' }[locale as 'en' | 'ko' | 'ja' | 'zh' | 'pt' | 'es'] ?? 'Last candle';

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
    const formatTick = (time: number, includeDate = false) => {
      const differentDay = dayFormat.format(new Date(time * 1000)) !== dayFormat.format(new Date(firstTime * 1000));
      return chartTimeLabel(time, locale, timeZone, includeDate || differentDay);
    };
    // DST offsets and localized dates can be much longer than HH:mm. Let the
    // time scale reserve enough room rather than drawing overlapping labels.
    const maxTickLength = detail ? Math.max(5, ...candles.map(candle => formatTick(candle.time, true).length)) : 5;

    const chart = createChart(containerRef.current, {
      width: chartWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: detail ? '#94a3b8' : 'transparent',
        fontSize: 11,
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: detail, color: 'rgba(148,163,184,0.10)' },
      },
      timeScale: {
        visible: detail,
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
        ticksVisible: false,
        tickMarkMaxCharacterLength: maxTickLength,
        tickMarkFormatter: (time: Time, type: TickMarkType) => {
          if (typeof time !== 'number') return null;
          return formatTick(time, type === TickMarkType.DayOfMonth || type === TickMarkType.Month || type === TickMarkType.Year);
        },
      },
      rightPriceScale: {
        visible: detail,
        borderVisible: false,
        minimumWidth: detail ? 56 : 0,
        entireTextOnly: true,
        ticksVisible: false,
        scaleMargins: { top: 0.12, bottom: 0.12 },
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
      localization: {
        locale,
        timeFormatter: (time: Time) => typeof time === 'number' ? chartTimeLabel(time, locale, timeZone, true) : '',
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
      priceLineVisible: detail,
      lastValueVisible: detail,
      priceLineColor: 'rgba(148,163,184,0.35)',
      priceFormat,
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
  }, [candles, width, height, autoResize, detail, locale, timeZone, priceFormat, dayFormat, firstTime]);

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
  }, [autoResize, height, candles]);

  const containerStyle = autoResize
    ? { height, width: '100%' }
    : { width, height };

  if (!candles.length) {
    const empty = !error || error === 'No chart data';
    const message = loading ? labels.loading : empty ? labels.empty : labels.unavailable;
    return <div role="status" aria-busy={loading} aria-label={message} style={containerStyle}
      className={cn('relative flex items-center justify-center px-1 text-center text-xs leading-snug text-muted-foreground', className)}>
      {loading ? <><Skeleton className="absolute inset-0 rounded" /><span className="sr-only">{message}</span></> : message}
    </div>;
  }

  return (
    <figure role="group" aria-label={labels.chart} className={cn('m-0 min-w-0 pointer-events-none', className)} style={autoResize ? { width: '100%' } : { width }}>
      <figcaption className={cn('mb-1 text-muted-foreground', detail ? 'flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs' : 'whitespace-nowrap text-[10px] leading-tight')}>
        {detail ? <><span>{labels.detail}</span>{quoteUnit && <span className="min-w-0 break-words text-[11px]">{quoteUnit}</span>}</> : labels.compact}
      </figcaption>
      <div className="relative overflow-hidden" style={containerStyle}>
      <div ref={containerRef} aria-hidden="true" style={containerStyle} className={error ? 'opacity-60' : undefined} />
      <span className="sr-only">{labels.from}: {candles[0].close.toLocaleString(locale, { maximumSignificantDigits: 10 })}. {labels.to}: {candles[candles.length - 1].close.toLocaleString(locale, { maximumSignificantDigits: 10 })}.</span>
      {error && (
        <span role="status" className="absolute right-1 top-0.5 rounded bg-background/90 px-1 text-[10px] text-muted-foreground">
          {labels.delayed}
        </span>
      )}
      </div>
      {detail && <div className="mt-2 space-y-1 text-[11px] leading-relaxed text-muted-foreground">
        <p className="break-words">{timeCaption}</p>
        <p className="flex flex-wrap justify-between gap-x-3 gap-y-1 tabular-nums"><span>{chartTimeLabel(firstTime, locale, timeZone, true)} – {chartTimeLabel(lastTime, locale, timeZone, true)}</span><span>{lastPriceLabel}: {priceFormat.formatter(candles[candles.length - 1].close)}</span></p>
      </div>}
    </figure>
  );
}
