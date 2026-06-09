export interface MarketHours {
  name: string;
  nameKo: string;
  timezone: string;
  openTime: string;
  closeTime: string;
  tradingDays: number[]; // 0 = Sunday, 1 = Monday, etc.
}

export const US_MARKET: MarketHours = {
  name: 'US Stock Market',
  nameKo: '미국 주식 시장',
  timezone: 'America/New_York',
  openTime: '09:30',
  closeTime: '16:00',
  tradingDays: [1, 2, 3, 4, 5], // Monday to Friday
};

export const KR_MARKET: MarketHours = {
  name: 'Korean Stock Market',
  nameKo: '한국 주식 시장',
  timezone: 'Asia/Seoul',
  openTime: '09:00',
  closeTime: '15:30',
  tradingDays: [1, 2, 3, 4, 5], // Monday to Friday
};

function getTimeInTimezone(timezone: string): Date {
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

  const result = new Date();
  result.setHours(hour, minute, 0, 0);
  (result as Date & { dayOfWeek: number }).dayOfWeek = dayMap[weekday] ?? 0;

  return result;
}

export function isMarketOpen(market: MarketHours): boolean {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: market.timezone,
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
  const dayOfWeek = dayMap[weekday] ?? 0;

  // Check if it's a trading day
  if (!market.tradingDays.includes(dayOfWeek)) {
    return false;
  }

  const currentMinutes = hour * 60 + minute;
  const [openHour, openMinute] = market.openTime.split(':').map(Number);
  const [closeHour, closeMinute] = market.closeTime.split(':').map(Number);
  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

export function getMarketStatus(market: MarketHours): {
  isOpen: boolean;
  currentTime: string;
  nextEvent: string;
} {
  const isOpen = isMarketOpen(market);

  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: market.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const currentTime = formatter.format(now);

  const nextEvent = isOpen
    ? `Closes at ${market.closeTime}`
    : `Opens at ${market.openTime}`;

  return { isOpen, currentTime, nextEvent };
}

export function formatLastUpdated(date: Date, locale: string = 'en'): string {
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}
