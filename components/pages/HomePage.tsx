'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useHyperliquidTicker } from '@/lib/hooks/useHyperliquidTicker';
import { getMarketOrder } from '@/lib/utils/getPreferredMarketOrder';
import { useSectionOrder, SectionId } from '@/lib/hooks/useSectionOrder';
import { HeroSection } from '@/components/sections/HeroSection';
import { FavoritesSection } from '@/components/sections/FavoritesSection';
import { GainersLosersSection } from '@/components/sections/GainersLosersSection';
import { CategorySection } from '@/components/sections/CategorySection';
import { ComplianceNotice } from '@/components/common/ComplianceNotice';
import { DraggableSection } from '@/components/common/DraggableSection';
import { stocks, getStocksBySectorForCategory } from '@/lib/markets/stocks';
import { MarketAsset, MarketType } from '@/lib/types/market';
import { cn } from '@/lib/utils';
import { RotateCcw, GripVertical } from 'lucide-react';

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

export function HomePage() {
  const locale = useLocale();
  const t = useTranslations();
  const { tickers, status, lastUpdate } = useHyperliquidTicker();
  const { order, updateOrder, resetOrder, isLoaded } = useSectionOrder(locale);
  const [isEditMode, setIsEditMode] = useState(false);

  // Sensors for drag and drop (mouse, touch, keyboard)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

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

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = order.indexOf(active.id as SectionId);
    const newIndex = order.indexOf(over.id as SectionId);

    if (oldIndex !== -1 && newIndex !== -1) {
      updateOrder(arrayMove(order, oldIndex, newIndex));
    }
  };

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
        {/* Edit Mode Toggle */}
        <div className="container flex items-center justify-end gap-2 mb-2">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm',
              'border transition-all duration-200',
              isEditMode
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted/50 hover:bg-muted border-border/50'
            )}
          >
            <GripVertical className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isEditMode ? t('sections.editMode') || 'Done' : t('sections.reorder') || 'Reorder'}
            </span>
          </button>
          {isEditMode && (
            <button
              onClick={resetOrder}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-muted/50 hover:bg-muted border border-border/50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">
                {t('sections.reset') || 'Reset'}
              </span>
            </button>
          )}
        </div>

        {/* Draggable Sections */}
        {isLoaded && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={order}
              strategy={verticalListSortingStrategy}
            >
              {order.map((sectionId) => (
                <DraggableSection
                  key={sectionId}
                  id={sectionId}
                  isDragEnabled={isEditMode}
                  className={cn(
                    'py-8 rounded-3xl transition-all duration-300',
                    sectionBgColors[sectionId],
                    isEditMode && 'ring-2 ring-primary/20 ring-offset-2 ring-offset-background'
                  )}
                >
                  <div className="container">{renderSectionContent(sectionId)}</div>
                </DraggableSection>
              ))}
            </SortableContext>
          </DndContext>
        )}

        {/* Compliance Notice */}
        <div className="container py-8">
          <ComplianceNotice />
        </div>
      </div>
    </div>
  );
}
