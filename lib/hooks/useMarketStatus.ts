'use client';

import { useState, useEffect } from 'react';

export interface MarketStatus {
  name: string;
  nameKo: string;
  isOpen: boolean;
  currentTime: string;
  nextEvent: string;
  nextEventTime: string;
}

interface MarketConfig {
  name: string;
  nameKo: string;
  timezone: string;
  openHour: number;
  openMinute: number;
  closeHour: number;
  closeMinute: number;
  tradingDays: number[]; // 0 = Sunday, 6 = Saturday
}

const US_MARKET: MarketConfig = {
  name: 'US Market',
  nameKo: '미국 시장',
  timezone: 'America/New_York',
  openHour: 9,
  openMinute: 30,
  closeHour: 16,
  closeMinute: 0,
  tradingDays: [1, 2, 3, 4, 5],
};

const KR_MARKET: MarketConfig = {
  name: 'Korea Market',
  nameKo: '한국 시장',
  timezone: 'Asia/Seoul',
  openHour: 9,
  openMinute: 0,
  closeHour: 15,
  closeMinute: 30,
  tradingDays: [1, 2, 3, 4, 5],
};

function getMarketTime(timezone: string): { hour: number; minute: number; dayOfWeek: number; timeStr: string } {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'short',
  });

  const parts = formatter.formatToParts(now);
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
  const weekday = parts.find(p => p.type === 'weekday')?.value || '';

  const dayMap: Record<string, number> = {
    'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
  };

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return {
    hour,
    minute,
    dayOfWeek: dayMap[weekday] ?? 0,
    timeStr: timeFormatter.format(now),
  };
}

function isMarketOpen(market: MarketConfig): boolean {
  const { hour, minute, dayOfWeek } = getMarketTime(market.timezone);

  if (!market.tradingDays.includes(dayOfWeek)) {
    return false;
  }

  const currentMinutes = hour * 60 + minute;
  const openMinutes = market.openHour * 60 + market.openMinute;
  const closeMinutes = market.closeHour * 60 + market.closeMinute;

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

function getNextEvent(market: MarketConfig, locale: string): { event: string; time: string } {
  const isOpen = isMarketOpen(market);
  const openTime = `${market.openHour.toString().padStart(2, '0')}:${market.openMinute.toString().padStart(2, '0')}`;
  const closeTime = `${market.closeHour.toString().padStart(2, '0')}:${market.closeMinute.toString().padStart(2, '0')}`;

  if (isOpen) {
    return {
      event: locale === 'ko' ? '마감' : 'Closes',
      time: closeTime,
    };
  }
  return {
    event: locale === 'ko' ? '개장' : 'Opens',
    time: openTime,
  };
}

function getMarketStatus(market: MarketConfig, locale: string): MarketStatus {
  const { timeStr } = getMarketTime(market.timezone);
  const isOpen = isMarketOpen(market);
  const nextEvent = getNextEvent(market, locale);

  return {
    name: market.name,
    nameKo: market.nameKo,
    isOpen,
    currentTime: timeStr,
    nextEvent: nextEvent.event,
    nextEventTime: nextEvent.time,
  };
}

export function useMarketStatus(locale: string = 'en') {
  const [status, setStatus] = useState<{ us: MarketStatus; kr: MarketStatus }>(() => ({
    us: getMarketStatus(US_MARKET, locale),
    kr: getMarketStatus(KR_MARKET, locale),
  }));

  useEffect(() => {
    const updateStatus = () => {
      setStatus({
        us: getMarketStatus(US_MARKET, locale),
        kr: getMarketStatus(KR_MARKET, locale),
      });
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, [locale]);

  return status;
}
