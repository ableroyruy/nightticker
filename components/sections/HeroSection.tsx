'use client';

import { ConnectionStatus } from '@/components/ui/connection-status';
import { StockSearch } from '@/components/market/StockSearch';
import { InstallButton } from '@/components/common/InstallButton';
import { ConnectionStatus as ConnectionStatusType } from '@/lib/types/market';

interface HeroSectionProps {
  connectionStatus: ConnectionStatusType;
  lastUpdate: Date | null;
}

export function HeroSection({ connectionStatus, lastUpdate }: HeroSectionProps) {
  return (
    <section className="container pt-6 pb-4">
      <div className="flex justify-center">
        <StockSearch />
      </div>
      <div className="flex justify-center items-center gap-4 mt-3">
        <ConnectionStatus status={connectionStatus} lastUpdate={lastUpdate} />
        <InstallButton />
      </div>
    </section>
  );
}
