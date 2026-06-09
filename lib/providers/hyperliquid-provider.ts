import { MarketDataProvider, MarketPrice } from './types';

const HYPERLIQUID_API_URL = 'https://api.hyperliquid.xyz/info';

interface HyperliquidAllMidsResponse {
  [symbol: string]: string;
}

interface AssetCtx {
  prevDayPx: string;
  dayNtlVlm: string;
  markPx: string;
  midPx?: string;
  circulatingSupply?: string;
  funding?: string;
  openInterest?: string;
}

interface UniverseItem {
  name: string;
  szDecimals: number;
  maxLeverage?: number;
  onlyIsolated?: boolean;
  isDelisted?: boolean;
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
      // Fetch both allMids and metaAndAssetCtxs in parallel
      const [midsResponse, metaResponse] = await Promise.all([
        fetch(HYPERLIQUID_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'allMids', dex: 'xyz' }),
          next: { revalidate: 30 },
        }),
        fetch(HYPERLIQUID_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'metaAndAssetCtxs', dex: 'xyz' }),
          next: { revalidate: 60 },
        }),
      ]);

      if (!midsResponse.ok) {
        throw new Error(`HTTP error! status: ${midsResponse.status}`);
      }

      const midsData: HyperliquidAllMidsResponse = await midsResponse.json();
      const now = new Date();

      // Process metaAndAssetCtxs for prevDayPx
      const prevDayPxMap: Record<string, number> = {};
      if (metaResponse.ok) {
        try {
          const metaData = await metaResponse.json();
          if (Array.isArray(metaData) && metaData.length >= 2) {
            const universe: UniverseItem[] = metaData[0]?.universe || [];
            const assetCtxs: AssetCtx[] = metaData[1] || [];

            universe.forEach((item, index) => {
              if (assetCtxs[index]) {
                const prevDayPx = parseFloat(assetCtxs[index].prevDayPx);
                if (!isNaN(prevDayPx) && prevDayPx > 0) {
                  prevDayPxMap[`xyz:${item.name}`] = prevDayPx;
                }
              }
            });
          }
        } catch {
          console.error('Failed to parse metaAndAssetCtxs');
        }
      }

      this.cache = {};
      for (const [symbol, priceStr] of Object.entries(midsData)) {
        const price = parseFloat(priceStr);
        const prevDayPx = prevDayPxMap[symbol] ?? null;

        let change24h: number | null = null;
        let changePercent24h: number | null = null;

        if (!isNaN(price) && prevDayPx && prevDayPx > 0) {
          change24h = price - prevDayPx;
          changePercent24h = ((price - prevDayPx) / prevDayPx) * 100;
        }

        this.cache[symbol] = {
          symbol,
          price: isNaN(price) ? null : price,
          prevDayPx,
          change24h,
          changePercent24h,
          lastUpdated: now,
        };
      }

      this.lastFetch = now;
      return this.cache;
    } catch (error) {
      console.error('Failed to fetch Hyperliquid XYZ prices:', error);
      return this.cache; // Return stale cache on error
    }
  }

  async getPrice(symbol: string): Promise<MarketPrice | null> {
    const prices = await this.getAllPrices();
    // Symbol should be in format "xyz:AAPL"
    return prices[symbol] || null;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(HYPERLIQUID_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'allMids', dex: 'xyz' }),
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
