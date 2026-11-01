import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

test('ticker consumers share one connection; refresh preserves newer quote and missing baseline stays null', async () => {
  const sockets = [];
  const subscriptions = [];
  const intervals = [];
  let getSnapshot;
  let requests = 0;
  class Socket {
    static OPEN = 1;
    readyState = 0;
    sent = [];
    constructor() { sockets.push(this); }
    send(data) { this.sent.push(JSON.parse(data)); }
    close() { this.readyState = 3; this.onclose?.(); }
    open() { this.readyState = 1; this.onopen?.(); }
    quote(mids) { this.onmessage?.({ data: JSON.stringify({ channel: 'allMids', data: { mids } }) }); }
  }
  const source = fs.readFileSync('lib/hooks/useHyperliquidTicker.ts', 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const context = {
    exports: {}, WebSocket: Socket, AbortController, setTimeout, clearTimeout,
    setInterval: fn => { intervals.push(fn); return intervals.length; }, clearInterval: () => {},
    require: name => {
      if (name === 'react') return { useSyncExternalStore: (subscribe, get) => { getSnapshot = get; subscriptions.push(subscribe(() => {})); return get(); } };
      if (name.includes('stocks')) return { stocks: [{ hyperliquidSymbol: 'xyz:AAPL' }, { hyperliquidSymbol: 'xyz:MSFT' }] };
      throw Error(name);
    },
    fetch: async () => {
      requests++;
      return { ok: true, headers: { get: name => String(Date.now() - (name === 'X-Data-Timestamp' ? 3000 : 100)) }, json: async () => ({ AAPL: { price: 100, prevDayPx: 90 }, MSFT: { price: 10, prevDayPx: null } }) };
    },
  };
  vm.runInNewContext(code, context);
  context.exports.useHyperliquidTicker();
  context.exports.useHyperliquidTicker();
  assert.equal(sockets.length, 1);
  sockets[0].open();
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(requests, 1);
  sockets[0].quote({ 'xyz:AAPL': '120', 'xyz:MSFT': '11', 'xyz:UNKNOWN': '55' });
  assert.equal(getSnapshot().tickers.AAPL.price, 120);
  assert.equal(getSnapshot().tickers.AAPL.change24h, 30);
  assert.equal(getSnapshot().tickers.MSFT.change24h, null);
  assert.equal(getSnapshot().tickers.UNKNOWN, undefined);
  assert.equal(getSnapshot().status, 'connected');
  sockets[0].onopen();
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(requests, 2);
  assert.equal(getSnapshot().tickers.AAPL.price, 120);
  subscriptions[0]();
  assert.equal(sockets[0].readyState, 1);
  subscriptions[1]();
  await new Promise(resolve => setTimeout(resolve, 5));
  assert.equal(sockets[0].readyState, 3);
  assert.equal(getSnapshot().status, 'disconnected');
});

test('a socket stuck connecting is closed instead of leaving the page connecting forever', () => {
  let now = Date.now();
  let tick;
  let socket;
  let getSnapshot;
  class Clock extends Date { static now() { return now; } }
  class Socket {
    static OPEN = 1;
    static CONNECTING = 0;
    readyState = 0;
    // Capture the constructed fake socket for lifecycle assertions.
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    constructor() { socket = this; }
    close() { this.readyState = 3; this.onclose?.(); }
  }
  const code = ts.transpileModule(fs.readFileSync('lib/hooks/useHyperliquidTicker.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const context = {
    exports: {}, Date: Clock, WebSocket: Socket, AbortController,
    setInterval: fn => { tick = fn; return 1; }, clearInterval: () => {},
    setTimeout: () => 1, clearTimeout: () => {}, fetch: async () => { throw Error('offline'); },
    require: name => name === 'react'
      ? { useSyncExternalStore: (subscribe, get) => { getSnapshot = get; subscribe(() => {}); return get(); } }
      : { stocks: [{ hyperliquidSymbol: 'xyz:AAPL' }] },
  };
  vm.runInNewContext(code, context);
  context.exports.useHyperliquidTicker();
  now += 20000;
  tick();
  assert.equal(socket.readyState, 3);
  assert.equal(getSnapshot().status, 'disconnected');
});
