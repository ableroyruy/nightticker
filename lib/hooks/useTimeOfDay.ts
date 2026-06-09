'use client';

import { useState, useEffect } from 'react';

export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

export interface TimeInfo {
  timeOfDay: TimeOfDay;
  localTime: string;
  timezone: string;
  hour: number;
}

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'day';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function formatTime(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

export function useTimeOfDay(locale: string = 'en'): TimeInfo {
  const [timeInfo, setTimeInfo] = useState<TimeInfo>(() => {
    const now = new Date();
    const hour = now.getHours();
    return {
      timeOfDay: getTimeOfDay(hour),
      localTime: formatTime(now, locale),
      timezone: getTimezone(),
      hour,
    };
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      setTimeInfo({
        timeOfDay: getTimeOfDay(hour),
        localTime: formatTime(now, locale),
        timezone: getTimezone(),
        hour,
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [locale]);

  return timeInfo;
}
