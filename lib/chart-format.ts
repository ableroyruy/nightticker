/** Display helpers only: candle timestamps remain Unix seconds. */
type ChartCandle = { readonly open: number; readonly high: number; readonly low: number; readonly close: number; readonly time: number };

export function chartPriceFormat(candles: readonly ChartCandle[], locale: string): { type: 'custom'; minMove: number; formatter: (price: number) => string } {
  const values = candles.flatMap(candle => [candle.open, candle.high, candle.low, candle.close]).filter(Number.isFinite);
  const low = values.length ? Math.min(...values) : 0;
  const high = values.length ? Math.max(...values) : 0;
  const magnitude = Math.max(Math.abs(low), Math.abs(high));
  const range = high - low;
  // Preserve small quotes and about 100 distinguishable steps within a narrow range.
  const magnitudeDigits = magnitude > 0 && magnitude < 1 ? Math.ceil(-Math.log10(magnitude)) + 4 : 2;
  const rangeDigits = range > 0 ? Math.ceil(-Math.log10(range / 100)) : 2;
  const digits = Math.min(12, Math.max(2, magnitudeDigits, rangeDigits));
  const numberFormat = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: digits });
  return { type: 'custom', minMove: 10 ** -digits, formatter: price => Number.isFinite(price) ? numberFormat.format(Object.is(price, -0) ? 0 : price) : '—' };
}

function utcOffset(epochSeconds: number, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' }).formatToParts(new Date(epochSeconds * 1000));
  const offset = parts.find(part => part.type === 'timeZoneName')?.value ?? 'GMT';
  return offset === 'GMT' ? 'UTC+00:00' : offset.replace('GMT', 'UTC');
}

function wallTime(epochSeconds: number, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(epochSeconds * 1000));
}

export function chartTimeLabel(epochSeconds: number, locale: string, timeZone: string, includeDate = false): string {
  const formatted = new Intl.DateTimeFormat(locale, {
    timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    ...(includeDate ? { month: '2-digit', day: '2-digit' } as const : {}),
  }).format(new Date(epochSeconds * 1000));
  // Repeated wall-clock minutes at a DST rollback need their individual offsets.
  const wall = wallTime(epochSeconds, timeZone);
  const repeated = [-120, -90, -60, -30, 30, 60, 90, 120].some(minutes => wallTime(epochSeconds + minutes * 60, timeZone) === wall);
  return repeated ? `${formatted} ${utcOffset(epochSeconds, timeZone)}` : formatted;
}

export function chartTimeZoneLabel(firstEpoch: number, lastEpoch: number, _locale: string, timeZone: string): string {
  const first = utcOffset(firstEpoch, timeZone);
  const last = utcOffset(lastEpoch, timeZone);
  return `${timeZone} · ${first === last ? first : `${first} → ${last}`}`;
}
