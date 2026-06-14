'use client';

import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import { useHyperliquidTicker } from '@/lib/hooks/useHyperliquidTicker';
import { HeroSection } from '@/components/sections/HeroSection';
import { FavoritesSection } from '@/components/sections/FavoritesSection';
import { GainersLosersSection } from '@/components/sections/GainersLosersSection';
import { CategorySection } from '@/components/sections/CategorySection';
import { ComplianceNotice } from '@/components/common/ComplianceNotice';
import { stocks, getStocksBySectorForCategory } from '@/lib/markets/stocks';
import { MarketAsset, MarketType } from '@/lib/types/market';
import { cn } from '@/lib/utils';

type SectionId = 'favorites' | 'KR' | 'US' | 'SEMICONDUCTOR' | 'INDEX' | 'ETF' | 'COMMODITY' | 'FX';

// Section background colors - alternating warm/cool for better contrast
const sectionBgColors: Record<SectionId, string> = {
  favorites: 'bg-gradient-to-br from-amber-500/8 to-orange-500/5',
  KR: 'bg-gradient-to-br from-blue-500/8 to-indigo-500/5',
  US: 'bg-gradient-to-br from-purple-500/8 to-violet-500/5',
  SEMICONDUCTOR: 'bg-gradient-to-br from-cyan-500/8 to-teal-500/5',
  INDEX: 'bg-gradient-to-br from-emerald-500/8 to-green-500/5',
  ETF: 'bg-gradient-to-br from-rose-500/8 to-pink-500/5',
  COMMODITY: 'bg-gradient-to-br from-yellow-500/8 to-amber-500/5',
  FX: 'bg-gradient-to-br from-sky-500/8 to-blue-500/5',
};

// Fixed section order based on locale
const getSectionOrder = (locale: string): SectionId[] => {
  if (locale === 'ko') {
    return ['favorites', 'KR', 'US', 'SEMICONDUCTOR', 'INDEX', 'ETF', 'COMMODITY', 'FX'];
  }
  return ['favorites', 'US', 'KR', 'SEMICONDUCTOR', 'INDEX', 'ETF', 'COMMODITY', 'FX'];
};

export function HomePage() {
  const locale = useLocale();
  const { tickers, status, lastUpdate } = useHyperliquidTicker();
  const sectionOrder = getSectionOrder(locale);

  // Convert stock data to MarketAsset format with live prices and 24h data
  const allAssets: MarketAsset[] = useMemo(
    () =>
      stocks.map((stock) => {
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
      }),
    [tickers]
  );

  // Filter by market
  const assetsByMarket = useMemo(() => {
    const krAssets = allAssets.filter((a) => a.market === 'KR');
    const usAssets = allAssets.filter((a) => a.market === 'US');
    const indexAssets = allAssets.filter((a) => a.market === 'INDEX');
    const etfAssets = allAssets.filter((a) => a.market === 'ETF');
    const commodityAssets = allAssets.filter((a) => a.market === 'COMMODITY');
    const fxAssets = allAssets.filter((a) => a.market === 'FX');

    // Semiconductor stocks (cross-market sector)
    const semiconductorStocks = getStocksBySectorForCategory('Semiconductors');
    const semiconductorAssets: MarketAsset[] = semiconductorStocks.map(
      (stock) => {
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
      }
    );

    return {
      KR: krAssets,
      US: usAssets,
      INDEX: indexAssets,
      ETF: etfAssets,
      COMMODITY: commodityAssets,
      FX: fxAssets,
      SEMICONDUCTOR: semiconductorAssets,
    };
  }, [allAssets, tickers]);

  // Sort by 24h change percent for gainers/losers
  const getGainers = (assets: MarketAsset[]) =>
    assets
      .filter((a) => a.changePercent24h != null && a.changePercent24h > 0)
      .sort((a, b) => (b.changePercent24h ?? 0) - (a.changePercent24h ?? 0));

  const getLosers = (assets: MarketAsset[]) =>
    assets
      .filter((a) => a.changePercent24h != null && a.changePercent24h < 0)
      .sort((a, b) => (a.changePercent24h ?? 0) - (b.changePercent24h ?? 0));

  // Render section content based on ID
  const renderSectionContent = (sectionId: SectionId) => {
    if (sectionId === 'favorites') {
      return <FavoritesSection tickers={tickers} />;
    }

    if (sectionId === 'US' || sectionId === 'KR') {
      const assets = assetsByMarket[sectionId];
      return (
        <GainersLosersSection
          market={sectionId as MarketType}
          gainers={getGainers(assets)}
          losers={getLosers(assets)}
          limit={5}
        />
      );
    }

    // Category sections
    const assets = assetsByMarket[sectionId] || [];
    return <CategorySection market={sectionId as MarketType} assets={assets} />;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection connectionStatus={status} lastUpdate={lastUpdate} />

      <div className="py-4 space-y-2">
        {/* Sections */}
        {sectionOrder.map((sectionId) => (
          <div
            key={sectionId}
            className={cn(
              'py-4 rounded-3xl transition-all duration-300',
              sectionBgColors[sectionId]
            )}
          >
            <div className="container">{renderSectionContent(sectionId)}</div>
          </div>
        ))}

        {/* Compliance Notice */}
        <div className="container py-8">
          <ComplianceNotice />
        </div>
      </div>
    </div>
  );
}
