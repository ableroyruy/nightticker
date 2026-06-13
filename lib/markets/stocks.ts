import { Stock, StockCategory, StockSector } from '../providers/types';

export const stocks: Stock[] = [
  // ===== US Stocks =====
  // Big Tech
  { symbol: 'AAPL', name: 'Apple', nameKo: '애플', nameJa: 'アップル', nameZh: '苹果', slug: 'apple', category: 'US', sector: 'BigTech', hyperliquidSymbol: 'xyz:AAPL' },
  { symbol: 'MSFT', name: 'Microsoft', nameKo: '마이크로소프트', nameJa: 'マイクロソフト', nameZh: '微软', slug: 'microsoft', category: 'US', sector: 'BigTech', hyperliquidSymbol: 'xyz:MSFT' },
  { symbol: 'GOOGL', name: 'Alphabet (Google)', nameKo: '알파벳 (구글)', nameJa: 'アルファベット (グーグル)', nameZh: '谷歌', slug: 'google', category: 'US', sector: 'BigTech', hyperliquidSymbol: 'xyz:GOOGL' },
  { symbol: 'AMZN', name: 'Amazon', nameKo: '아마존', nameJa: 'アマゾン', nameZh: '亚马逊', slug: 'amazon', category: 'US', sector: 'BigTech', hyperliquidSymbol: 'xyz:AMZN' },
  { symbol: 'META', name: 'Meta', nameKo: '메타', nameJa: 'メタ', nameZh: 'Meta', slug: 'meta', category: 'US', sector: 'BigTech', hyperliquidSymbol: 'xyz:META' },
  { symbol: 'NFLX', name: 'Netflix', nameKo: '넷플릭스', nameJa: 'ネットフリックス', nameZh: '奈飞', slug: 'netflix', category: 'US', sector: 'BigTech', hyperliquidSymbol: 'xyz:NFLX' },
  { symbol: 'ORCL', name: 'Oracle', nameKo: '오라클', nameJa: 'オラクル', nameZh: '甲骨文', slug: 'oracle', category: 'US', sector: 'BigTech', hyperliquidSymbol: 'xyz:ORCL' },
  { symbol: 'IBM', name: 'IBM', nameKo: 'IBM', nameJa: 'IBM', nameZh: 'IBM', slug: 'ibm', category: 'US', sector: 'BigTech', hyperliquidSymbol: 'xyz:IBM' },
  { symbol: 'NOW', name: 'ServiceNow', nameKo: '서비스나우', nameJa: 'サービスナウ', nameZh: 'ServiceNow', slug: 'servicenow', category: 'US', sector: 'BigTech', hyperliquidSymbol: 'xyz:NOW' },
  { symbol: 'ZM', name: 'Zoom', nameKo: '줌', nameJa: 'ズーム', nameZh: 'Zoom', slug: 'zoom', category: 'US', sector: 'BigTech', hyperliquidSymbol: 'xyz:ZM' },
  { symbol: 'DELL', name: 'Dell', nameKo: '델', nameJa: 'デル', nameZh: '戴尔', slug: 'dell', category: 'US', sector: 'BigTech', hyperliquidSymbol: 'xyz:DELL' },
  // Semiconductors
  { symbol: 'NVDA', name: 'Nvidia', nameKo: '엔비디아', nameJa: 'エヌビディア', nameZh: '英伟达', slug: 'nvidia', category: 'US', sector: 'Semiconductors', hyperliquidSymbol: 'xyz:NVDA' },
  { symbol: 'AMD', name: 'AMD', nameKo: 'AMD', nameJa: 'AMD', nameZh: 'AMD', slug: 'amd', category: 'US', sector: 'Semiconductors', hyperliquidSymbol: 'xyz:AMD' },
  { symbol: 'INTC', name: 'Intel', nameKo: '인텔', nameJa: 'インテル', nameZh: '英特尔', slug: 'intel', category: 'US', sector: 'Semiconductors', hyperliquidSymbol: 'xyz:INTC' },
  { symbol: 'MU', name: 'Micron', nameKo: '마이크론', nameJa: 'マイクロン', nameZh: '美光', slug: 'micron', category: 'US', sector: 'Semiconductors', hyperliquidSymbol: 'xyz:MU' },
  { symbol: 'AVGO', name: 'Broadcom', nameKo: '브로드컴', nameJa: 'ブロードコム', nameZh: '博通', slug: 'broadcom', category: 'US', sector: 'Semiconductors', hyperliquidSymbol: 'xyz:AVGO' },
  { symbol: 'MRVL', name: 'Marvell', nameKo: '마벨', nameJa: 'マーベル', nameZh: 'Marvell', slug: 'marvell', category: 'US', sector: 'Semiconductors', hyperliquidSymbol: 'xyz:MRVL' },
  { symbol: 'ARM', name: 'ARM Holdings', nameKo: 'ARM', nameJa: 'ARM', nameZh: 'ARM', slug: 'arm', category: 'US', sector: 'Semiconductors', hyperliquidSymbol: 'xyz:ARM' },
  { symbol: 'ASML', name: 'ASML', nameKo: 'ASML', nameJa: 'ASML', nameZh: 'ASML', slug: 'asml', category: 'US', sector: 'Semiconductors', hyperliquidSymbol: 'xyz:ASML' },
  { symbol: 'TSM', name: 'TSMC', nameKo: 'TSMC', nameJa: 'TSMC', nameZh: '台积电', slug: 'tsmc', category: 'US', sector: 'Semiconductors', hyperliquidSymbol: 'xyz:TSM' },
  { symbol: 'WDC', name: 'Western Digital', nameKo: '웨스턴 디지털', nameJa: 'ウエスタンデジタル', nameZh: '西部数据', slug: 'western-digital', category: 'US', sector: 'Semiconductors', hyperliquidSymbol: 'xyz:WDC' },
  // EV & Auto
  { symbol: 'TSLA', name: 'Tesla', nameKo: '테슬라', nameJa: 'テスラ', nameZh: '特斯拉', slug: 'tesla', category: 'US', sector: 'EV', hyperliquidSymbol: 'xyz:TSLA' },
  { symbol: 'RIVN', name: 'Rivian', nameKo: '리비안', nameJa: 'リビアン', nameZh: 'Rivian', slug: 'rivian', category: 'US', sector: 'EV', hyperliquidSymbol: 'xyz:RIVN' },
  // Fintech & Finance
  { symbol: 'COIN', name: 'Coinbase', nameKo: '코인베이스', nameJa: 'コインベース', nameZh: 'Coinbase', slug: 'coinbase', category: 'US', sector: 'Fintech', hyperliquidSymbol: 'xyz:COIN' },
  { symbol: 'HOOD', name: 'Robinhood', nameKo: '로빈후드', nameJa: 'ロビンフッド', nameZh: 'Robinhood', slug: 'robinhood', category: 'US', sector: 'Fintech', hyperliquidSymbol: 'xyz:HOOD' },
  { symbol: 'BX', name: 'Blackstone', nameKo: '블랙스톤', nameJa: 'ブラックストーン', nameZh: '黑石', slug: 'blackstone', category: 'US', sector: 'Fintech', hyperliquidSymbol: 'xyz:BX' },
  { symbol: 'MSTR', name: 'MicroStrategy', nameKo: '마이크로스트래티지', nameJa: 'マイクロストラテジー', nameZh: 'MicroStrategy', slug: 'microstrategy', category: 'US', sector: 'Fintech', hyperliquidSymbol: 'xyz:MSTR' },
  // AI & Data
  { symbol: 'PLTR', name: 'Palantir', nameKo: '팔란티어', nameJa: 'パランティア', nameZh: 'Palantir', slug: 'palantir', category: 'US', sector: 'AI', hyperliquidSymbol: 'xyz:PLTR' },
  { symbol: 'CRWV', name: 'CoreWeave', nameKo: '코어위브', nameJa: 'コアウィーブ', nameZh: 'CoreWeave', slug: 'coreweave', category: 'US', sector: 'AI', hyperliquidSymbol: 'xyz:CRWV' },
  { symbol: 'NBIS', name: 'Nebius', nameKo: '네비우스', nameJa: 'ネビウス', nameZh: 'Nebius', slug: 'nebius', category: 'US', sector: 'AI', hyperliquidSymbol: 'xyz:NBIS' },
  // Retail & Consumer
  { symbol: 'COST', name: 'Costco', nameKo: '코스트코', nameJa: 'コストコ', nameZh: '开市客', slug: 'costco', category: 'US', sector: 'Retail', hyperliquidSymbol: 'xyz:COST' },
  { symbol: 'BABA', name: 'Alibaba', nameKo: '알리바바', nameJa: 'アリババ', nameZh: '阿里巴巴', slug: 'alibaba', category: 'US', sector: 'Retail', hyperliquidSymbol: 'xyz:BABA' },
  { symbol: 'EBAY', name: 'eBay', nameKo: '이베이', nameJa: 'イーベイ', nameZh: 'eBay', slug: 'ebay', category: 'US', sector: 'Retail', hyperliquidSymbol: 'xyz:EBAY' },
  { symbol: 'GME', name: 'GameStop', nameKo: '게임스탑', nameJa: 'ゲームストップ', nameZh: 'GameStop', slug: 'gamestop', category: 'US', sector: 'Retail', hyperliquidSymbol: 'xyz:GME' },
  // Healthcare & Pharma
  { symbol: 'LLY', name: 'Eli Lilly', nameKo: '일라이 릴리', nameJa: 'イーライリリー', nameZh: '礼来', slug: 'eli-lilly', category: 'US', sector: 'Healthcare', hyperliquidSymbol: 'xyz:LLY' },
  { symbol: 'HIMS', name: 'Hims & Hers', nameKo: '힘스앤허스', nameJa: 'ヒムズ&ハーズ', nameZh: 'Hims & Hers', slug: 'hims', category: 'US', sector: 'Healthcare', hyperliquidSymbol: 'xyz:HIMS' },
  // Space & Defense
  { symbol: 'RKLB', name: 'Rocket Lab', nameKo: '로켓랩', nameJa: 'ロケットラボ', nameZh: '火箭实验室', slug: 'rocket-lab', category: 'US', sector: 'Space', hyperliquidSymbol: 'xyz:RKLB' },
  { symbol: 'SPCX', name: 'SpaceX', nameKo: '스페이스X', nameJa: 'スペースX', nameZh: 'SpaceX', namePt: 'SpaceX', nameEs: 'SpaceX', slug: 'spacex', category: 'US', sector: 'Space', hyperliquidSymbol: 'xyz:SPCX' },
  // Entertainment & Gaming
  { symbol: 'DKNG', name: 'DraftKings', nameKo: '드래프트킹스', nameJa: 'ドラフトキングス', nameZh: 'DraftKings', slug: 'draftkings', category: 'US', sector: 'Entertainment', hyperliquidSymbol: 'xyz:DKNG' },

  // ===== Korean Stocks =====
  { symbol: 'SMSN', name: 'Samsung Electronics', nameKo: '삼성전자', nameJa: 'サムスン電子', nameZh: '三星电子', slug: 'samsung', category: 'KR', sector: 'Semiconductors', hyperliquidSymbol: 'xyz:SMSN' },
  { symbol: 'SKHX', name: 'SK Hynix', nameKo: 'SK하이닉스', nameJa: 'SKハイニックス', nameZh: 'SK海力士', slug: 'sk-hynix', category: 'KR', sector: 'Semiconductors', hyperliquidSymbol: 'xyz:SKHX' },
  { symbol: 'HYUNDAI', name: 'Hyundai Motor', nameKo: '현대자동차', nameJa: '現代自動車', nameZh: '现代汽车', slug: 'hyundai', category: 'KR', sector: 'EV', hyperliquidSymbol: 'xyz:HYUNDAI' },

  // ===== Japanese Stocks =====
  { symbol: 'SOFTBANK', name: 'SoftBank', nameKo: '소프트뱅크', nameJa: 'ソフトバンク', nameZh: '软银', slug: 'softbank', category: 'JP', sector: 'BigTech', hyperliquidSymbol: 'xyz:SOFTBANK' },
  { symbol: 'KIOXIA', name: 'Kioxia', nameKo: '키옥시아', nameJa: 'キオクシア', nameZh: '铠侠', slug: 'kioxia', category: 'JP', sector: 'Semiconductors', hyperliquidSymbol: 'xyz:KIOXIA' },

  // ===== Index Markets =====
  { symbol: 'SP500', name: 'S&P 500', nameKo: 'S&P 500', nameJa: 'S&P 500', nameZh: '标普500', slug: 'sp500', category: 'INDEX', hyperliquidSymbol: 'xyz:SP500' },
  { symbol: 'XYZ100', name: 'Nasdaq 100', nameKo: '나스닥 100', nameJa: 'ナスダック100', nameZh: '纳斯达克100', slug: 'nasdaq-100', category: 'INDEX', hyperliquidSymbol: 'xyz:XYZ100' },
  { symbol: 'KR200', name: 'KOSPI 200', nameKo: '코스피 200', nameJa: 'KOSPI 200', nameZh: 'KOSPI 200', slug: 'kospi-200', category: 'INDEX', hyperliquidSymbol: 'xyz:KR200' },
  { symbol: 'JP225', name: 'Nikkei 225', nameKo: '니케이 225', nameJa: '日経225', nameZh: '日经225', slug: 'nikkei-225', category: 'INDEX', hyperliquidSymbol: 'xyz:JP225' },
  { symbol: 'VIX', name: 'VIX', nameKo: 'VIX 변동성지수', nameJa: 'VIX恐怖指数', nameZh: 'VIX恐慌指数', slug: 'vix', category: 'INDEX', hyperliquidSymbol: 'xyz:VIX' },
  { symbol: 'NIFTY', name: 'Nifty 50', nameKo: '인도 니프티 50', nameJa: 'インド Nifty 50', nameZh: '印度Nifty 50', slug: 'nifty-50', category: 'INDEX', hyperliquidSymbol: 'xyz:NIFTY' },
  { symbol: 'IBOV', name: 'Bovespa', nameKo: '브라질 보베스파', nameJa: 'ブラジル ボベスパ', nameZh: '巴西Bovespa', slug: 'bovespa', category: 'INDEX', hyperliquidSymbol: 'xyz:IBOV' },
  { symbol: 'DXY', name: 'US Dollar Index', nameKo: '달러 인덱스', nameJa: 'ドル指数', nameZh: '美元指数', slug: 'dollar-index', category: 'INDEX', hyperliquidSymbol: 'xyz:DXY' },

  // ===== ETFs =====
  { symbol: 'EWY', name: 'iShares MSCI South Korea', nameKo: '한국 ETF', nameJa: '韓国 ETF', nameZh: '韩国ETF', slug: 'ewy', category: 'ETF', hyperliquidSymbol: 'xyz:EWY' },
  { symbol: 'EWJ', name: 'iShares MSCI Japan', nameKo: '일본 ETF', nameJa: '日本 ETF', nameZh: '日本ETF', slug: 'ewj', category: 'ETF', hyperliquidSymbol: 'xyz:EWJ' },
  { symbol: 'EWZ', name: 'iShares MSCI Brazil', nameKo: '브라질 ETF', nameJa: 'ブラジル ETF', nameZh: '巴西ETF', slug: 'ewz', category: 'ETF', hyperliquidSymbol: 'xyz:EWZ' },
  { symbol: 'EWT', name: 'iShares MSCI Taiwan', nameKo: '대만 ETF', nameJa: '台湾 ETF', nameZh: '台湾ETF', slug: 'ewt', category: 'ETF', hyperliquidSymbol: 'xyz:EWT' },
  { symbol: 'XLE', name: 'Energy Select SPDR', nameKo: '에너지 ETF', nameJa: 'エネルギー ETF', nameZh: '能源ETF', slug: 'xle', category: 'ETF', sector: 'Energy', hyperliquidSymbol: 'xyz:XLE' },
  { symbol: 'URNM', name: 'Sprott Uranium Miners', nameKo: '우라늄 광산 ETF', nameJa: 'ウラン鉱山 ETF', nameZh: '铀矿ETF', slug: 'urnm', category: 'ETF', sector: 'Energy', hyperliquidSymbol: 'xyz:URNM' },

  // ===== Commodities =====
  { symbol: 'GOLD', name: 'Gold', nameKo: '금', nameJa: '金', nameZh: '黄金', slug: 'gold', category: 'COMMODITY', sector: 'Metals', hyperliquidSymbol: 'xyz:GOLD' },
  { symbol: 'SILVER', name: 'Silver', nameKo: '은', nameJa: '銀', nameZh: '白银', slug: 'silver', category: 'COMMODITY', sector: 'Metals', hyperliquidSymbol: 'xyz:SILVER' },
  { symbol: 'COPPER', name: 'Copper', nameKo: '구리', nameJa: '銅', nameZh: '铜', slug: 'copper', category: 'COMMODITY', sector: 'Metals', hyperliquidSymbol: 'xyz:COPPER' },
  { symbol: 'PLATINUM', name: 'Platinum', nameKo: '백금', nameJa: 'プラチナ', nameZh: '铂金', slug: 'platinum', category: 'COMMODITY', sector: 'Metals', hyperliquidSymbol: 'xyz:PLATINUM' },
  { symbol: 'PALLADIUM', name: 'Palladium', nameKo: '팔라듐', nameJa: 'パラジウム', nameZh: '钯金', slug: 'palladium', category: 'COMMODITY', sector: 'Metals', hyperliquidSymbol: 'xyz:PALLADIUM' },
  { symbol: 'CL', name: 'Crude Oil (WTI)', nameKo: 'WTI 원유', nameJa: 'WTI原油', nameZh: 'WTI原油', slug: 'crude-oil', category: 'COMMODITY', sector: 'Energy', hyperliquidSymbol: 'xyz:CL' },
  { symbol: 'BRENTOIL', name: 'Brent Oil', nameKo: '브렌트유', nameJa: 'ブレント原油', nameZh: '布伦特原油', slug: 'brent-oil', category: 'COMMODITY', sector: 'Energy', hyperliquidSymbol: 'xyz:BRENTOIL' },
  { symbol: 'NATGAS', name: 'Natural Gas', nameKo: '천연가스', nameJa: '天然ガス', nameZh: '天然气', slug: 'natural-gas', category: 'COMMODITY', sector: 'Energy', hyperliquidSymbol: 'xyz:NATGAS' },
  { symbol: 'URANIUM', name: 'Uranium', nameKo: '우라늄', nameJa: 'ウラン', nameZh: '铀', slug: 'uranium', category: 'COMMODITY', sector: 'Energy', hyperliquidSymbol: 'xyz:URANIUM' },
  { symbol: 'ALUMINIUM', name: 'Aluminium', nameKo: '알루미늄', nameJa: 'アルミニウム', nameZh: '铝', slug: 'aluminium', category: 'COMMODITY', sector: 'Metals', hyperliquidSymbol: 'xyz:ALUMINIUM' },
  { symbol: 'CORN', name: 'Corn', nameKo: '옥수수', nameJa: 'トウモロコシ', nameZh: '玉米', slug: 'corn', category: 'COMMODITY', sector: 'Agriculture', hyperliquidSymbol: 'xyz:CORN' },
  { symbol: 'WHEAT', name: 'Wheat', nameKo: '밀', nameJa: '小麦', nameZh: '小麦', slug: 'wheat', category: 'COMMODITY', sector: 'Agriculture', hyperliquidSymbol: 'xyz:WHEAT' },

  // ===== Currencies =====
  { symbol: 'EUR', name: 'Euro', nameKo: '유로', nameJa: 'ユーロ', nameZh: '欧元', slug: 'euro', category: 'FX', sector: 'Currency', hyperliquidSymbol: 'xyz:EUR' },
  { symbol: 'JPY', name: 'Japanese Yen', nameKo: '일본 엔', nameJa: '日本円', nameZh: '日元', slug: 'yen', category: 'FX', sector: 'Currency', hyperliquidSymbol: 'xyz:JPY' },
  { symbol: 'GBP', name: 'British Pound', nameKo: '영국 파운드', nameJa: '英ポンド', nameZh: '英镑', slug: 'pound', category: 'FX', sector: 'Currency', hyperliquidSymbol: 'xyz:GBP' },
  { symbol: 'KRW', name: 'Korean Won', nameKo: '한국 원', nameJa: '韓国ウォン', nameZh: '韩元', slug: 'krw', category: 'FX', sector: 'Currency', hyperliquidSymbol: 'xyz:KRW' },

  // ===== Special Assets =====
  { symbol: 'H100', name: 'NVIDIA H100 GPU', nameKo: 'H100 GPU', nameJa: 'H100 GPU', nameZh: 'H100 GPU', slug: 'h100', category: 'SPECIAL', sector: 'Semiconductors', hyperliquidSymbol: 'xyz:H100' },
  { symbol: 'DRAM', name: 'DRAM', nameKo: 'DRAM', nameJa: 'DRAM', nameZh: 'DRAM', slug: 'dram', category: 'SPECIAL', sector: 'Semiconductors', hyperliquidSymbol: 'xyz:DRAM' },
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

export function getStocksBySector(sector: StockSector): Stock[] {
  return stocks.filter((s) => s.sector === sector);
}

export function getRelatedStocks(stock: Stock, limit: number = 5): Stock[] {
  const related: Stock[] = [];

  // 1. Same sector stocks (priority)
  if (stock.sector) {
    const sectorStocks = stocks.filter(
      (s) => s.sector === stock.sector && s.symbol !== stock.symbol
    );
    related.push(...sectorStocks.slice(0, limit));
  }

  // 2. Same category stocks (if more needed)
  if (related.length < limit) {
    const categoryStocks = stocks.filter(
      (s) =>
        s.category === stock.category &&
        s.symbol !== stock.symbol &&
        !related.find((r) => r.symbol === s.symbol)
    );
    related.push(...categoryStocks.slice(0, limit - related.length));
  }

  return related.slice(0, limit);
}

export function getPopularByCategory(category: StockCategory, limit: number = 5): Stock[] {
  const popularOrder: Record<StockCategory, string[]> = {
    US: ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL', 'META', 'AMZN', 'PLTR', 'AMD'],
    KR: ['SMSN', 'SKHX', 'HYUNDAI'],
    JP: ['SOFTBANK', 'KIOXIA'],
    INDEX: ['SP500', 'XYZ100', 'JP225', 'KR200', 'VIX'],
    ETF: ['EWY', 'EWJ', 'EWZ', 'XLE'],
    COMMODITY: ['GOLD', 'SILVER', 'CL', 'BRENTOIL', 'NATGAS'],
    FX: ['EUR', 'JPY', 'GBP', 'KRW'],
    SPECIAL: ['H100', 'DRAM'],
    SEMICONDUCTOR: ['NVDA', 'AMD', 'SMSN', 'SKHX', 'MU', 'INTC', 'TSM', 'ASML'],
  };

  const order = popularOrder[category] || [];
  const categoryStocks = category === 'SEMICONDUCTOR'
    ? getStocksBySectorForCategory('Semiconductors')
    : getStocksByCategory(category);

  return categoryStocks
    .sort((a, b) => {
      const aIndex = order.indexOf(a.symbol);
      const bIndex = order.indexOf(b.symbol);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    })
    .slice(0, limit);
}

export const categoryNames: Record<StockCategory, { en: string; ko: string; ja: string; zh: string; pt: string; es: string }> = {
  US: { en: 'US Stocks', ko: '미국주식', ja: '米国株', zh: '美股', pt: 'Acoes EUA', es: 'Acciones EEUU' },
  KR: { en: 'Korean Stocks', ko: '한국주식', ja: '韓国株', zh: '韩股', pt: 'Acoes Coreanas', es: 'Acciones Coreanas' },
  JP: { en: 'Japanese Stocks', ko: '일본주식', ja: '日本株', zh: '日股', pt: 'Acoes Japonesas', es: 'Acciones Japonesas' },
  INDEX: { en: 'Indices', ko: '지수', ja: '指数', zh: '指数', pt: 'Indices', es: 'Indices' },
  ETF: { en: 'ETFs', ko: 'ETF', ja: 'ETF', zh: 'ETF', pt: 'ETFs', es: 'ETFs' },
  COMMODITY: { en: 'Commodities', ko: '원자재', ja: '商品', zh: '大宗商品', pt: 'Commodities', es: 'Materias Primas' },
  FX: { en: 'Currencies', ko: '환율', ja: '為替', zh: '外汇', pt: 'Moedas', es: 'Divisas' },
  SPECIAL: { en: 'Special Assets', ko: '특수 자산', ja: '特別資産', zh: '特殊资产', pt: 'Ativos Especiais', es: 'Activos Especiales' },
  SEMICONDUCTOR: { en: 'Semiconductors', ko: '반도체', ja: '半導体', zh: '半导体', pt: 'Semicondutores', es: 'Semiconductores' },
};

// Get stocks by sector (for cross-category views like Semiconductors)
export function getStocksBySectorForCategory(sector: StockSector): Stock[] {
  return stocks.filter((s) => s.sector === sector);
}

export const sectorNames: Record<StockSector, { en: string; ko: string; ja: string; zh: string; pt: string; es: string }> = {
  BigTech: { en: 'Big Tech', ko: '빅테크', ja: 'ビッグテック', zh: '科技巨头', pt: 'Big Tech', es: 'Big Tech' },
  Semiconductors: { en: 'Semiconductors', ko: '반도체', ja: '半導体', zh: '半导体', pt: 'Semicondutores', es: 'Semiconductores' },
  EV: { en: 'EV & Auto', ko: '전기차', ja: 'EV・自動車', zh: '电动汽车', pt: 'EV & Auto', es: 'EV & Auto' },
  Fintech: { en: 'Fintech', ko: '핀테크', ja: 'フィンテック', zh: '金融科技', pt: 'Fintech', es: 'Fintech' },
  AI: { en: 'AI & Data', ko: 'AI', ja: 'AI', zh: '人工智能', pt: 'IA & Dados', es: 'IA & Datos' },
  Retail: { en: 'Retail', ko: '유통', ja: '小売', zh: '零售', pt: 'Varejo', es: 'Comercio' },
  Healthcare: { en: 'Healthcare', ko: '헬스케어', ja: 'ヘルスケア', zh: '医疗健康', pt: 'Saude', es: 'Salud' },
  Space: { en: 'Space & Defense', ko: '우주', ja: '宇宙', zh: '航天', pt: 'Espaco & Defesa', es: 'Espacio & Defensa' },
  Entertainment: { en: 'Entertainment', ko: '엔터테인먼트', ja: 'エンタメ', zh: '娱乐', pt: 'Entretenimento', es: 'Entretenimiento' },
  Energy: { en: 'Energy', ko: '에너지', ja: 'エネルギー', zh: '能源', pt: 'Energia', es: 'Energia' },
  Metals: { en: 'Metals', ko: '금속', ja: '金属', zh: '金属', pt: 'Metais', es: 'Metales' },
  Agriculture: { en: 'Agriculture', ko: '농산물', ja: '農産物', zh: '农产品', pt: 'Agricultura', es: 'Agricultura' },
  Currency: { en: 'Currency', ko: '통화', ja: '通貨', zh: '货币', pt: 'Moeda', es: 'Moneda' },
  Other: { en: 'Other', ko: '기타', ja: 'その他', zh: '其他', pt: 'Outros', es: 'Otros' },
};
