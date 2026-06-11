'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { MarketAsset } from '@/lib/types/market';
import { AssetCard } from './AssetCard';

interface AnimatedAssetGridProps {
  assets: MarketAsset[];
  showRank?: boolean;
  showMarketBadge?: boolean;
  gridId: string;
}

export function AnimatedAssetGrid({
  assets,
  showRank = true,
  showMarketBadge = false,
  gridId,
}: AnimatedAssetGridProps) {
  // Create a map of symbol to current rank
  const rankMap = useMemo(
    () => new Map(assets.map((asset, index) => [asset.symbol, index + 1])),
    [assets]
  );

  return (
    <LayoutGroup id={gridId}>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
        style={{ minHeight: assets.length > 0 ? '180px' : undefined }}
      >
        <AnimatePresence mode="popLayout">
          {assets.map((asset) => (
            <motion.div
              key={`${gridId}-${asset.symbol}`}
              layout
              layoutId={`${gridId}-${asset.symbol}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                layout: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
            >
              <AssetCard
                asset={asset}
                rank={showRank ? rankMap.get(asset.symbol) : undefined}
                showMarketBadge={showMarketBadge}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
