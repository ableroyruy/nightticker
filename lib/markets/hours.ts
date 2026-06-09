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

export const JP_MARKET: MarketHours = {
  name: 'Japanese Stock Market',
  nameKo: '일본 주식 시장',
  timezone: 'Asia/Tokyo',
  openTime: '09:00',
  closeTime: '15:00',
  tradingDays: [1, 2, 3, 4, 5], // Monday to Friday
};

const localeMap: Record<string, string> = {
  en: 'en-US',
  ko: 'ko-KR',
  ja: 'ja-JP',
};

export function formatLastUpdated(date: Date, locale: string = 'en'): string {
  return new Intl.DateTimeFormat(localeMap[locale] || 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}
