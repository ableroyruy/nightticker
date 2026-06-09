'use client';

import { useEffect, useState } from 'react';
import { Sun, Sunrise, Sunset, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 9) return 'morning';
  if (hour >= 9 && hour < 17) return 'day';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

const timeConfig: Record<
  TimeOfDay,
  {
    icon: typeof Sun;
    gradient: string;
    glow: string;
    label: string;
    labelKo: string;
  }
> = {
  morning: {
    icon: Sunrise,
    gradient: 'from-amber-400 to-orange-500',
    glow: 'shadow-amber-500/30',
    label: 'Morning',
    labelKo: '아침',
  },
  day: {
    icon: Sun,
    gradient: 'from-yellow-400 to-amber-500',
    glow: 'shadow-yellow-500/30',
    label: 'Day',
    labelKo: '낮',
  },
  evening: {
    icon: Sunset,
    gradient: 'from-orange-500 to-rose-500',
    glow: 'shadow-orange-500/30',
    label: 'Evening',
    labelKo: '저녁',
  },
  night: {
    icon: Moon,
    gradient: 'from-indigo-500 to-purple-600',
    glow: 'shadow-indigo-500/30',
    label: 'Night',
    labelKo: '밤',
  },
};

interface TimeIconProps {
  className?: string;
  showLabel?: boolean;
  locale?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TimeIcon({
  className,
  showLabel = false,
  locale = 'en',
  size = 'md',
}: TimeIconProps) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('night');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeOfDay(getTimeOfDay());

    // Update every minute
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div
        className={cn(
          'rounded-xl bg-muted animate-pulse',
          size === 'sm' && 'w-8 h-8',
          size === 'md' && 'w-10 h-10',
          size === 'lg' && 'w-12 h-12',
          className
        )}
      />
    );
  }

  const config = timeConfig[timeOfDay];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'rounded-xl bg-gradient-to-br shadow-lg transition-all duration-500',
          config.gradient,
          config.glow,
          sizeClasses[size]
        )}
      >
        <Icon className={cn('text-white', iconSizes[size])} />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground">
          {locale === 'ko' ? config.labelKo : config.label}
        </span>
      )}
    </div>
  );
}
