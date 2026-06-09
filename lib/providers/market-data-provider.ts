import { getHyperliquidProvider } from './hyperliquid-provider';
import { MarketPrice, Stock } from './types';
import { stocks, getStockBySymbol } from '../markets/stocks';

export interface MarketData {
  stock: Stock;
  price: MarketPrice | null;
}

export async function getMarketData(symbol: string): Promise<MarketData | null> {
  const stock = getStockBySymbol(symbol);
  if (!stock) {
    return null;
  }

  const provider = getHyperliquidProvider();
  const price = await provider.getPrice(stock.hyperliquidSymbol);

  return {
    stock,
    price,
  };
}

export async function getAllMarketData(): Promise<MarketData[]> {
  const provider = getHyperliquidProvider();
  const prices = await provider.getAllPrices();

  return stocks.map((stock) => ({
    stock,
    price: prices[stock.hyperliquidSymbol] || null,
  }));
}

export async function getMarketDataByCategory(
  category: 'US' | 'KR' | 'INDEX'
): Promise<MarketData[]> {
  const allData = await getAllMarketData();
  return allData.filter((data) => data.stock.category === category);
}

export async function isMarketDataAvailable(): Promise<boolean> {
  const provider = getHyperliquidProvider();
  return provider.isAvailable();
}
