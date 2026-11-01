import { MarketDataProvider, MarketPrice } from './types';
import { getTicker, stripSymbol } from '../market/data';

export class HyperliquidProvider implements MarketDataProvider {
  async getAllPrices(): Promise<Record<string, MarketPrice>> {
    try {
      const { tickers, timestamp } = await getTicker();
      return Object.fromEntries(Object.entries(tickers).map(([symbol, ticker]) => [
        `xyz:${symbol}`, { ...ticker, symbol: `xyz:${symbol}`, lastUpdated: new Date(timestamp) },
      ]));
    } catch {
      return {};
    }
  }
  async getPrice(symbol: string): Promise<MarketPrice | null> {
    return (await this.getAllPrices())[`xyz:${stripSymbol(symbol)}`] ?? null;
  }
  async isAvailable(): Promise<boolean> {
    try { await getTicker(); return true; } catch { return false; }
  }
}
const provider = new HyperliquidProvider();
export function getHyperliquidProvider(): HyperliquidProvider { return provider; }
