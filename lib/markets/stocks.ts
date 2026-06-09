import { Stock, StockCategory } from '../providers/types';

export const stocks: Stock[] = [
  // ===== US Stocks =====
  // Big Tech
  {
    symbol: 'AAPL',
    name: 'Apple',
    nameKo: '애플',
    slug: 'apple',
    category: 'US',
    hyperliquidSymbol: 'xyz:AAPL',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft',
    nameKo: '마이크로소프트',
    slug: 'microsoft',
    category: 'US',
    hyperliquidSymbol: 'xyz:MSFT',
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet (Google)',
    nameKo: '알파벳 (구글)',
    slug: 'google',
    category: 'US',
    hyperliquidSymbol: 'xyz:GOOGL',
  },
  {
    symbol: 'AMZN',
    name: 'Amazon',
    nameKo: '아마존',
    slug: 'amazon',
    category: 'US',
    hyperliquidSymbol: 'xyz:AMZN',
  },
  {
    symbol: 'META',
    name: 'Meta',
    nameKo: '메타',
    slug: 'meta',
    category: 'US',
    hyperliquidSymbol: 'xyz:META',
  },
  {
    symbol: 'NFLX',
    name: 'Netflix',
    nameKo: '넷플릭스',
    slug: 'netflix',
    category: 'US',
    hyperliquidSymbol: 'xyz:NFLX',
  },
  {
    symbol: 'ORCL',
    name: 'Oracle',
    nameKo: '오라클',
    slug: 'oracle',
    category: 'US',
    hyperliquidSymbol: 'xyz:ORCL',
  },
  {
    symbol: 'IBM',
    name: 'IBM',
    nameKo: 'IBM',
    slug: 'ibm',
    category: 'US',
    hyperliquidSymbol: 'xyz:IBM',
  },
  {
    symbol: 'NOW',
    name: 'ServiceNow',
    nameKo: '서비스나우',
    slug: 'servicenow',
    category: 'US',
    hyperliquidSymbol: 'xyz:NOW',
  },
  {
    symbol: 'ZM',
    name: 'Zoom',
    nameKo: '줌',
    slug: 'zoom',
    category: 'US',
    hyperliquidSymbol: 'xyz:ZM',
  },
  {
    symbol: 'DELL',
    name: 'Dell',
    nameKo: '델',
    slug: 'dell',
    category: 'US',
    hyperliquidSymbol: 'xyz:DELL',
  },
  // Semiconductors
  {
    symbol: 'NVDA',
    name: 'Nvidia',
    nameKo: '엔비디아',
    slug: 'nvidia',
    category: 'US',
    hyperliquidSymbol: 'xyz:NVDA',
  },
  {
    symbol: 'AMD',
    name: 'AMD',
    nameKo: 'AMD',
    slug: 'amd',
    category: 'US',
    hyperliquidSymbol: 'xyz:AMD',
  },
  {
    symbol: 'INTC',
    name: 'Intel',
    nameKo: '인텔',
    slug: 'intel',
    category: 'US',
    hyperliquidSymbol: 'xyz:INTC',
  },
  {
    symbol: 'MU',
    name: 'Micron',
    nameKo: '마이크론',
    slug: 'micron',
    category: 'US',
    hyperliquidSymbol: 'xyz:MU',
  },
  {
    symbol: 'AVGO',
    name: 'Broadcom',
    nameKo: '브로드컴',
    slug: 'broadcom',
    category: 'US',
    hyperliquidSymbol: 'xyz:AVGO',
  },
  {
    symbol: 'MRVL',
    name: 'Marvell',
    nameKo: '마벨',
    slug: 'marvell',
    category: 'US',
    hyperliquidSymbol: 'xyz:MRVL',
  },
  {
    symbol: 'ARM',
    name: 'ARM Holdings',
    nameKo: 'ARM',
    slug: 'arm',
    category: 'US',
    hyperliquidSymbol: 'xyz:ARM',
  },
  {
    symbol: 'ASML',
    name: 'ASML',
    nameKo: 'ASML',
    slug: 'asml',
    category: 'US',
    hyperliquidSymbol: 'xyz:ASML',
  },
  {
    symbol: 'TSM',
    name: 'TSMC',
    nameKo: 'TSMC',
    slug: 'tsmc',
    category: 'US',
    hyperliquidSymbol: 'xyz:TSM',
  },
  {
    symbol: 'WDC',
    name: 'Western Digital',
    nameKo: '웨스턴 디지털',
    slug: 'western-digital',
    category: 'US',
    hyperliquidSymbol: 'xyz:WDC',
  },
  // EV & Auto
  {
    symbol: 'TSLA',
    name: 'Tesla',
    nameKo: '테슬라',
    slug: 'tesla',
    category: 'US',
    hyperliquidSymbol: 'xyz:TSLA',
  },
  {
    symbol: 'RIVN',
    name: 'Rivian',
    nameKo: '리비안',
    slug: 'rivian',
    category: 'US',
    hyperliquidSymbol: 'xyz:RIVN',
  },
  // Fintech & Finance
  {
    symbol: 'COIN',
    name: 'Coinbase',
    nameKo: '코인베이스',
    slug: 'coinbase',
    category: 'US',
    hyperliquidSymbol: 'xyz:COIN',
  },
  {
    symbol: 'HOOD',
    name: 'Robinhood',
    nameKo: '로빈후드',
    slug: 'robinhood',
    category: 'US',
    hyperliquidSymbol: 'xyz:HOOD',
  },
  {
    symbol: 'BX',
    name: 'Blackstone',
    nameKo: '블랙스톤',
    slug: 'blackstone',
    category: 'US',
    hyperliquidSymbol: 'xyz:BX',
  },
  {
    symbol: 'MSTR',
    name: 'MicroStrategy',
    nameKo: '마이크로스트래티지',
    slug: 'microstrategy',
    category: 'US',
    hyperliquidSymbol: 'xyz:MSTR',
  },
  // AI & Data
  {
    symbol: 'PLTR',
    name: 'Palantir',
    nameKo: '팔란티어',
    slug: 'palantir',
    category: 'US',
    hyperliquidSymbol: 'xyz:PLTR',
  },
  {
    symbol: 'CRWV',
    name: 'CoreWeave',
    nameKo: '코어위브',
    slug: 'coreweave',
    category: 'US',
    hyperliquidSymbol: 'xyz:CRWV',
  },
  {
    symbol: 'NBIS',
    name: 'Nebius',
    nameKo: '네비우스',
    slug: 'nebius',
    category: 'US',
    hyperliquidSymbol: 'xyz:NBIS',
  },
  // Retail & Consumer
  {
    symbol: 'COST',
    name: 'Costco',
    nameKo: '코스트코',
    slug: 'costco',
    category: 'US',
    hyperliquidSymbol: 'xyz:COST',
  },
  {
    symbol: 'BABA',
    name: 'Alibaba',
    nameKo: '알리바바',
    slug: 'alibaba',
    category: 'US',
    hyperliquidSymbol: 'xyz:BABA',
  },
  {
    symbol: 'EBAY',
    name: 'eBay',
    nameKo: '이베이',
    slug: 'ebay',
    category: 'US',
    hyperliquidSymbol: 'xyz:EBAY',
  },
  {
    symbol: 'GME',
    name: 'GameStop',
    nameKo: '게임스탑',
    slug: 'gamestop',
    category: 'US',
    hyperliquidSymbol: 'xyz:GME',
  },
  // Healthcare & Pharma
  {
    symbol: 'LLY',
    name: 'Eli Lilly',
    nameKo: '일라이 릴리',
    slug: 'eli-lilly',
    category: 'US',
    hyperliquidSymbol: 'xyz:LLY',
  },
  {
    symbol: 'HIMS',
    name: 'Hims & Hers',
    nameKo: '힘스앤허스',
    slug: 'hims',
    category: 'US',
    hyperliquidSymbol: 'xyz:HIMS',
  },
  // Space & Defense
  {
    symbol: 'RKLB',
    name: 'Rocket Lab',
    nameKo: '로켓랩',
    slug: 'rocket-lab',
    category: 'US',
    hyperliquidSymbol: 'xyz:RKLB',
  },
  // Entertainment & Gaming
  {
    symbol: 'DKNG',
    name: 'DraftKings',
    nameKo: '드래프트킹스',
    slug: 'draftkings',
    category: 'US',
    hyperliquidSymbol: 'xyz:DKNG',
  },

  // ===== Korean Stocks =====
  {
    symbol: 'SMSN',
    name: 'Samsung Electronics',
    nameKo: '삼성전자',
    slug: 'samsung',
    category: 'KR',
    hyperliquidSymbol: 'xyz:SMSN',
  },
  {
    symbol: 'SKHX',
    name: 'SK Hynix',
    nameKo: 'SK하이닉스',
    slug: 'sk-hynix',
    category: 'KR',
    hyperliquidSymbol: 'xyz:SKHX',
  },
  {
    symbol: 'HYUNDAI',
    name: 'Hyundai Motor',
    nameKo: '현대자동차',
    slug: 'hyundai',
    category: 'KR',
    hyperliquidSymbol: 'xyz:HYUNDAI',
  },

  // ===== Japanese Stocks =====
  {
    symbol: 'SOFTBANK',
    name: 'SoftBank',
    nameKo: '소프트뱅크',
    slug: 'softbank',
    category: 'JP',
    hyperliquidSymbol: 'xyz:SOFTBANK',
  },
  {
    symbol: 'KIOXIA',
    name: 'Kioxia',
    nameKo: '키옥시아',
    slug: 'kioxia',
    category: 'JP',
    hyperliquidSymbol: 'xyz:KIOXIA',
  },

  // ===== Index Markets =====
  {
    symbol: 'SP500',
    name: 'S&P 500',
    nameKo: 'S&P 500',
    slug: 'sp500',
    category: 'INDEX',
    hyperliquidSymbol: 'xyz:SP500',
  },
  {
    symbol: 'XYZ100',
    name: 'Nasdaq 100',
    nameKo: '나스닥 100',
    slug: 'nasdaq-100',
    category: 'INDEX',
    hyperliquidSymbol: 'xyz:XYZ100',
  },
  {
    symbol: 'KR200',
    name: 'KOSPI 200',
    nameKo: '코스피 200',
    slug: 'kospi-200',
    category: 'INDEX',
    hyperliquidSymbol: 'xyz:KR200',
  },
  {
    symbol: 'JP225',
    name: 'Nikkei 225',
    nameKo: '니케이 225',
    slug: 'nikkei-225',
    category: 'INDEX',
    hyperliquidSymbol: 'xyz:JP225',
  },
  {
    symbol: 'VIX',
    name: 'VIX',
    nameKo: 'VIX 변동성지수',
    slug: 'vix',
    category: 'INDEX',
    hyperliquidSymbol: 'xyz:VIX',
  },
  {
    symbol: 'NIFTY',
    name: 'Nifty 50',
    nameKo: '인도 니프티 50',
    slug: 'nifty-50',
    category: 'INDEX',
    hyperliquidSymbol: 'xyz:NIFTY',
  },
  {
    symbol: 'IBOV',
    name: 'Bovespa',
    nameKo: '브라질 보베스파',
    slug: 'bovespa',
    category: 'INDEX',
    hyperliquidSymbol: 'xyz:IBOV',
  },
  {
    symbol: 'DXY',
    name: 'US Dollar Index',
    nameKo: '달러 인덱스',
    slug: 'dollar-index',
    category: 'INDEX',
    hyperliquidSymbol: 'xyz:DXY',
  },

  // ===== ETFs =====
  {
    symbol: 'EWY',
    name: 'iShares MSCI South Korea',
    nameKo: '한국 ETF',
    slug: 'ewy',
    category: 'ETF',
    hyperliquidSymbol: 'xyz:EWY',
  },
  {
    symbol: 'EWJ',
    name: 'iShares MSCI Japan',
    nameKo: '일본 ETF',
    slug: 'ewj',
    category: 'ETF',
    hyperliquidSymbol: 'xyz:EWJ',
  },
  {
    symbol: 'EWZ',
    name: 'iShares MSCI Brazil',
    nameKo: '브라질 ETF',
    slug: 'ewz',
    category: 'ETF',
    hyperliquidSymbol: 'xyz:EWZ',
  },
  {
    symbol: 'EWT',
    name: 'iShares MSCI Taiwan',
    nameKo: '대만 ETF',
    slug: 'ewt',
    category: 'ETF',
    hyperliquidSymbol: 'xyz:EWT',
  },
  {
    symbol: 'XLE',
    name: 'Energy Select SPDR',
    nameKo: '에너지 ETF',
    slug: 'xle',
    category: 'ETF',
    hyperliquidSymbol: 'xyz:XLE',
  },
  {
    symbol: 'URNM',
    name: 'Sprott Uranium Miners',
    nameKo: '우라늄 광산 ETF',
    slug: 'urnm',
    category: 'ETF',
    hyperliquidSymbol: 'xyz:URNM',
  },

  // ===== Commodities =====
  {
    symbol: 'GOLD',
    name: 'Gold',
    nameKo: '금',
    slug: 'gold',
    category: 'COMMODITY',
    hyperliquidSymbol: 'xyz:GOLD',
  },
  {
    symbol: 'SILVER',
    name: 'Silver',
    nameKo: '은',
    slug: 'silver',
    category: 'COMMODITY',
    hyperliquidSymbol: 'xyz:SILVER',
  },
  {
    symbol: 'COPPER',
    name: 'Copper',
    nameKo: '구리',
    slug: 'copper',
    category: 'COMMODITY',
    hyperliquidSymbol: 'xyz:COPPER',
  },
  {
    symbol: 'PLATINUM',
    name: 'Platinum',
    nameKo: '백금',
    slug: 'platinum',
    category: 'COMMODITY',
    hyperliquidSymbol: 'xyz:PLATINUM',
  },
  {
    symbol: 'PALLADIUM',
    name: 'Palladium',
    nameKo: '팔라듐',
    slug: 'palladium',
    category: 'COMMODITY',
    hyperliquidSymbol: 'xyz:PALLADIUM',
  },
  {
    symbol: 'CL',
    name: 'Crude Oil (WTI)',
    nameKo: 'WTI 원유',
    slug: 'crude-oil',
    category: 'COMMODITY',
    hyperliquidSymbol: 'xyz:CL',
  },
  {
    symbol: 'BRENTOIL',
    name: 'Brent Oil',
    nameKo: '브렌트유',
    slug: 'brent-oil',
    category: 'COMMODITY',
    hyperliquidSymbol: 'xyz:BRENTOIL',
  },
  {
    symbol: 'NATGAS',
    name: 'Natural Gas',
    nameKo: '천연가스',
    slug: 'natural-gas',
    category: 'COMMODITY',
    hyperliquidSymbol: 'xyz:NATGAS',
  },
  {
    symbol: 'URANIUM',
    name: 'Uranium',
    nameKo: '우라늄',
    slug: 'uranium',
    category: 'COMMODITY',
    hyperliquidSymbol: 'xyz:URANIUM',
  },
  {
    symbol: 'ALUMINIUM',
    name: 'Aluminium',
    nameKo: '알루미늄',
    slug: 'aluminium',
    category: 'COMMODITY',
    hyperliquidSymbol: 'xyz:ALUMINIUM',
  },
  {
    symbol: 'CORN',
    name: 'Corn',
    nameKo: '옥수수',
    slug: 'corn',
    category: 'COMMODITY',
    hyperliquidSymbol: 'xyz:CORN',
  },
  {
    symbol: 'WHEAT',
    name: 'Wheat',
    nameKo: '밀',
    slug: 'wheat',
    category: 'COMMODITY',
    hyperliquidSymbol: 'xyz:WHEAT',
  },

  // ===== Currencies =====
  {
    symbol: 'EUR',
    name: 'Euro',
    nameKo: '유로',
    slug: 'euro',
    category: 'FX',
    hyperliquidSymbol: 'xyz:EUR',
  },
  {
    symbol: 'JPY',
    name: 'Japanese Yen',
    nameKo: '일본 엔',
    slug: 'yen',
    category: 'FX',
    hyperliquidSymbol: 'xyz:JPY',
  },
  {
    symbol: 'GBP',
    name: 'British Pound',
    nameKo: '영국 파운드',
    slug: 'pound',
    category: 'FX',
    hyperliquidSymbol: 'xyz:GBP',
  },
  {
    symbol: 'KRW',
    name: 'Korean Won',
    nameKo: '한국 원',
    slug: 'krw',
    category: 'FX',
    hyperliquidSymbol: 'xyz:KRW',
  },

  // ===== Special Assets =====
  {
    symbol: 'H100',
    name: 'NVIDIA H100 GPU',
    nameKo: 'H100 GPU',
    slug: 'h100',
    category: 'SPECIAL',
    hyperliquidSymbol: 'xyz:H100',
  },
  {
    symbol: 'DRAM',
    name: 'DRAM',
    nameKo: 'DRAM',
    slug: 'dram',
    category: 'SPECIAL',
    hyperliquidSymbol: 'xyz:DRAM',
  },
];

export function getStockBySymbol(symbol: string): Stock | undefined {
  return stocks.find(
    (s) => s.symbol.toLowerCase() === symbol.toLowerCase()
  );
}

export function getStockBySlug(slug: string): Stock | undefined {
  return stocks.find((s) => s.slug === slug.toLowerCase());
}

export function getStocksByCategory(category: StockCategory): Stock[] {
  return stocks.filter((s) => s.category === category);
}

export function getAllSymbols(): string[] {
  return stocks.map((s) => s.symbol.toLowerCase());
}

export function getAllSlugs(): string[] {
  return stocks.map((s) => s.slug);
}

export function getPopularStocks(): Stock[] {
  // Top US tech stocks
  const popularSymbols = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL', 'META'];
  return stocks.filter((s) => popularSymbols.includes(s.symbol));
}
