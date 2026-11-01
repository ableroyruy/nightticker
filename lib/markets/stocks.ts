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
  { symbol: 'NIFTY', name: 'Nifty 50', nameKo: '인도 니프티 50', nameJa: 'インド Nifty 50', nameZh: '印度Nifty 50', slug: 'nifty-50', category: 'INDEX', hyperliquidSymbol: 'xyz:NIFTY' },

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

  // ===== Currencies =====
  { symbol: 'EUR', name: 'Euro', nameKo: '유로', nameJa: 'ユーロ', nameZh: '欧元', slug: 'euro', category: 'FX', sector: 'Currency', hyperliquidSymbol: 'xyz:EUR' },
  { symbol: 'JPY', name: 'Japanese Yen', nameKo: '일본 엔', nameJa: '日本円', nameZh: '日元', slug: 'yen', category: 'FX', sector: 'Currency', hyperliquidSymbol: 'xyz:JPY' },
  { symbol: 'GBP', name: 'British Pound', nameKo: '영국 파운드', nameJa: '英ポンド', nameZh: '英镑', slug: 'pound', category: 'FX', sector: 'Currency', hyperliquidSymbol: 'xyz:GBP' },

  // ===== Special Assets =====
  { symbol: 'DRAM', name: 'Roundhill Memory ETF', nameKo: '라운드힐 메모리 ETF', nameJa: 'DRAM', nameZh: 'DRAM', slug: 'dram', category: 'ETF', sector: 'Semiconductors', hyperliquidSymbol: 'xyz:DRAM' },
  // Expanded XYZ markets; reviewed 2026-11-01.
  {"symbol": "SNDK", "name": "SanDisk", "nameKo": "샌디스크", "slug": "sandisk", "category": "US", "hyperliquidSymbol": "xyz:SNDK", "sector": "Semiconductors", "description": "SNDK references 1 share of Sandisk Corporation common stock (Nasdaq: SNDK), quoted in USD. Sandisk develops NAND flash-memory and data-storage products."},
  {"symbol": "CRCL", "name": "Circle", "nameKo": "서클", "slug": "circle", "category": "US", "hyperliquidSymbol": "xyz:CRCL", "sector": "Fintech", "description": "CRCL references 1 share of Circle Internet Group, Inc. Class A common stock (NYSE: CRCL), quoted in USD. Circle provides stablecoin and digital-asset payment infrastructure, including USDC."},
  {"symbol": "USAR", "name": "USA Rare Earth", "nameKo": "USA 레어어스", "slug": "usa-rare-earth", "category": "US", "hyperliquidSymbol": "xyz:USAR", "sector": "Metals", "description": "USAR references 1 share of USA Rare Earth, Inc. Class A common stock (Nasdaq: USAR), quoted in USD. USA Rare Earth develops rare-earth mining, processing, and magnet-production assets."},
  {"symbol": "LITE", "name": "Lumentum", "nameKo": "루멘텀", "slug": "lumentum", "category": "US", "hyperliquidSymbol": "xyz:LITE", "sector": "Semiconductors", "description": "LITE references 1 share of Lumentum Holdings Inc. common stock (Nasdaq: LITE), quoted in USD. Lumentum develops optical and photonic components for communications, computing, and industrial applications."},
  {"symbol": "CBRS", "name": "Cerebras reference market", "nameKo": "세레브라스 참고시장", "slug": "cerebras", "category": "US", "hyperliquidSymbol": "xyz:CBRS", "sector": "AI", "description": "CBRS references 1 share of Cerebras Systems Inc. Class A common stock (Nasdaq: CBRS), quoted in USD. Cerebras develops wafer-scale AI processors, computing systems, and cloud services."},
  {"symbol": "MINIMAX", "name": "MiniMax reference market", "nameKo": "미니맥스 참고시장", "slug": "minimax", "category": "SPECIAL", "hyperliquidSymbol": "xyz:MINIMAX", "sector": "AI", "description": "MINIMAX references 1 MiniMax Group Inc. Class A ordinary share (HKEX: 0100). The oracle converts the HKD share price to USD at the prevailing USD/HKD FX rate. MiniMax develops multimodal AI models and applications."},
  {"symbol": "BB", "name": "BlackBerry", "nameKo": "블랙베리", "slug": "blackberry", "category": "US", "hyperliquidSymbol": "xyz:BB", "sector": "BigTech", "description": "BB references 1 share of BlackBerry Limited common stock (NYSE: BB), quoted in USD. BlackBerry provides cybersecurity, secure communications, and embedded software."},
  {"symbol": "NOK", "name": "Nokia", "nameKo": "노키아", "slug": "nokia", "category": "US", "hyperliquidSymbol": "xyz:NOK", "sector": "BigTech", "description": "NOK references 1 Nokia Corporation ADS (NYSE: NOK), representing 1 share (Nasdaq Helsinki: NOKIA), quoted in USD. Nokia provides telecommunications networks, infrastructure, software, and related services."},
  {"symbol": "SMH", "name": "VanEck Semiconductor ETF", "nameKo": "반에크 반도체 ETF", "slug": "smh", "category": "ETF", "hyperliquidSymbol": "xyz:SMH", "sector": "Semiconductors", "description": "SMH references 1 share of the VanEck Semiconductor ETF (Nasdaq: SMH), quoted in USD. The fund tracks U.S.-listed companies involved in semiconductor production and equipment."},
  {"symbol": "BE", "name": "Bloom Energy", "nameKo": "블룸에너지", "slug": "bloom-energy", "category": "US", "hyperliquidSymbol": "xyz:BE", "sector": "Energy", "description": "BE references 1 share of Bloom Energy Corporation Class A common stock (NYSE: BE), quoted in USD. Bloom Energy develops solid-oxide fuel-cell systems for on-site power generation."},
  {"symbol": "ZHIPU", "name": "Zhipu AI reference market", "nameKo": "즈푸 AI 참고시장", "slug": "zhipu", "category": "SPECIAL", "hyperliquidSymbol": "xyz:ZHIPU", "sector": "AI", "description": "ZHIPU references 1 H-share of Knowledge Atlas Technology Joint Stock Company Limited (HKEX: 2513). The oracle converts the HKD share price to USD at the prevailing USD/HKD FX rate. The company, also known as Zhipu AI or Z.ai, develops AI models and applications."},
  {"symbol": "QCOM", "name": "Qualcomm", "nameKo": "퀄컴", "slug": "qualcomm", "category": "US", "hyperliquidSymbol": "xyz:QCOM", "sector": "Semiconductors", "description": "QCOM references 1 share of QUALCOMM Incorporated common stock (Nasdaq: QCOM), quoted in USD. Qualcomm develops semiconductors, wireless technology, and related software and licensing."},
  {"symbol": "STRC", "name": "Strategy Stretch preferred stock", "nameKo": "스트래티지 STRC 우선주", "slug": "strategy-strc", "category": "US", "hyperliquidSymbol": "xyz:STRC", "sector": "Fintech", "description": "STRC references 1 share of Strategy Inc's Variable Rate Series A Perpetual Stretch Preferred Stock (Nasdaq: STRC), quoted in USD. Stretch, the underlying security, pays cumulative monthly cash dividends at a variable rate on a $100 stated amount. Strategy, formerly MicroStrategy, holds bitcoin as its primary treasury asset."},
  {"symbol": "AMAT", "name": "Applied Materials", "nameKo": "어플라이드 머티어리얼즈", "slug": "applied-materials", "category": "US", "hyperliquidSymbol": "xyz:AMAT", "sector": "Semiconductors", "description": "AMAT references 1 share of Applied Materials, Inc. common stock (Nasdaq: AMAT), quoted in USD. Applied Materials provides equipment and services for semiconductor and display manufacturing."},
  {"symbol": "SKHY", "name": "SK Hynix ADS (SKHY)", "nameKo": "SK하이닉스 ADS (SKHY)", "slug": "sk-hynix-skhy", "category": "US", "hyperliquidSymbol": "xyz:SKHY", "sector": "Semiconductors", "description": "SKHY references 1 SK hynix Inc. ADS (Nasdaq: SKHY), representing one-tenth of 1 common share (KRX: 000660), quoted in USD. SK hynix manufactures DRAM and NAND memory semiconductors used in data centers, AI hardware, mobile devices, and computing systems."},
  {"symbol": "CXMT", "name": "CXMT reference market", "nameKo": "창신메모리 참고시장", "slug": "cxmt", "category": "SPECIAL", "hyperliquidSymbol": "xyz:CXMT", "sector": "Semiconductors", "description": "CXMT references 1 CXMT Corporation A-share (SSE STAR: 688825). The oracle converts the CNY share price to USD at the prevailing offshore USD/CNH rate. CXMT Corporation, operating as ChangXin Memory Technologies, is a Chinese developer and manufacturer of DRAM chips."},
  {"symbol": "GEV", "name": "GE Vernova", "nameKo": "GE 버노바", "slug": "ge-vernova", "category": "US", "hyperliquidSymbol": "xyz:GEV", "sector": "Energy", "description": "GEV references 1 share of GE Vernova Inc. common stock (NYSE: GEV), quoted in USD. GE Vernova provides equipment, software, and services for power generation, wind energy, and grid electrification."},
  {"symbol": "KORU", "name": "Direxion Daily South Korea Bull 3X ETF", "nameKo": "한국 일일 3배 레버리지 ETF", "slug": "koru", "category": "ETF", "hyperliquidSymbol": "xyz:KORU", "description": "KORU references 1 share of the Direxion Daily MSCI South Korea Bull 3X ETF (NYSE Arca: KORU), quoted in USD. The fund seeks daily investment results, before fees and expenses, of 300% of the performance of the MSCI Korea 25/50 Index; local-currency exposure is embedded in the ETF."},
  {"symbol": "UNITREE", "name": "Unitree reference market", "nameKo": "유니트리 참고시장", "slug": "unitree", "category": "SPECIAL", "hyperliquidSymbol": "xyz:UNITREE", "sector": "AI", "description": "UNITREE references 1 Yushu Technology Co., Ltd. A-share (SSE STAR: 688836). The oracle converts the CNY share price to USD at the prevailing offshore USD/CNH rate. Yushu Technology, operating as Unitree Robotics, develops and manufactures humanoid robots, quadruped robots, and robot components."},
  {"symbol": "SOXL", "name": "Direxion Daily Semiconductor Bull 3X ETF", "nameKo": "반도체 일일 3배 레버리지 ETF", "slug": "soxl", "category": "ETF", "hyperliquidSymbol": "xyz:SOXL", "sector": "Semiconductors", "description": "SOXL references 1 share of the Direxion Daily Semiconductor Bull 3X Shares (NYSE Arca: SOXL), quoted in USD. The fund seeks daily investment results of 300% of the daily performance of the ICE Semiconductor Index, an index of the 30 largest U.S.-listed semiconductor companies; leverage resets daily."},
  {"symbol": "MAGS", "name": "Roundhill Magnificent Seven ETF", "nameKo": "매그니피센트 세븐 ETF", "slug": "mags", "category": "ETF", "hyperliquidSymbol": "xyz:MAGS", "sector": "BigTech", "description": "MAGS references 1 share of the Roundhill Magnificent Seven ETF (Cboe BZX: MAGS), quoted in USD. The fund invests in Alphabet, Amazon, Apple, Meta, Microsoft, NVIDIA, and Tesla and targets approximately equal weighting across the seven companies."},
  {"symbol": "IREN", "name": "IREN", "nameKo": "아이렌", "slug": "iren", "category": "US", "hyperliquidSymbol": "xyz:IREN", "sector": "AI", "description": "IREN references 1 IREN Limited ordinary share (Nasdaq: IREN), quoted in USD. IREN develops and operates data centers supporting AI cloud computing."},
  {"symbol": "NET", "name": "Cloudflare", "nameKo": "클라우드플레어", "slug": "cloudflare", "category": "US", "hyperliquidSymbol": "xyz:NET", "sector": "BigTech", "description": "NET references 1 share of Cloudflare, Inc. Class A common stock (NYSE: NET), quoted in USD. Cloudflare provides cloud-based network, security, and developer services for websites, applications, and internet infrastructure."},
  {"symbol": "CRWD", "name": "CrowdStrike", "nameKo": "크라우드스트라이크", "slug": "crowdstrike", "category": "US", "hyperliquidSymbol": "xyz:CRWD", "sector": "BigTech", "description": "CRWD references 1 share of CrowdStrike Holdings, Inc. Class A common stock (Nasdaq: CRWD), quoted in USD. CrowdStrike provides cloud-native cybersecurity software through its Falcon platform for endpoint, identity, cloud, and data protection."},
  {"symbol": "RDDT", "name": "Reddit", "nameKo": "레딧", "slug": "reddit", "category": "US", "hyperliquidSymbol": "xyz:RDDT", "sector": "Entertainment", "description": "RDDT references 1 share of Reddit, Inc. Class A common stock (NYSE: RDDT), quoted in USD. Reddit operates an online platform organized into user-created communities where users share and discuss content."},
  {"symbol": "AAOI", "name": "Applied Optoelectronics", "nameKo": "어플라이드 옵토일렉트로닉스", "slug": "applied-optoelectronics", "category": "US", "hyperliquidSymbol": "xyz:AAOI", "sector": "Semiconductors", "description": "AAOI references 1 share of Applied Optoelectronics, Inc. common stock (Nasdaq: AAOI), quoted in USD. Applied Optoelectronics develops and manufactures fiber-optic networking products for data centers, broadband, and telecommunications."},
  {"symbol": "MRNA", "name": "Moderna", "nameKo": "모더나", "slug": "moderna", "category": "US", "hyperliquidSymbol": "xyz:MRNA", "sector": "Healthcare", "description": "MRNA references 1 share of Moderna, Inc. common stock (Nasdaq: MRNA), quoted in USD. Moderna develops messenger RNA (mRNA) medicines, including infectious-disease vaccines and oncology therapeutics."},
  {"symbol": "XBI", "name": "SPDR S&P Biotech ETF", "nameKo": "S&P 바이오테크 ETF", "slug": "xbi", "category": "ETF", "hyperliquidSymbol": "xyz:XBI", "sector": "Healthcare", "description": "XBI references 1 share of the SPDR S&P Biotech ETF (NYSE Arca: XBI), quoted in USD. The fund provides diversified, approximately equal-weighted exposure to U.S. biotechnology companies across drug development, therapeutics, and life sciences."},
  {"symbol": "SHEIN", "name": "SHEIN reference market", "nameKo": "쉬인 참고시장", "slug": "shein", "category": "SPECIAL", "hyperliquidSymbol": "xyz:SHEIN", "sector": "Retail", "description": "SHEIN references 1 Class B ordinary share of SHEIN Global Holdings Limited (HKEX: 0625). The oracle converts the HKD share price to USD at the prevailing USD/HKD FX rate. SHEIN is an online fashion and lifestyle retailer selling own-brand apparel and third-party marketplace products."},
  {"symbol": "BMNR", "name": "BitMine Immersion Technologies", "nameKo": "비트마인", "slug": "bitmine", "category": "US", "hyperliquidSymbol": "xyz:BMNR", "sector": "Fintech", "description": "BMNR references 1 share of BitMine Immersion Technologies, Inc. common stock (NYSE: BMNR), quoted in USD. BitMine operates an Ethereum treasury and blockchain infrastructure business, with activities including ETH staking and validation, and strategic digital-asset investments."},
  {"symbol": "CVX", "name": "Chevron", "nameKo": "셰브론", "slug": "chevron", "category": "US", "hyperliquidSymbol": "xyz:CVX", "sector": "Energy", "description": "CVX references 1 share of Chevron Corporation common stock (NYSE: CVX), quoted in USD. Chevron produces crude oil and natural gas and manufactures transportation fuels, lubricants, and petrochemicals."},
  {"symbol": "TLT", "name": "iShares 20+ Year Treasury Bond ETF", "nameKo": "미국 20년 이상 국채 ETF", "slug": "tlt", "category": "ETF", "hyperliquidSymbol": "xyz:TLT", "description": "TLT references 1 share of the iShares 20+ Year Treasury Bond ETF (Nasdaq: TLT), quoted in USD. The fund tracks the ICE U.S. Treasury 20+ Year Bond Index, an index of U.S. Treasury bonds with remaining maturities greater than 20 years."},
  {"symbol": "HO", "name": "New York Harbor ULSD (Diesel)", "nameKo": "뉴욕항 초저유황 경유", "slug": "diesel", "category": "COMMODITY", "hyperliquidSymbol": "xyz:HO", "sector": "Energy", "description": "HO (DIESEL) references the USD price of one U.S. gallon of New York Harbor ultra-low sulfur diesel (ULSD)."},
  {"symbol": "OURA", "name": "Oura (pre-IPO)", "nameKo": "오우라 (상장 전 참고시장)", "slug": "oura", "category": "SPECIAL", "hyperliquidSymbol": "xyz:OURA", "description": "OURA references 1 share of Oura Inc. common stock (Nasdaq: OURA), quoted in USD. OURA is currently a pre-IPO market reflecting the anticipated share price; it is expected to convert to a standard XYZ perpetual upon the IPO. Oura designs the Oura Ring, a smart ring that measures sleep, activity, stress, and heart-health signals, and sells a subscription membership for health insights."},
  {"symbol": "LRCX", "name": "Lam Research", "nameKo": "램리서치", "slug": "lam-research", "category": "US", "hyperliquidSymbol": "xyz:LRCX", "sector": "Semiconductors", "description": "LRCX references 1 share of Lam Research Corporation common stock (Nasdaq: LRCX), quoted in USD. Lam Research supplies wafer fabrication equipment and services to the semiconductor industry."},
  {"symbol": "UMC", "name": "United Microelectronics", "nameKo": "UMC", "slug": "umc", "category": "US", "hyperliquidSymbol": "xyz:UMC", "sector": "Semiconductors", "description": "UMC references 1 ADS of United Microelectronics Corporation (NYSE: UMC), representing 5 common shares (TWSE: 2303), quoted in USD. The company manufactures semiconductors for third-party customers."},
  {"symbol": "CAMBRICON", "name": "Cambricon reference market", "nameKo": "캠브리콘 참고시장", "slug": "cambricon", "category": "SPECIAL", "hyperliquidSymbol": "xyz:CAMBRICON", "sector": "Semiconductors", "description": "CAMBRICON references 1 A-share of Cambricon Technologies Corporation Limited (SSE STAR: 688256). The oracle converts the CNY share price to USD at the prevailing offshore USD/CNH rate. Cambricon designs AI processors and develops supporting software."},
  {"symbol": "TWST", "name": "Twist Bioscience", "nameKo": "트위스트 바이오사이언스", "slug": "twist-bioscience", "category": "US", "hyperliquidSymbol": "xyz:TWST", "sector": "Healthcare", "description": "TWST references 1 share of Twist Bioscience Corporation common stock (Nasdaq: TWST), quoted in USD. Twist Bioscience manufactures synthetic DNA-based products for research, sequencing, and drug discovery."},
  {"symbol": "GLW", "name": "Corning", "nameKo": "코닝", "slug": "corning", "category": "US", "hyperliquidSymbol": "xyz:GLW", "sector": "BigTech", "description": "GLW references 1 share of Corning Incorporated common stock (NYSE: GLW), quoted in USD. Corning manufactures specialty glass, ceramics, and optical communications products."},
  {"symbol": "RELIANCE", "name": "Reliance reference market", "nameKo": "릴라이언스 참고시장", "slug": "reliance", "category": "SPECIAL", "hyperliquidSymbol": "xyz:RELIANCE", "description": "RELIANCE references 1 equity share of Reliance Industries Limited (NSE: RELIANCE). The oracle converts the INR share price to USD at the prevailing USD/INR FX rate. Reliance Industries operates energy, petrochemicals, retail, and digital services businesses."},
  {"symbol": "JIO", "name": "Jio reference market", "nameKo": "지오 참고시장", "slug": "jio", "category": "SPECIAL", "hyperliquidSymbol": "xyz:JIO", "description": "JIO references 1 equity share of Jio Platforms Limited (NSE: JPL). The oracle converts the INR share price to USD at the prevailing USD/INR FX rate. Jio Platforms provides digital connectivity and digital services in India."},
  {"symbol": "ANT", "name": "Anthropic (pre-IPO)", "nameKo": "앤트로픽 (상장 전 참고시장)", "slug": "anthropic", "category": "SPECIAL", "hyperliquidSymbol": "xyz:ANT", "sector": "AI", "description": "ANT references 1 share of Anthropic, PBC Class A common stock (Nasdaq: ANT), quoted in USD. ANT is currently a pre-IPO market reflecting the anticipated share price; upon the underlying listing, it is expected to convert to a standard XYZ perpetual. Anthropic develops AI models and the Claude assistant."},
  {"symbol": "ICE", "name": "Intercontinental Exchange", "nameKo": "인터컨티넨털 익스체인지", "slug": "intercontinental-exchange", "category": "US", "hyperliquidSymbol": "xyz:ICE", "sector": "Fintech", "description": "ICE references 1 share of Intercontinental Exchange, Inc. common stock (NYSE: ICE), quoted in USD. ICE operates exchanges and clearing houses, including the New York Stock Exchange, and provides market data."},
  {"symbol": "PURRDAT", "name": "Hyperliquid Strategies (PURR)", "nameKo": "하이퍼리퀴드 스트래티지스", "slug": "hyperliquid-strategies", "category": "US", "sector": "Fintech", "hyperliquidSymbol": "xyz:PURRDAT", "description": "PURRDAT references 1 share of Hyperliquid Strategies Inc. common stock (Nasdaq: PURR), quoted in USD. Hyperliquid Strategies is a digital-asset treasury company focused on HYPE, Hyperliquid's native token."},
  {"symbol": "BIRD", "name": "Smartbird", "nameKo": "스마트버드", "slug": "smartbird", "category": "US", "sector": "BigTech", "hyperliquidSymbol": "xyz:BIRD", "description": "BIRD references 1 share of Smartbird, Inc. Class A common stock (Nasdaq: BIRD), quoted in USD. Smartbird develops AI compute infrastructure."},
  {"symbol": "QNT", "name": "Quantinuum", "nameKo": "퀀티넘", "slug": "quantinuum", "category": "US", "sector": "AI", "hyperliquidSymbol": "xyz:QNT", "description": "QNT references 1 share of Quantinuum Inc. Class A common stock (Nasdaq: QNT), quoted in USD. Quantinuum develops trapped-ion quantum computers, software, and related applications."},
  {"symbol": "BOT", "name": "RoboStrategy", "nameKo": "로보스트래티지", "slug": "robostrategy", "category": "US", "sector": "Fintech", "hyperliquidSymbol": "xyz:BOT", "description": "BOT references 1 share of RoboStrategy, Inc. common stock (Nasdaq: BOT), quoted in USD. RoboStrategy is a closed-end investment company focused on robotics and embodied AI."},
  {"symbol": "GIGADEV", "name": "GigaDevice", "nameKo": "기가디바이스", "slug": "gigadevice", "category": "SPECIAL", "sector": "Semiconductors", "hyperliquidSymbol": "xyz:GIGADEV", "description": "GIGADEV references 1 GigaDevice Semiconductor Inc. A-share (SSE: 603986). The oracle converts the CNY share price to USD at the prevailing offshore USD/CNH rate. GigaDevice is a fabless designer of NOR flash memory, specialty DRAM, microcontrollers, and sensor chips."},
  {"symbol": "SHAZ", "name": "Sharon AI", "nameKo": "샤론 AI", "slug": "sharon-ai", "category": "US", "sector": "AI", "hyperliquidSymbol": "xyz:SHAZ", "description": "SHAZ references 1 share of SharonAI Holdings Inc. Class A common stock (Nasdaq: SHAZ), quoted in USD. Sharon AI provides GPU cloud and high-performance computing infrastructure."},
  {"symbol": "KSTR", "name": "KraneShares STAR 50 ETF", "nameKo": "크레인셰어즈 STAR 50 ETF", "slug": "kstr", "category": "ETF", "sector": "Semiconductors", "hyperliquidSymbol": "xyz:KSTR", "description": "KSTR references 1 share of the KraneShares China Technology & Semiconductor STAR 50 Index ETF (NYSE Arca: KSTR), quoted in USD. The fund tracks the STAR 50 Index of the 50 largest companies listed on the Shanghai Stock Exchange STAR Market; local-currency exposure is embedded in the ETF."},
  {"symbol": "LYTE", "name": "Roundhill Photonics & Optics ETF", "nameKo": "라운드힐 포토닉스·광학 ETF", "slug": "lyte", "category": "ETF", "sector": "Semiconductors", "hyperliquidSymbol": "xyz:LYTE", "description": "LYTE references 1 share of the Roundhill Photonics & Optics ETF (Cboe BZX: LYTE), quoted in USD. The actively managed fund invests in companies involved in photonics and optics, including optical interconnects, lasers, and photonic chips."},
  {"symbol": "NCLD", "name": "Roundhill Neocloud ETF", "nameKo": "라운드힐 네오클라우드 ETF", "slug": "ncld", "category": "ETF", "sector": "AI", "hyperliquidSymbol": "xyz:NCLD", "description": "NCLD references 1 share of the Roundhill Neocloud ETF (Nasdaq: NCLD), quoted in USD. The actively managed fund invests in neocloud companies, including GPU-as-a-Service platforms and data centers built for AI and high-performance computing."},
  {"symbol": "SNXX", "name": "Tradr 2X Long SNDK Daily ETF", "nameKo": "샌디스크 일일 2배 레버리지 ETF", "slug": "snxx", "category": "ETF", "sector": "Semiconductors", "hyperliquidSymbol": "xyz:SNXX", "description": "SNXX references 1 share of the Tradr 2X Long SNDK Daily ETF (Cboe BZX: SNXX), quoted in USD. The fund seeks daily investment results, before fees and expenses, of 200% of the daily performance of Sandisk Corporation common stock (Nasdaq: SNDK); it does not seek that objective over periods longer than one trading day."},
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
    INDEX: ['SP500', 'XYZ100', 'JP225', 'KR200', 'NIFTY'],
    ETF: ['EWY', 'EWJ', 'EWZ', 'XLE'],
    COMMODITY: ['GOLD', 'SILVER', 'CL', 'BRENTOIL', 'NATGAS'],
    FX: ['EUR', 'JPY', 'GBP'],
    SPECIAL: ['MINIMAX', 'ZHIPU', 'CXMT', 'UNITREE', 'ANT'],
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
