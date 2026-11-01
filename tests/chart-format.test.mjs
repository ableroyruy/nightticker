import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const exports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/chart-format.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports, Intl, Date });
const { chartPriceFormat, chartTimeLabel, chartTimeZoneLabel } = exports;
const candle = (low, high = low) => ({ open: low, close: high, low, high, time: 1 });

test('New York rollback preserves distinct repeated minutes and both UTC offsets', () => {
  const first = Date.parse('2026-11-01T05:30:00Z') / 1000;
  const last = Date.parse('2026-11-01T06:30:00Z') / 1000;
  assert.equal(chartTimeZoneLabel(first, last, 'en', 'America/New_York'), 'America/New_York · UTC-04:00 → UTC-05:00');
  assert.match(chartTimeLabel(first, 'en', 'America/New_York'), /01:30 UTC-04:00/);
  assert.match(chartTimeLabel(last, 'en', 'America/New_York'), /01:30 UTC-05:00/);
});

test('Korean midnight uses correct dates, hours, and timezone without shifting epoch', () => {
  const first = Date.parse('2026-11-01T14:55:00Z') / 1000;
  const last = first + 600;
  assert.match(chartTimeLabel(first, 'en-US', 'Asia/Seoul', true), /11\/01.*23:55/);
  assert.match(chartTimeLabel(last, 'en-US', 'Asia/Seoul', true), /11\/02.*00:05/);
  assert.equal(chartTimeZoneLabel(first, last, 'ko', 'Asia/Seoul'), 'Asia/Seoul · UTC+09:00');
  assert.equal(chartTimeZoneLabel(first, last, 'en', 'UTC'), 'UTC · UTC+00:00');
});

test('narrow FX and tiny-price ticks remain distinct with matching minMove', () => {
  for (const [low, high] of [[1.072345, 1.072355], [0.000000123451, 0.000000123459], [0.00012, 0.0001201]]) {
    const format = chartPriceFormat([candle(low, high)], 'en-US');
    assert.notEqual(format.formatter(low), format.formatter(high));
    assert.notEqual(format.formatter(low), format.formatter(low + format.minMove));
    assert.ok(format.minMove >= 1e-12 && format.minMove <= 0.01);
  }
});

test('large index, flat, single, zero and empty series format finite values cleanly', () => {
  const index = chartPriceFormat([candle(45678.25, 45999.5)], 'en-US');
  assert.equal(index.formatter(45678.25), '45,678.25');
  assert.equal(chartPriceFormat([candle(1234.5)], 'pt-BR').formatter(1234.5), '1.234,50');
  for (const candles of [[], [candle(0)], [candle(7.5)]]) {
    const format = chartPriceFormat(candles, 'en');
    assert.equal(format.type, 'custom');
    assert.equal(format.minMove, 0.01);
    assert.equal(format.formatter(-0), '0.00');
    assert.equal(format.formatter(NaN), '—');
  }
});

test('all supported locales produce date/time labels in an explicit zone', () => {
  const epoch = Date.parse('2026-10-31T12:34:00Z') / 1000;
  for (const locale of ['en', 'ko', 'ja', 'zh', 'pt', 'es']) {
    assert.match(chartTimeLabel(epoch, locale, 'UTC'), /12:34/);
    assert.ok(chartTimeLabel(epoch, locale, 'UTC', true).length > chartTimeLabel(epoch, locale, 'UTC').length);
  }
  assert.throws(() => chartTimeLabel(epoch, 'en', 'Invalid/Zone'), RangeError);
});
