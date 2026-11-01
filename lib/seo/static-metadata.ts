import { pageMetadata, seoLocale } from './site';

const content = {
  "favorites": {
    "en": {
      "title": "Favorites - My Watchlist Night Prices | NightTicker",
      "description": "Check night prices for your favorite stocks at a glance. Monitor overnight, weekend, and holiday reference prices for your watchlist. Powered by Hyperliquid."
    },
    "ko": {
      "title": "즐겨찾기 - 내 관심 종목 야간 주가 | 나이트티커",
      "description": "내가 즐겨찾기한 종목의 야간 주가를 한눈에 확인하세요. 관심 종목의 야간, 주말, 휴일 주식 시세를 모니터링합니다. 하이퍼리퀴드 기반."
    },
    "ja": {
      "title": "お気に入り - 関心銘柄の夜間株価 | ナイトティッカー",
      "description": "お気に入り銘柄の夜間株価を一目で確認。関心銘柄の夜間、週末、休日の株価を監視。ハイパーリキッド基盤。"
    },
    "zh": {
      "title": "收藏",
      "description": "在浏览器中保存和管理收藏的资产，一次查看其Hyperliquid夜间、周末与节假日参考价格。"
    },
    "pt": {
      "title": "Favoritos",
      "description": "Guarde e organize os ativos favoritos no navegador e acompanhe seus preços de referência Hyperliquid à noite, nos fins de semana e feriados."
    },
    "es": {
      "title": "Favoritos",
      "description": "Guarda y organiza tus activos favoritos en el navegador y sigue sus precios de referencia Hyperliquid de noche, en fines de semana y festivos."
    }
  },
  "gainers": {
    "en": {
      "title": "Top Gainers - Night Stock Price Gainers | NightTicker",
      "description": "Check top gaining stocks by overnight price changes. See which US and Korean stocks have risen the most. Powered by Hyperliquid."
    },
    "ko": {
      "title": "급등주 - 야간 주가 상승률 상위 종목 | 나이트티커",
      "description": "야간 주가 기준 상승률 상위 종목을 확인하세요. 24시간 동안 가장 많이 오른 미국, 한국 주식을 모니터링합니다. 하이퍼리퀴드 기반."
    },
    "ja": {
      "title": "急騰銘柄 - 夜間株価上昇率上位 | ナイトティッカー",
      "description": "夜間株価基準の上昇率上位銘柄をチェック。24時間で最も上昇した銘柄を確認。ハイパーリキッド基盤。"
    },
    "zh": {
      "title": "涨幅榜",
      "description": "查看Hyperliquid参考市场过去24小时涨幅最大的资产，比较股票、ETF及其他市场的价格与变化。"
    },
    "pt": {
      "title": "Maiores Altas",
      "description": "Veja os ativos com maiores altas nas últimas 24 horas nos mercados de referência Hyperliquid. Compare ações, ETFs e outros mercados."
    },
    "es": {
      "title": "Mayores Alzas",
      "description": "Consulta los activos con mayores alzas en 24 horas en los mercados de referencia Hyperliquid. Compara acciones, ETF y otros mercados."
    }
  },
  "losers": {
    "en": {
      "title": "Top Losers - Night Stock Price Losers | NightTicker",
      "description": "Check top losing stocks by overnight price changes. See which US and Korean stocks have dropped the most. Powered by Hyperliquid."
    },
    "ko": {
      "title": "급락주 - 야간 주가 하락률 상위 종목 | 나이트티커",
      "description": "야간 주가 기준 하락률 상위 종목을 확인하세요. 24시간 동안 가장 많이 하락한 미국, 한국 주식을 모니터링합니다. 하이퍼리퀴드 기반."
    },
    "ja": {
      "title": "急落銘柄 - 夜間株価下落率上位 | ナイトティッカー",
      "description": "夜間株価基準の下落率上位銘柄をチェック。24時間で最も下落した銘柄を確認。ハイパーリキッド基盤。"
    },
    "zh": {
      "title": "跌幅榜",
      "description": "查看Hyperliquid参考市场过去24小时跌幅最大的资产，比较股票、ETF及其他市场的价格与变化。"
    },
    "pt": {
      "title": "Maiores Baixas",
      "description": "Veja os ativos com maiores quedas nas últimas 24 horas nos mercados de referência Hyperliquid. Compare ações, ETFs e outros mercados."
    },
    "es": {
      "title": "Mayores Bajas",
      "description": "Consulta los activos con mayores caídas en 24 horas en los mercados de referencia Hyperliquid. Compara acciones, ETF y otros mercados."
    }
  },
  "overnight-prices": {
    "en": {
      "title": "Overnight Stock Prices - After Hours Quotes | NightTicker",
      "description": "Check overnight stock prices after market close. Get Tesla, Nvidia, Apple, Samsung after-hours quotes. Powered by Hyperliquid."
    },
    "ko": {
      "title": "야간 주가 - 장마감 후 주식 시세 | 나이트티커",
      "description": "장마감 후 야간 주가를 확인하세요. 테슬라, 엔비디아, 삼성전자 등 미국주식, 한국주식의 야간 주식 시세를 제공합니다. 하이퍼리퀴드 기반."
    },
    "ja": {
      "title": "夜間株価 - 市場終了後の株式相場 | ナイトティッカー",
      "description": "市場終了後の夜間株価をチェック。テスラ、エヌビディア、サムスンなどの株価を提供。ハイパーリキッド基盤。"
    },
    "zh": {
      "title": "夜间价格",
      "description": "查看传统股票市场休市时的夜间参考价格。"
    },
    "pt": {
      "title": "Precos Noturnos",
      "description": "Verifique os precos de referencia atuais durante a noite quando os mercados de acoes tradicionais estao fechados."
    },
    "es": {
      "title": "Precios Nocturnos",
      "description": "Consulta los precios de referencia actuales durante la noche cuando los mercados de valores tradicionales estan cerrados."
    }
  },
  "weekend-prices": {
    "en": {
      "title": "Weekend Stock Prices - Saturday & Sunday Quotes | NightTicker",
      "description": "Check weekend stock prices. Get Saturday and Sunday quotes for Tesla, Nvidia, Apple, Samsung and more. Powered by Hyperliquid."
    },
    "ko": {
      "title": "주말 주가 - 토요일/일요일 주식 시세 | 나이트티커",
      "description": "주말 주가를 확인하세요. 토요일, 일요일에도 테슬라, 엔비디아, 삼성전자 등 주요 종목의 주식 시세를 제공합니다. 하이퍼리퀴드 기반."
    },
    "ja": {
      "title": "週末株価 - 土曜・日曜の株式相場 | ナイトティッカー",
      "description": "週末の株価をチェック。土曜日、日曜日もテスラ、エヌビディアなどの株価を提供。ハイパーリキッド基盤。"
    },
    "zh": {
      "title": "周末价格",
      "description": "查看传统股票市场休市时的周末参考价格。"
    },
    "pt": {
      "title": "Precos de Fim de Semana",
      "description": "Verifique os precos de referencia atuais nos fins de semana quando os mercados de acoes tradicionais estao fechados."
    },
    "es": {
      "title": "Precios de Fin de Semana",
      "description": "Consulta los precios de referencia actuales los fines de semana cuando los mercados de valores tradicionales estan cerrados."
    }
  },
  "holiday-prices": {
    "en": {
      "title": "Holiday Stock Prices - Market Holiday Quotes | NightTicker",
      "description": "Check holiday stock prices. Get market holiday quotes for Tesla, Nvidia, Apple, Samsung and more. Powered by Hyperliquid."
    },
    "ko": {
      "title": "휴일 주가 - 공휴일 주식 시세 | 나이트티커",
      "description": "휴일 주가를 확인하세요. 공휴일, 휴장일에도 테슬라, 엔비디아, 삼성전자 등 주요 종목의 주식 시세를 제공합니다. 하이퍼리퀴드 기반."
    },
    "ja": {
      "title": "休日株価 - 祝日の株式相場 | ナイトティッカー",
      "description": "休日の株価をチェック。祝日、市場休場日もテスラ、エヌビディアなどの株価を提供。ハイパーリキッド基盤。"
    },
    "zh": {
      "title": "节假日价格",
      "description": "查看传统股票市场休市时的节假日参考价格。"
    },
    "pt": {
      "title": "Precos de Feriado",
      "description": "Verifique os precos de referencia atuais durante feriados quando os mercados de acoes tradicionais estao fechados."
    },
    "es": {
      "title": "Precios de Festivos",
      "description": "Consulta los precios de referencia actuales durante los festivos cuando los mercados de valores tradicionales estan cerrados."
    }
  },
  "us-market-hours": {
    "en": {
      "title": "US Stock Market Hours - NYSE & NASDAQ Trading Hours | NightTicker",
      "description": "US stock market trading hours and schedule information."
    },
    "ko": {
      "title": "미국 주식시장 거래시간 - NYSE/나스닥 개장시간 | 나이트티커",
      "description": "미국 주식 시장 거래 시간 및 일정 정보."
    },
    "ja": {
      "title": "米国株式市場 取引時間 - NYSE/NASDAQ営業時間 | ナイトティッカー",
      "description": "米国株式市場の取引時間とスケジュール情報。"
    },
    "zh": {
      "title": "美股交易时间",
      "description": "美国股票市场交易时间和时间表信息。"
    },
    "pt": {
      "title": "Horario do Mercado EUA",
      "description": "Informacoes sobre horario de negociacao e calendario do mercado de acoes dos EUA."
    },
    "es": {
      "title": "Horario Mercado EEUU",
      "description": "Informacion sobre horarios de negociacion y calendario del mercado de valores de EEUU."
    }
  },
  "korea-market-hours": {
    "en": {
      "title": "Korea Stock Market Hours - KOSPI & KOSDAQ Trading Hours | NightTicker",
      "description": "Korean stock market trading hours and schedule information."
    },
    "ko": {
      "title": "한국 주식시장 거래시간 - 코스피/코스닥 개장시간 | 나이트티커",
      "description": "한국 주식 시장 거래 시간 및 일정 정보."
    },
    "ja": {
      "title": "韓国株式市場 取引時間 - KOSPI/KOSDAQ営業時間 | ナイトティッカー",
      "description": "韓国株式市場の取引時間とスケジュール情報。"
    },
    "zh": {
      "title": "韩股交易时间",
      "description": "韩国股票市场交易时间和时间表信息。"
    },
    "pt": {
      "title": "Horario do Mercado Coreia",
      "description": "Informacoes sobre horario de negociacao e calendario do mercado de acoes coreano."
    },
    "es": {
      "title": "Horario Mercado Corea",
      "description": "Informacion sobre horarios de negociacion y calendario del mercado de valores coreano."
    }
  },
  "how-data-works": {
    "en": {
      "title": "How Data Works - NightTicker Price Source | NightTicker",
      "description": "Learn how NightTicker provides night stock prices. Understand our Hyperliquid market price data source and reference price information."
    },
    "ko": {
      "title": "데이터 작동 방식 - 나이트티커 야간 주가 출처 | 나이트티커",
      "description": "나이트티커가 야간 주가를 제공하는 방식을 알아보세요. 하이퍼리퀴드 시장 가격 데이터 소스와 참고가격에 대해 설명합니다."
    },
    "ja": {
      "title": "データの仕組み - ナイトティッカーの価格ソース | ナイトティッカー",
      "description": "ナイトティッカーが夜間株価を提供する仕組みを説明。ハイパーリキッド市場価格データソースについて解説。"
    },
    "zh": {
      "title": "数据原理",
      "description": "了解NightTicker如何显示Hyperliquid市场价格。"
    },
    "pt": {
      "title": "Como os Dados Funcionam",
      "description": "Saiba como o NightTicker exibe Hyperliquid Market Prices."
    },
    "es": {
      "title": "Como Funcionan los Datos",
      "description": "Aprende como NightTicker muestra los Hyperliquid Market Prices."
    }
  },
  "what-is-hyperliquid": {
    "en": {
      "title": "What is Hyperliquid - NightTicker Price Source | NightTicker",
      "description": "Learn about Hyperliquid, the source of night stock prices on NightTicker. Understand how Hyperliquid market prices work."
    },
    "ko": {
      "title": "하이퍼리퀴드란 - 나이트티커 야간 주가 출처 | 나이트티커",
      "description": "나이트티커의 야간 주가 출처인 하이퍼리퀴드에 대해 알아보세요. 하이퍼리퀴드 시장과 참고가격의 특징을 설명합니다."
    },
    "ja": {
      "title": "ハイパーリキッドとは - ナイトティッカーの価格ソース | ナイトティッカー",
      "description": "ナイトティッカーの夜間株価ソースであるハイパーリキッドについて解説。ハイパーリキッド市場価格の特徴を説明。"
    },
    "zh": {
      "title": "什么是Hyperliquid",
      "description": "了解Hyperliquid，NightTicker上显示的市场价格的来源。"
    },
    "pt": {
      "title": "O que e Hyperliquid",
      "description": "Saiba mais sobre Hyperliquid, a fonte dos precos de mercado exibidos no NightTicker."
    },
    "es": {
      "title": "Que es Hyperliquid",
      "description": "Aprende sobre Hyperliquid, la fuente de los precios de mercado mostrados en NightTicker."
    }
  },
  "about": {
    "en": {
      "title": "About NightTicker - Night Stock Price Service | NightTicker",
      "description": "NightTicker provides night, weekend, and holiday stock reference prices. Learn about our mission and service. Powered by Hyperliquid."
    },
    "ko": {
      "title": "나이트티커 소개 - 야간 주가 서비스 | 나이트티커",
      "description": "나이트티커는 야간, 주말, 휴일에 주식 참고가격을 제공하는 서비스입니다. 나이트티커의 미션과 서비스에 대해 알아보세요. 하이퍼리퀴드 기반."
    },
    "ja": {
      "title": "ナイトティッカーについて - 夜間株価サービス | ナイトティッカー",
      "description": "ナイトティッカーは夜間、週末、休日に株式参考価格を提供するサービスです。ハイパーリキッド基盤。"
    },
    "zh": {
      "title": "关于NightTicker",
      "description": "了解NightTicker如何提供股票、ETF、指数和其他资产的夜间、周末与节假日参考行情，以及本服务的目的与数据来源。"
    },
    "pt": {
      "title": "Sobre NightTicker",
      "description": "Conheça o NightTicker, seu objetivo e a fonte dos preços de referência de ações, ETFs, índices e outros ativos à noite, nos fins de semana e feriados."
    },
    "es": {
      "title": "Acerca de NightTicker",
      "description": "Conoce NightTicker, su objetivo y la fuente de los precios de referencia de acciones, ETF, índices y otros activos de noche, en fines de semana y festivos."
    }
  },
  "disclaimer": {
    "en": {
      "title": "Disclaimer - NightTicker Legal Notice | NightTicker",
      "description": "NightTicker disclaimer and legal notice. Night stock prices are for reference only and not investment advice."
    },
    "ko": {
      "title": "면책조항 - 나이트티커 법적 고지 | 나이트티커",
      "description": "나이트티커 면책조항 및 법적 고지사항입니다. 야간 주가는 참고용 정보이며 투자 조언이 아닙니다."
    },
    "ja": {
      "title": "免責事項 - ナイトティッカー法的告知 | ナイトティッカー",
      "description": "ナイトティッカーの免責事項および法的告知。夜間株価は参考情報であり、投資アドバイスではありません。"
    },
    "zh": {
      "title": "免责声明",
      "description": "了解NightTicker参考行情的使用限制。Hyperliquid市场价格并非官方交易所报价，本服务不提供投资建议。"
    },
    "pt": {
      "title": "Aviso Legal",
      "description": "Entenda os limites dos preços de referência NightTicker. As cotações Hyperliquid não são preços oficiais de bolsa, e o serviço não oferece aconselhamento de investimento."
    },
    "es": {
      "title": "Aviso Legal",
      "description": "Conoce los límites de los precios de referencia NightTicker. Las cotizaciones Hyperliquid no son precios oficiales de bolsa y el servicio no ofrece asesoramiento de inversión."
    }
  },
  "privacy": {
    "en": {
      "title": "Privacy Policy | NightTicker",
      "description": "NightTicker privacy policy. Learn about what information we collect and how we handle your data."
    },
    "ko": {
      "title": "개인정보처리방침 | 나이트티커",
      "description": "나이트티커 개인정보처리방침입니다. 나이트티커가 수집하는 정보와 처리 방식을 안내합니다."
    },
    "ja": {
      "title": "プライバシーポリシー | ナイトティッカー",
      "description": "ナイトティッカーのプライバシーポリシー。収集する情報とその取り扱い方法について説明します。"
    },
    "zh": {
      "title": "隐私政策",
      "description": "阅读NightTicker隐私政策，了解网站如何使用浏览器本地存储、分析工具和相关数据，以及您的隐私选择。"
    },
    "pt": {
      "title": "Politica de Privacidade",
      "description": "Leia a política de privacidade do NightTicker e saiba como o site utiliza armazenamento local do navegador, ferramentas de análise e dados relacionados."
    },
    "es": {
      "title": "Politica de Privacidad",
      "description": "Lee la política de privacidad de NightTicker y conoce cómo el sitio utiliza almacenamiento local del navegador, herramientas de análisis y datos relacionados."
    }
  },
  "terms": {
    "en": {
      "title": "Terms of Service | NightTicker",
      "description": "NightTicker terms of service. Read about the conditions and policies for using our service."
    },
    "ko": {
      "title": "이용약관 | 나이트티커",
      "description": "나이트티커 이용약관입니다. 서비스 이용에 관한 조건과 정책을 안내합니다."
    },
    "ja": {
      "title": "利用規約 | ナイトティッカー",
      "description": "ナイトティッカーの利用規約。サービス利用に関する条件とポリシーを説明します。"
    },
    "zh": {
      "title": "服务条款",
      "description": "阅读NightTicker服务条款，了解参考价格信息的使用条件、用户责任和服务限制。"
    },
    "pt": {
      "title": "Termos de Servico",
      "description": "Leia os termos de serviço do NightTicker: condições de uso das informações de preços de referência, responsabilidades do usuário e limites do serviço."
    },
    "es": {
      "title": "Terminos de Servicio",
      "description": "Lee las condiciones de NightTicker: uso de la información de precios de referencia, responsabilidades del usuario y limitaciones del servicio."
    }
  },
  "popular": {
    "en": {
      "title": "Popular Markets",
      "description": "The most viewed markets over the last 24 hours. Rankings refresh every 30 minutes; rank changes compare the previous hourly snapshot."
    },
    "ko": {
      "title": "인기 종목 순위",
      "description": "최근 24시간 동안 많이 조회된 종목을 확인하세요. 순위는 30분마다 갱신하며 이전 시간대 스냅샷과 순위 변동을 비교합니다."
    },
    "ja": {
      "title": "人気銘柄ランキング",
      "description": "過去24時間でよく閲覧された銘柄を確認。ランキングは30分ごとに更新し、前の時間帯のスナップショットと順位を比較します。"
    },
    "zh": {
      "title": "热门资产排名",
      "description": "查看过去24小时浏览最多的资产。排名每30分钟更新，并与上一小时的排名快照比较。"
    },
    "pt": {
      "title": "Ativos populares",
      "description": "Veja os mercados mais consultados nas últimas 24 horas. O ranking é atualizado a cada 30 minutos e compara posições com o retrato da hora anterior."
    },
    "es": {
      "title": "Activos populares",
      "description": "Consulta los mercados más vistos en las últimas 24 horas. El ranking se actualiza cada 30 minutos y compara posiciones con la instantánea de la hora anterior."
    }
  }
} as const;

export function staticPageMetadata(locale: string, route: keyof typeof content) {
  const current = content[route][seoLocale(locale)];
  return pageMetadata(locale, '/' + route, current.title, current.description);
}
