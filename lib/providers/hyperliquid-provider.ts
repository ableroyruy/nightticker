import { MarketDataProvider, MarketPrice } from './types';

const HYPERLIQUID_API_URL = 'https://api.hyperliquid.xyz/info';

interface HyperliquidAllMidsResponse {
  [symbol: string]: string;
}

export class HyperliquidProvider implements MarketDataProvider {
  private cache: Record<string, MarketPrice> = {};
  private lastFetch: Date | null = null;
  private cacheTTL = 30000; // 30 seconds

  async getAllPrices(): Promise<Record<string, MarketPrice>> {
    // Return cached data if still valid
    if (this.lastFetch && Date.now() - this.lastFetch.getTime() < this.cacheTTL) {
      return this.cache;
    }

    try {
      const response = await fetch(HYPERLIQUID_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'allMids' }),
        next: { revalidate: 30 },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: HyperliquidAllMidsResponse = await response.json();
      const now = new Date();

      this.cache = {};
      for (const [symbol, priceStr] of Object.entries(data)) {
        const price = parseFloat(priceStr);
        this.cache[symbol] = {
          symbol,
          price: isNaN(price) ? null : price,
          lastUpdated: now,
        };
      }

      this.lastFetch = now;
      return this.cache;
    } catch (error) {
      console.error('Failed to fetch Hyperliquid prices:', error);
      return this.cache; // Return stale cache on error
    }
  }

  async getPrice(symbol: string): Promise<MarketPrice | null> {
    const prices = await this.getAllPrices();
    return prices[symbol] || null;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(HYPERLIQUID_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'allMids' }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Singleton instance
let providerInstance: HyperliquidProvider | null = null;

export function getHyperliquidProvider(): HyperliquidProvider {
  if (!providerInstance) {
    providerInstance = new HyperliquidProvider();
  }
  return providerInstance;
}
