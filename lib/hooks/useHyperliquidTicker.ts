'use client';

import { useSyncExternalStore } from 'react';
import type { ConnectionStatus } from '@/lib/types/market';
import { stocks } from '@/lib/markets/stocks';

export interface TickerData {
  price: number;
  prevDayPx: number | null;
  change24h: number | null;
  changePercent24h: number | null;
}
interface Snapshot {
  tickers: Record<string, TickerData>;
  status: ConnectionStatus;
  lastUpdate: Date | null;
  error: string | null;
}
const EMPTY: Snapshot = { tickers: {}, status: 'connecting', lastUpdate: null, error: null };
let snapshot = EMPTY;
const listeners = new Set<() => void>();
const allowed = new Set(stocks.map(stock => stock.hyperliquidSymbol.replace(/^xyz:/, '')));
let socket: WebSocket | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let retry: ReturnType<typeof setTimeout> | null = null;
let disposeTimer: ReturnType<typeof setTimeout> | null = null;
let request: Promise<void> | null = null;
let controller: AbortController | null = null;
let lastMessage = 0;
let connectionStarted = 0;
let metaTimestamp = 0;
let lastMetaAttempt = 0;
let generation = 0;
let baselines: Record<string, number | null> = {};

function publish(next: Snapshot) {
  snapshot = next;
  listeners.forEach(listener => listener());
}
function ticker(price: number, baseline: number | null): TickerData {
  const prevDayPx = Date.now() - metaTimestamp < 300000 ? baseline : null;
  const change24h = prevDayPx && prevDayPx > 0 ? price - prevDayPx : null;
  return { price, prevDayPx, change24h, changePercent24h: change24h !== null && prevDayPx ? change24h / prevDayPx * 100 : null };
}
async function refresh() {
  if (request) return request;
  const current = generation;
  lastMetaAttempt = Date.now();
  const abort = new AbortController();
  controller = abort;
  const timeout = setTimeout(() => abort.abort(), 10000);
  request = (async () => {
    try {
      const response = await fetch('/api/market/ticker', { signal: abort.signal });
      if (!response.ok) throw new Error('Market data temporarily unavailable');
      const data: Record<string, TickerData> = await response.json();
      if (generation !== current || !listeners.size) return;
      const stamp = Number(response.headers.get('X-Data-Timestamp'));
      const metaStamp = Number(response.headers.get('X-Meta-Timestamp'));
      if (!Number.isFinite(stamp) || stamp <= 0 || Date.now() - stamp > 60000) throw new Error('Market data is delayed');
      metaTimestamp = Number.isFinite(metaStamp) && metaStamp > 0 ? metaStamp : 0;
      baselines = Object.fromEntries(Object.entries(data).map(([symbol, value]) => [symbol, value.prevDayPx]));
      // Never replace a newer WebSocket quote with an older HTTP cache snapshot.
      const live = lastMessage > stamp;
      const source = live ? snapshot.tickers : data;
      const tickers: Record<string, TickerData> = {};
      for (const [symbol, value] of Object.entries(source)) {
        if (allowed.has(symbol) && Number.isFinite(value.price) && value.price > 0) tickers[symbol] = ticker(value.price, baselines[symbol] ?? null);
      }
      publish({ tickers, lastUpdate: live ? snapshot.lastUpdate : new Date(stamp), status: live && socket?.readyState === WebSocket.OPEN ? 'connected' : 'disconnected', error: live ? null : 'Waiting for live prices' });
    } catch {
      if (generation === current && listeners.size && Date.now() - lastMessage > 45000) publish({ ...snapshot, status: 'disconnected', error: 'Market data temporarily unavailable' });
    } finally {
      clearTimeout(timeout);
      if (generation === current) { request = null; controller = null; }
    }
  })();
  return request;
}
function connect() {
  if (!listeners.size || socket) return;
  const current = generation;
  const ws = new WebSocket('wss://api.hyperliquid.xyz/ws');
  socket = ws;
  connectionStarted = Date.now();
  ws.onopen = () => {
    if (current !== generation) return;
    ws.send(JSON.stringify({ method: 'subscribe', subscription: { type: 'allMids', dex: 'xyz' } }));
    void refresh();
  };
  ws.onmessage = event => {
    if (current !== generation) return;
    try {
      const message = JSON.parse(event.data);
      if (message.channel !== 'allMids' || !message.data?.mids) return;
      const tickers: Record<string, TickerData> = {};
      for (const [raw, value] of Object.entries(message.data.mids)) {
        const symbol = raw.replace(/^xyz:/, '');
        const price = Number(value);
        if (allowed.has(symbol) && Number.isFinite(price) && price > 0) tickers[symbol] = ticker(price, baselines[symbol] ?? null);
      }
      if (!Object.keys(tickers).length) return;
      lastMessage = Date.now();
      publish({ tickers, status: 'connected', lastUpdate: new Date(lastMessage), error: null });
    } catch { /* Ignore non-price messages. */ }
  };
  ws.onerror = () => ws.close();
  ws.onclose = () => {
    if (current !== generation) return;
    socket = null;
    publish({ ...snapshot, status: 'disconnected', error: 'Live connection interrupted' });
    if (listeners.size) retry = setTimeout(() => { retry = null; connect(); }, 3000);
  };
}
function stop() {
  generation++;
  controller?.abort(); controller = null; request = null;
  if (timer) clearInterval(timer);
  if (retry) clearTimeout(retry);
  timer = null; retry = null;
  const ws = socket; socket = null;
  if (ws) { ws.onclose = null; ws.close(); }
  publish({ ...snapshot, status: 'disconnected' });
}
function subscribe(listener: () => void) {
  if (disposeTimer) { clearTimeout(disposeTimer); disposeTimer = null; }
  listeners.add(listener);
  if (!timer) {
    if (snapshot.lastUpdate && Date.now() - snapshot.lastUpdate.getTime() >= 60000) snapshot = EMPTY;
    void refresh(); connect();
    timer = setInterval(() => {
      if (Date.now() - lastMetaAttempt >= 60000) void refresh();
      if (socket?.readyState === WebSocket.CONNECTING && Date.now() - connectionStarted > 15000) socket.close();
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ method: 'ping' }));
        if (Date.now() - Math.max(lastMessage, connectionStarted) > 45000) socket.close();
      }
      if (snapshot.lastUpdate && Date.now() - snapshot.lastUpdate.getTime() >= 60000) publish({ ...EMPTY, status: 'disconnected', error: 'Prices are delayed' });
    }, 10000);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) disposeTimer = setTimeout(stop, 0);
  };
}
export function useHyperliquidTicker(): Snapshot {
  return useSyncExternalStore(subscribe, () => snapshot, () => EMPTY);
}
