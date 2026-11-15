import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

test('an unavailable chart retries in ten seconds, retains good candles on failure and cleans up', async () => {
  let now = 1_800_000_000_000;
  let state, effect, timerId = 0, calls = 0;
  let fail = true;
  const timers = new Map();
  const events = new Map();
  const document = { visibilityState: 'visible', addEventListener: (name, fn) => events.set(name, fn), removeEventListener: name => events.delete(name) };
  class Clock extends Date { static now() { return now; } }
  const candles = [{ time: 1000, open: 1, high: 2, low: 1, close: 2, volume: 3 }];
  const context = {
    exports: {}, Date: Clock, document, AbortSignal,
    setTimeout(fn, delay) { timers.set(++timerId, { fn, delay }); return timerId; },
    clearTimeout: id => timers.delete(id),
    require: () => ({ useState: init => { state = init(); return [state, next => { state = next; }]; }, useEffect: fn => { effect = fn; } }),
    fetch: async () => {
      calls++;
      if (fail) throw Error('temporary network failure');
      return { ok: true, headers: { get: name => name === 'X-Data-Timestamp' ? String(now) : 'false' }, json: async () => ({ AAPL: candles }) };
    },
  };
  const code = ts.transpileModule(fs.readFileSync('lib/hooks/useCandleData.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, context);
  const settle = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
  const fire = async delay => {
    const timer = [...timers].find(([, value]) => value.delay === delay);
    assert.ok(timer, `expected ${delay}ms timer`);
    timers.delete(timer[0]); now += delay; timer[1].fn(); await settle();
  };
  context.exports.useCandleData('AAPL');
  const cleanup = effect(); await settle();
  await fire(50);
  assert.equal(state.error, 'Chart data temporarily unavailable');
  assert.equal(calls, 1);
  fail = false;
  await fire(10000); await fire(50);
  assert.equal(state.error, null);
  assert.equal(state.candles[0].close, 2);
  assert.equal(calls, 2);
  fail = true;
  await fire(300000); await fire(50);
  assert.equal(state.error, 'Chart data temporarily unavailable');
  assert.equal(state.candles[0].close, 2, 'a temporary failure retains the existing chart');
  document.visibilityState = 'hidden';
  await fire(10000);
  assert.equal(calls, 3, 'hidden tabs do not issue retry requests');
  document.visibilityState = 'visible';
  fail = false;
  events.get('visibilitychange')(); await settle(); await fire(50);
  assert.equal(state.error, null, 'returning to the tab recovers without waiting five minutes');
  cleanup();
  assert.equal(timers.size, 0);
  assert.equal(events.size, 0);
});
