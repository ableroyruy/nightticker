import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as format from '../lib/chart-format.ts';

function chartHarness(props) {
  const effects = []; const charts = []; const observers = []; const exports = {};
  const refs = [{ current: null }, { current: null }, { current: null }]; let refIndex = 0;
  const element = { clientWidth: 272 };
  const jsx = (type, props) => { if (props.ref) props.ref.current = element; return { type, props }; };
  class ResizeObserver {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe(target) { this.target = target; }
    disconnect() { this.disconnected = true; }
  }
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('components/market/MiniChart.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText, {
    exports, Intl, Date, ResizeObserver,
    require(name) {
      if (name === 'react') return { useRef: () => refs[refIndex++], useMemo: fn => fn(), useEffect: fn => effects.push(fn) };
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
      if (name === 'next-intl') return { useLocale: () => 'ko' };
      if (name === '@/lib/chart-format') return format;
      if (name === '@/lib/utils') return { cn: (...values) => values.filter(Boolean).join(' ') };
      if (name === '@/components/ui/skeleton') return { Skeleton: 'skeleton' };
      if (name === 'lightweight-charts') return {
        ColorType: { Solid: 'solid' }, CandlestickSeries: 'candles', TickMarkType: { DayOfMonth: 2, Month: 1, Year: 0 },
        createChart(container, options) {
          const chart = { container, options, removed: 0, fits: 0, resizes: [],
            addSeries(type, options) { this.series = { type, options, setData: data => { this.data = data; } }; return this.series; },
            timeScale() { return { fitContent: () => this.fits++ }; },
            resize(...args) { this.resizes.push(args); }, remove() { this.removed++; },
          };
          charts.push(chart); return chart;
        },
      };
      throw new Error(`Unexpected import ${name}`);
    },
  });
  const tree = exports.MiniChart(props);
  const cleanups = effects.map(fn => fn());
  return { tree, charts, observers, cleanup: () => cleanups.forEach(fn => fn?.()) };
}
const candles = [{ time: 1793538000, open: 0.000032, high: 0.000033, low: 0.000031, close: 0.0000325, volume: 1 }];

test('detail enables readable axes and horizontal grid while preserving candle precision', () => {
  const h = chartHarness({ candles, variant: 'detail', autoResize: true, height: 300, quoteUnit: 'USD' });
  const chart = h.charts[0];
  assert.equal(chart.options.width, 272);
  assert.equal(chart.options.height, 300);
  assert.equal(chart.options.timeScale.visible, true);
  assert.equal(chart.options.rightPriceScale.visible, true);
  assert.equal(chart.options.leftPriceScale.visible, false);
  assert.equal(chart.options.grid.horzLines.visible, true);
  assert.equal(chart.options.grid.vertLines.visible, false);
  assert.notEqual(chart.options.layout.textColor, 'transparent');
  assert.equal(chart.series.options.lastValueVisible, true);
  assert.notEqual(chart.series.options.priceFormat.formatter(0.000032), chart.series.options.priceFormat.formatter(0.0000325));
  assert.equal(chart.data[0].time, candles[0].time, 'timezone formatting must not shift underlying candle timestamps');
  h.observers[0].callback([{ contentRect: { width: 248 } }]);
  assert.deepEqual(chart.resizes, [[248, 300]]);
  assert.equal(chart.fits, 2);
  h.cleanup();
  assert.equal(chart.removed, 1);
  assert.equal(h.observers[0].disconnected, true);
});

test('compact charts keep axes, grids and last-price markers hidden even with autoResize', () => {
  const h = chartHarness({ candles, autoResize: true, height: 48 });
  const chart = h.charts[0];
  assert.equal(chart.options.timeScale.visible, false);
  assert.equal(chart.options.rightPriceScale.visible, false);
  assert.equal(chart.options.grid.horzLines.visible, false);
  assert.equal(chart.options.grid.vertLines.visible, false);
  assert.equal(chart.series.options.lastValueVisible, false);
  assert.equal(chart.series.options.priceLineVisible, false);
  h.cleanup();
});

test('empty detail charts create no canvas or resize observer and retain status feedback', () => {
  const h = chartHarness({ candles: [], variant: 'detail', autoResize: true, loading: true });
  assert.equal(h.charts.length, 0);
  assert.equal(h.observers.length, 0);
  assert.equal(h.tree.props.role, 'status');
  assert.equal(h.tree.props['aria-busy'], true);
  h.cleanup();
});

test('time-axis spacing accounts for full date and DST offset labels', () => {
  const previousZone = process.env.TZ;
  process.env.TZ = 'America/New_York';
  try {
    const timestamps = ['2026-11-01T05:30:00Z', '2026-11-01T06:30:00Z'].map(value => Date.parse(value) / 1000);
    const data = timestamps.map(time => ({ ...candles[0], time }));
    const h = chartHarness({ candles: data, variant: 'detail', autoResize: true });
    const scale = h.charts[0].options.timeScale;
    for (const time of timestamps) {
      const label = scale.tickMarkFormatter(time, 2);
      assert.ok(label.includes('UTC-0'), 'repeated local hours have explicit offsets');
      assert.ok(scale.tickMarkMaxCharacterLength >= label.length, 'spacing never underestimates date/offset labels');
    }
    h.cleanup();
  } finally {
    if (previousZone === undefined) delete process.env.TZ;
    else process.env.TZ = previousZone;
  }
});
