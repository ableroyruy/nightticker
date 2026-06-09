'use client';

import { useLocale } from 'next-intl';
import { useHyperliquidTicker } from '@/lib/hooks/useHyperliquidTicker';
import { getMarketOrder } from '@/lib/utils/getPreferredMarketOrder';
import { HeroSection } from '@/components/sections/HeroSection';
import { FavoritesSection } from '@/components/sections/FavoritesSection';
import { GainersLosersSection } from '@/components/sections/GainersLosersSection';
import { ComplianceNotice } from '@/components/common/ComplianceNotice';
import { Separator } from '@/components/ui/separator';
import { stocks } from '@/lib/markets/stocks';
import { MarketAsset, MarketType } from '@/lib/types/market';

export function HomePage() {
  const locale = useLocale();
  const { prices, previousPrices, status, lastUpdate } = useHyperliquidTicker();
  const marketOrder = getMarketOrder(locale);

  // Convert stock data to MarketAsset format with live prices
  const allAssets: MarketAsset[] = stocks.map((stock) => {
    const price = prices[stock.hyperliquidSymbol] ?? null;
    const prevPrice = previousPrices[stock.hyperliquidSymbol] ?? null;

    // Calculate change percent (simplified - would need historical data for 24h)
    let changePercent24h: number | null = null;
    if (price !== null && prevPrice !== null && prevPrice !== 0) {
      changePercent24h = ((price - prevPrice) / prevPrice) * 100;
    }

    return {
      symbol: stock.symbol,
      name: stock.name,
      nameKo: stock.nameKo,
      market: stock.category as MarketType,
      price,
      previousPrice: prevPrice,
      changePercent24h,
      volume24h: null,
      hyperliquidSymbol: stock.hyperliquidSymbol,
    };
  });

  // Filter by market
  const krAssets = allAssets.filter((a) => a.market === 'KR');
  const usAssets = allAssets.filter((a) => a.market === 'US');

  // Sort by change percent for gainers/losers
  const getGainers = (assets: MarketAsset[]) =>
    assets
      .filter((a) => a.changePercent24h != null && a.changePercent24h > 0)
      .sort((a, b) => (b.changePercent24h ?? 0) - (a.changePercent24h ?? 0));

  const getLosers = (assets: MarketAsset[]) =>
    assets
      .filter((a) => a.changePercent24h != null && a.changePercent24h < 0)
      .sort((a, b) => (a.changePercent24h ?? 0) - (b.changePercent24h ?? 0));

  const krGainers = getGainers(krAssets);
  const krLosers = getLosers(krAssets);
  const usGainers = getGainers(usAssets);
  const usLosers = getLosers(usAssets);

  // Determine order based on user preference
  const isKrFirst = marketOrder === 'KR_FIRST';

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection connectionStatus={status} lastUpdate={lastUpdate} />

      <div className="container py-8 space-y-12">
        {/* Favorites Section */}
        <FavoritesSection prices={prices} />

        <Separator className="opacity-50" />

        {/* Market Sections - Order based on user preference */}
        {isKrFirst ? (
          <>
            {/* Korea Market */}
            <GainersLosersSection
              market="KR"
              gainers={krGainers}
              losers={krLosers}
              limit={5}
            />

            <Separator className="opacity-50" />

            {/* US Market */}
            <GainersLosersSection
              market="US"
              gainers={usGainers}
              losers={usLosers}
              limit={5}
            />
          </>
        ) : (
          <>
            {/* US Market */}
            <GainersLosersSection
              market="US"
              gainers={usGainers}
              losers={usLosers}
              limit={5}
            />

            <Separator className="opacity-50" />

            {/* Korea Market */}
            <GainersLosersSection
              market="KR"
              gainers={krGainers}
              losers={krLosers}
              limit={5}
            />
          </>
        )}

        <Separator className="opacity-50" />

        {/* Compliance Notice */}
        <ComplianceNotice />
      </div>
    </div>
  );
}
