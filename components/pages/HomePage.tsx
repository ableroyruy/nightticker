'use client';

import { useLocale } from 'next-intl';
import { useHyperliquidTicker } from '@/lib/hooks/useHyperliquidTicker';
import { getMarketOrder } from '@/lib/utils/getPreferredMarketOrder';
import { HeroSection } from '@/components/sections/HeroSection';
import { FavoritesSection } from '@/components/sections/FavoritesSection';
import { GainersLosersSection } from '@/components/sections/GainersLosersSection';
import { CategorySection } from '@/components/sections/CategorySection';
import { ComplianceNotice } from '@/components/common/ComplianceNotice';
import { Separator } from '@/components/ui/separator';
import { stocks, getStocksBySectorForCategory } from '@/lib/markets/stocks';
import { MarketAsset, MarketType } from '@/lib/types/market';

export function HomePage() {
  const locale = useLocale();
  const { tickers, status, lastUpdate } = useHyperliquidTicker();
  const marketOrder = getMarketOrder(locale);

  // Convert stock data to MarketAsset format with live prices and 24h data
  const allAssets: MarketAsset[] = stocks.map((stock) => {
    // Ticker keys don't have 'xyz:' prefix - just the symbol
    const tickerKey = stock.hyperliquidSymbol.replace('xyz:', '');
    const ticker = tickers[tickerKey];

    return {
      symbol: stock.symbol,
      name: stock.name,
      nameKo: stock.nameKo,
      nameJa: stock.nameJa,
      nameZh: stock.nameZh,
      namePt: stock.namePt,
      nameEs: stock.nameEs,
      slug: stock.slug,
      market: stock.category as MarketType,
      price: ticker?.price ?? null,
      prevDayPx: ticker?.prevDayPx ?? null,
      change24h: ticker?.change24h ?? null,
      changePercent24h: ticker?.changePercent24h ?? null,
      hyperliquidSymbol: stock.hyperliquidSymbol,
    };
  });

  // Filter by market
  const krAssets = allAssets.filter((a) => a.market === 'KR');
  const usAssets = allAssets.filter((a) => a.market === 'US');
  const indexAssets = allAssets.filter((a) => a.market === 'INDEX');
  const etfAssets = allAssets.filter((a) => a.market === 'ETF');
  const commodityAssets = allAssets.filter((a) => a.market === 'COMMODITY');
  const fxAssets = allAssets.filter((a) => a.market === 'FX');

  // Semiconductor stocks (cross-market sector)
  const semiconductorStocks = getStocksBySectorForCategory('Semiconductors');
  const semiconductorAssets: MarketAsset[] = semiconductorStocks.map((stock) => {
    const tickerKey = stock.hyperliquidSymbol.replace('xyz:', '');
    const ticker = tickers[tickerKey];
    return {
      symbol: stock.symbol,
      name: stock.name,
      nameKo: stock.nameKo,
      nameJa: stock.nameJa,
      slug: stock.slug,
      market: 'SEMICONDUCTOR' as MarketType,
      price: ticker?.price ?? null,
      prevDayPx: ticker?.prevDayPx ?? null,
      change24h: ticker?.change24h ?? null,
      changePercent24h: ticker?.changePercent24h ?? null,
      hyperliquidSymbol: stock.hyperliquidSymbol,
    };
  });

  // Sort by 24h change percent for gainers/losers (US/KR stocks only)
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

  // Determine order based on user's language preference
  const isKrFirst = marketOrder === 'KR_FIRST';

  // Stock sections (US/KR) with gainers/losers - limit 3
  const stockSections = [
    { market: 'US' as MarketType, gainers: usGainers, losers: usLosers },
    { market: 'KR' as MarketType, gainers: krGainers, losers: krLosers },
  ];

  // Reorder stock sections based on locale
  if (isKrFirst) {
    const krSection = stockSections.find((s) => s.market === 'KR')!;
    const others = stockSections.filter((s) => s.market !== 'KR');
    stockSections.length = 0;
    stockSections.push(krSection, ...others);
  }

  // Category sections (INDEX, ETF, COMMODITY, FX, SEMICONDUCTOR) - show all sorted by change%
  const categorySections: { market: MarketType; assets: MarketAsset[] }[] = [
    { market: 'SEMICONDUCTOR', assets: semiconductorAssets },
    { market: 'INDEX', assets: indexAssets },
    { market: 'ETF', assets: etfAssets },
    { market: 'COMMODITY', assets: commodityAssets },
    { market: 'FX', assets: fxAssets },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection connectionStatus={status} lastUpdate={lastUpdate} />

      <div className="container py-8 space-y-12">
        {/* Favorites Section */}
        <FavoritesSection tickers={tickers} />

        <Separator className="opacity-30" />

        {/* Stock Sections (US/KR) - Gainers/Losers with limit 3 */}
        {stockSections.map((section, index) => (
          <div key={section.market}>
            <GainersLosersSection
              market={section.market}
              gainers={section.gainers}
              losers={section.losers}
              limit={5}
            />
            {index < stockSections.length - 1 && (
              <Separator className="opacity-30 mt-12" />
            )}
          </div>
        ))}

        <Separator className="opacity-30" />

        {/* Category Sections (INDEX, ETF, COMMODITY, FX) - All items sorted by change% */}
        {categorySections.map((section, index) => (
          <div key={section.market}>
            <CategorySection market={section.market} assets={section.assets} />
            {index < categorySections.length - 1 && (
              <Separator className="opacity-30 mt-12" />
            )}
          </div>
        ))}

        <Separator className="opacity-30" />

        {/* Compliance Notice */}
        <ComplianceNotice />
      </div>
    </div>
  );
}
