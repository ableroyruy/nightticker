'use client';

import { useRef, useEffect } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollLockRef = useRef(false);
  const lastScrollY = useRef(0);

  // Prevent scroll jumps during layout animations
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollLockRef.current) {
        lastScrollY.current = window.scrollY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Create a map of symbol to current rank for smooth animations
  const rankMap = new Map(assets.map((asset, index) => [asset.symbol, index + 1]));

  return (
    <LayoutGroup id={gridId}>
      <div
        ref={containerRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
        style={{ minHeight: assets.length > 0 ? '180px' : undefined }}
      >
        <AnimatePresence mode="popLayout">
          {assets.map((asset) => (
            <motion.div
              key={`${gridId}-${asset.symbol}`}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                layout: {
                  type: 'spring',
                  stiffness: 350,
                  damping: 30,
                },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 },
              }}
              onLayoutAnimationStart={() => {
                scrollLockRef.current = true;
              }}
              onLayoutAnimationComplete={() => {
                scrollLockRef.current = false;
                // Restore scroll position if it changed during animation
                if (Math.abs(window.scrollY - lastScrollY.current) > 10) {
                  window.scrollTo({ top: lastScrollY.current, behavior: 'instant' });
                }
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
