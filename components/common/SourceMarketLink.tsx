'use client';

import { ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ReferralDisclosure } from './ReferralDisclosure';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

interface SourceMarketLinkProps {
  symbol: string;
  variant?: 'default' | 'outline';
  showDisclosure?: boolean;
}

export function SourceMarketLink({
  symbol,
  variant = 'default',
  showDisclosure = true,
}: SourceMarketLinkProps) {
  const t = useTranslations('market');
  const referralUrl = process.env.NEXT_PUBLIC_HYPERLIQUID_REFERRAL_URL;

  // Use referral URL directly (join URL handles referral tracking)
  const marketUrl = referralUrl || '#';

  return (
    <div className="space-y-2">
      <a
        href={marketUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ variant }), 'gap-2 inline-flex')}
      >
        {t('viewOnHyperliquid')}
        <ExternalLink className="h-4 w-4" />
      </a>
      {showDisclosure && <ReferralDisclosure />}
    </div>
  );
}
