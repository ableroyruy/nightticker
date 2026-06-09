'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

interface MarketStatusBadgeProps {
  isOpen: boolean;
}

export function MarketStatusBadge({ isOpen }: MarketStatusBadgeProps) {
  const t = useTranslations('market');

  return (
    <Badge
      variant={isOpen ? 'default' : 'secondary'}
      className={
        isOpen
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      }
    >
      {isOpen ? t('open') : t('closed')}
    </Badge>
  );
}
