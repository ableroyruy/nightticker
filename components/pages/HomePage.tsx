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
      slug: stock.slug,
      market: stock.category as MarketType,
      price: ticker?.price ?? null,
      prevDayPx: ticker?.prevDayPx ?? null,
      change24h: ticker?.change24h ?? null,
      changePercent24h: ticker?.changePercent24h ?? null,
      hyperliquidSymbol: stock.hyperliquidSymbol,
    };
  });

  // Filter by market (exclude INDEX for gainers/losers sections)
  const krAssets = allAssets.filter((a) => a.market === 'KR');
  const usAssets = allAssets.filter((a) => a.market === 'US');
  const jpAssets = allAssets.filter((a) => a.market === 'JP');

  // Sort by 24h change percent for gainers/losers
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
  const jpGainers = getGainers(jpAssets);
  const jpLosers = getLosers(jpAssets);

  // Determine order based on user's language preference
  const isKrFirst = marketOrder === 'KR_FIRST';
  const isJpFirst = locale === 'ja';

  // Build market sections in order
  const marketSections = [
    { market: 'US' as MarketType, gainers: usGainers, losers: usLosers },
    { market: 'KR' as MarketType, gainers: krGainers, losers: krLosers },
    { market: 'JP' as MarketType, gainers: jpGainers, losers: jpLosers },
  ];

  // Reorder based on locale
  if (isJpFirst) {
    const jpSection = marketSections.find(s => s.market === 'JP')!;
    const others = marketSections.filter(s => s.market !== 'JP');
    marketSections.length = 0;
    marketSections.push(jpSection, ...others);
  } else if (isKrFirst) {
    const krSection = marketSections.find(s => s.market === 'KR')!;
    const others = marketSections.filter(s => s.market !== 'KR');
    marketSections.length = 0;
    marketSections.push(krSection, ...others);
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection connectionStatus={status} lastUpdate={lastUpdate} />

      <div className="container py-8 space-y-12">
        {/* Favorites Section */}
        <FavoritesSection tickers={tickers} />

        <Separator className="opacity-30" />

        {/* Market Sections - Order based on user preference */}
        {marketSections.map((section, index) => (
          <div key={section.market}>
            <GainersLosersSection
              market={section.market}
              gainers={section.gainers}
              losers={section.losers}
              limit={10}
            />
            {index < marketSections.length - 1 && (
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
