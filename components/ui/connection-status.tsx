'use client';

import { useTranslations } from 'next-intl';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConnectionStatus as ConnectionStatusType } from '@/lib/types/market';

interface ConnectionStatusProps {
  status: ConnectionStatusType;
  lastUpdate?: Date | null;
  className?: string;
}

export function ConnectionStatus({
  status,
  lastUpdate,
  className,
}: ConnectionStatusProps) {
  const t = useTranslations('connection');

  const statusConfig = {
    connected: {
      icon: Wifi,
      text: t('connected'),
      className: 'status-connected',
      dotClass: 'bg-green-500',
    },
    connecting: {
      icon: Loader2,
      text: t('connecting'),
      className: 'status-connecting',
      dotClass: 'bg-yellow-500',
    },
    disconnected: {
      icon: WifiOff,
      text: t('disconnected'),
      className: 'status-disconnected',
      dotClass: 'bg-red-500',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 text-xs',
        config.className,
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-75',
            config.dotClass,
            status === 'connected' && 'animate-ping'
          )}
        />
        <span
          className={cn(
            'relative inline-flex h-2 w-2 rounded-full',
            config.dotClass
          )}
        />
      </span>
      <Icon
        className={cn(
          'h-3.5 w-3.5',
          status === 'connecting' && 'animate-spin'
        )}
      />
      <span className="font-medium">{config.text}</span>
      {lastUpdate && status === 'connected' && (
        <span className="text-muted-foreground">
          {lastUpdate.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
