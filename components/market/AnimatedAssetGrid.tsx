'use client';

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
  const rankMap = new Map(assets.map((asset, index) => [asset.symbol, index + 1]));

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
      style={{ minHeight: assets.length > 0 ? '180px' : undefined }}
    >
      {assets.map((asset) => (
        <div
          key={`${gridId}-${asset.symbol}`}
          className="transition-opacity duration-200"
        >
          <AssetCard
            asset={asset}
            rank={showRank ? rankMap.get(asset.symbol) : undefined}
            showMarketBadge={showMarketBadge}
          />
        </div>
      ))}
    </div>
  );
}
