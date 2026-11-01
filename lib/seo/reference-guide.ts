import { seoLocale } from './site';

// Server-rendered reading guidance complements asset-specific product information.
// Every answer is also displayed on the page that emits its FAQ structured data.
export function referenceGuide(locale: string, name: string) {
  return {
    en: {
      sections: [
        { title: `${name} after the closing bell`, text: `Compare the reference price with the same underlying asset, quote unit and timestamp. The Hyperliquid midpoint reflects its derivatives market, so a change after the exchange closes is not a new official closing price for ${name}.` },
        { title: `${name} on weekends`, text: 'Weekend liquidity and spreads can differ from regular sessions. A midpoint is a reference between bids and asks, rather than a guaranteed executable price. Check the update status before comparing movements across markets.' },
        { title: `${name} during market holidays`, text: 'The underlying exchange follows its own country calendar and time zone, including daylight saving time where applicable. The derivatives market may continue independently; an available quote does not mean the underlying exchange is open.' },
      ],
      faq: [
        { q: `How is the 24-hour change for ${name} calculated?`, a: 'The current reference price is compared with the previous-day price supplied by Hyperliquid. The percentage is (current price − reference price) ÷ reference price × 100. It is not necessarily the change from the underlying exchange’s previous close.' },
        { q: 'Why can the chart and current price differ?', a: 'The mini chart uses five-minute candles over approximately six hours; the price card uses the latest midpoint. Candle closes, the midpoint and their update times can differ. A six-hour chart does not represent the full 24-hour change.' },
        { q: 'What does missing or delayed data mean?', a: 'A new or inactive market may have too few candles, and network interruptions can delay updates. A missing valid previous-day price leaves the change unavailable; it must not be interpreted as a zero change. Check the connection and update information.' },
        { q: 'Does this price represent ownership of the underlying asset?', a: 'No. This page reports a derivatives reference market. It is not a stock purchase, an official exchange quote or a guarantee that the underlying asset can be traded at the displayed price. Review the product information above to identify the reference.' },
      ],
    },
    ko: {
      sections: [
        { title: `${name} 장마감 후 시세 읽기`, text: `같은 기초자산·표시 단위·시각을 기준으로 비교하세요. Hyperliquid 중간가격은 파생상품 시장의 호가를 반영하므로, 장마감 후 ${name}의 가격이 움직여도 공식 거래소의 새 종가가 생긴 것은 아닙니다.` },
        { title: `${name} 주말 시세 확인`, text: '주말에는 정규 거래시간과 유동성·매수매도 호가 차이가 달라질 수 있습니다. 중간가격은 매수·매도 호가 사이의 참고값으로, 실제 체결 가능한 가격을 보장하지 않습니다. 시장 간 움직임을 비교하기 전에 갱신 상태를 확인하세요.' },
        { title: `${name} 휴일 시세와 거래일`, text: '기초자산 거래소는 국가별 휴장일과 현지 시간대를 따르며, 해당 지역의 서머타임도 영향을 줍니다. 파생상품 시장은 별도로 움직일 수 있어 참고가격이 표시된다는 이유만으로 기초자산 거래소가 개장했다고 판단할 수 없습니다.' },
      ],
      faq: [
        { q: `${name}의 24시간 변동은 어떻게 계산하나요?`, a: '현재 참고가격을 Hyperliquid가 제공하는 전일 기준가격과 비교합니다. 변동률은 (현재가격 − 기준가격) ÷ 기준가격 × 100입니다. 기초자산 거래소의 전일 종가 대비 변동과 반드시 같지는 않습니다.' },
        { q: '차트와 현재가격이 다른 이유는 무엇인가요?', a: '미니 차트는 약 6시간의 5분봉을 사용하고 가격 카드는 최신 중간가격을 사용합니다. 봉의 종가·중간가격·갱신 시점은 서로 다를 수 있습니다. 6시간 차트가 24시간 전체 변동을 나타내지는 않습니다.' },
        { q: '데이터가 없거나 늦으면 어떻게 해석하나요?', a: '신규·비활성 시장은 캔들이 부족할 수 있고 네트워크 장애로 갱신이 늦어질 수도 있습니다. 유효한 전일 기준가격이 없으면 변동값을 제공하지 않으며 이를 보합으로 해석하면 안 됩니다. 연결 상태와 갱신 정보를 확인하세요.' },
        { q: '이 가격은 기초자산 보유를 의미하나요?', a: '아닙니다. 이 페이지는 파생상품 참고시세를 제공합니다. 주식 매수나 공식 거래소 호가를 의미하지 않으며, 표시가격에 기초자산을 거래할 수 있다는 보장도 아닙니다. 위 상품 정보에서 참고 대상을 확인하세요.' },
      ],
    },
    ja: {
      sections: [
        { title: `${name}の市場終了後の相場`, text: `同じ原資産、表示単位、時刻で比較してください。Hyperliquidの仲値はデリバティブ市場の気配を反映するため、閉場後に${name}の参考価格が動いても公式取引所の新しい終値ではありません。` },
        { title: `${name}の週末相場`, text: '週末は通常時間と流動性や売買スプレッドが異なる場合があります。仲値は買い気配と売り気配の間の参考値であり、約定価格を保証しません。市場間で値動きを比べる前に更新状況をご確認ください。' },
        { title: `${name}の休日と取引日`, text: '原資産の取引所は国ごとの休場日、現地時間、適用される夏時間に従います。デリバティブ市場は独立して動く場合があり、参考価格が表示されても原資産の取引所が開場中とは限りません。' },
      ],
      faq: [
        { q: `${name}の24時間変動はどう計算しますか？`, a: '現在の参考価格をHyperliquid提供の前日基準価格と比較します。変動率は（現在価格 − 基準価格）÷ 基準価格 × 100です。原資産の取引所における前日終値比とは必ずしも一致しません。' },
        { q: 'チャートと現在価格が異なる理由は？', a: 'ミニチャートは約6時間の5分足、価格カードは最新の仲値を使います。足の終値、仲値、更新時刻は異なる場合があります。6時間チャートは24時間全体の変動を表しません。' },
        { q: 'データが欠けたり遅れたりする場合は？', a: '新規・非活発な市場では足が不足し、通信障害で更新が遅れることもあります。有効な前日基準価格がない場合、変動値は提供されません。変動ゼロと解釈せず、接続・更新情報をご確認ください。' },
        { q: 'この価格は原資産の保有を意味しますか？', a: 'いいえ。デリバティブの参考市場を表示しています。株式購入、公式取引所の気配値、表示価格での原資産売買を保証するものではありません。上の商品情報で参照対象をご確認ください。' },
      ],
    },
    zh: {
      sections: [
        { title: `${name}收盘后的行情`, text: `请比较相同标的资产、报价单位和时间。Hyperliquid中间价反映其衍生品市场的买卖报价，因此${name}在收盘后的参考价格变化并不是官方交易所产生了新的收盘价。` },
        { title: `${name}周末行情`, text: '周末的流动性和买卖价差可能与正常交易时段不同。中间价是买价与卖价之间的参考值，不保证可以按此价格成交。比较不同市场的变化前，请先检查更新状态。' },
        { title: `${name}节假日与交易日`, text: '标的交易所遵循所在国家的休市日和当地时区，包括适用的夏令时。衍生品市场可能独立运行；有参考报价不代表标的交易所正在开市。' },
      ],
      faq: [
        { q: `${name}的24小时变化如何计算？`, a: '以当前参考价格与Hyperliquid提供的前日基准价格比较。百分比为（当前价格 − 基准价格）÷ 基准价格 × 100，不一定等于标的交易所相对前一收盘价的变化。' },
        { q: '为什么图表与当前价格不同？', a: '迷你图表使用约6小时的5分钟K线，价格卡片使用最新中间价。K线收盘价、中间价和更新时间可能不同。6小时图表不代表完整的24小时变化。' },
        { q: '数据缺失或延迟意味着什么？', a: '新市场或不活跃市场可能缺少K线，网络中断也可能导致更新延迟。没有有效的前日基准价格时不提供变化值，不能将其视为零变化。请检查连接与更新信息。' },
        { q: '该价格代表持有标的资产吗？', a: '不代表。本页展示衍生品参考市场，不是股票购买、官方交易所报价，也不保证可以按显示价格交易标的资产。请阅读上方产品信息确认参考对象。' },
      ],
    },
    pt: {
      sections: [
        { title: `${name} após o fechamento`, text: `Compare o mesmo ativo subjacente, unidade de cotação e horário. O preço médio da Hyperliquid reflete seu mercado de derivativos; uma mudança em ${name} após o fechamento não é um novo preço oficial de fechamento.` },
        { title: `${name} nos fins de semana`, text: 'A liquidez e o spread podem diferir das sessões regulares. O preço médio entre compra e venda é uma referência, não uma garantia de execução. Confira o estado da atualização antes de comparar movimentos entre mercados.' },
        { title: `${name} nos feriados`, text: 'A bolsa do ativo subjacente segue o calendário e o fuso locais, incluindo o horário de verão quando aplicável. O mercado de derivativos pode funcionar de forma independente; uma cotação disponível não significa que a bolsa esteja aberta.' },
      ],
      faq: [
        { q: `Como é calculada a variação de 24 horas de ${name}?`, a: 'O preço atual é comparado ao preço de referência do dia anterior fornecido pela Hyperliquid. O percentual é (preço atual − referência) ÷ referência × 100. Ele pode diferir da variação sobre o fechamento anterior da bolsa do ativo.' },
        { q: 'Por que o gráfico e o preço atual podem diferir?', a: 'O minigráfico usa candles de cinco minutos de aproximadamente seis horas; o cartão usa o preço médio mais recente. Fechamentos, preço médio e horários de atualização podem diferir. O gráfico de seis horas não representa a variação completa de 24 horas.' },
        { q: 'O que significam dados ausentes ou atrasados?', a: 'Mercados novos ou inativos podem ter poucos candles e falhas de rede podem atrasar atualizações. Sem referência válida do dia anterior, a variação fica indisponível; isso não significa variação zero. Confira a conexão e a atualização.' },
        { q: 'Esse preço representa propriedade do ativo?', a: 'Não. Esta página mostra um mercado de referência de derivativos. Não representa compra de ações, cotação oficial ou garantia de negociar o ativo pelo preço exibido. Confira a referência nas informações do produto acima.' },
      ],
    },
    es: {
      sections: [
        { title: `${name} después del cierre`, text: `Compara el mismo activo subyacente, unidad de cotización y hora. El precio medio de Hyperliquid refleja su mercado de derivados; un cambio en ${name} después del cierre no es un nuevo precio oficial de cierre.` },
        { title: `${name} en fines de semana`, text: 'La liquidez y el diferencial de compra y venta pueden diferir de las sesiones habituales. El precio medio es una referencia, no una garantía de ejecución. Comprueba el estado de actualización antes de comparar movimientos entre mercados.' },
        { title: `${name} durante festivos`, text: 'La bolsa del activo subyacente sigue el calendario y la zona horaria locales, incluido el horario de verano cuando corresponda. El mercado de derivados puede funcionar de forma independiente; una cotización disponible no significa que la bolsa esté abierta.' },
      ],
      faq: [
        { q: `¿Cómo se calcula la variación de 24 horas de ${name}?`, a: 'Se compara el precio actual con el precio de referencia del día anterior facilitado por Hyperliquid. El porcentaje es (precio actual − referencia) ÷ referencia × 100. Puede diferir de la variación frente al cierre anterior de la bolsa del activo.' },
        { q: '¿Por qué pueden diferir el gráfico y el precio actual?', a: 'El minigráfico utiliza velas de cinco minutos de unas seis horas; la tarjeta utiliza el precio medio más reciente. Los cierres, el precio medio y la hora de actualización pueden diferir. El gráfico de seis horas no representa la variación completa de 24 horas.' },
        { q: '¿Qué significan los datos ausentes o retrasados?', a: 'Los mercados nuevos o inactivos pueden tener pocas velas y los fallos de red pueden retrasar las actualizaciones. Sin una referencia válida del día anterior, la variación no está disponible; no debe interpretarse como cero. Comprueba la conexión y la actualización.' },
        { q: '¿Este precio representa la propiedad del activo?', a: 'No. Esta página muestra un mercado de referencia de derivados. No representa una compra de acciones, una cotización oficial ni una garantía de negociar el activo al precio mostrado. Consulta la referencia en la información del producto anterior.' },
      ],
    },
  }[seoLocale(locale)];
}
