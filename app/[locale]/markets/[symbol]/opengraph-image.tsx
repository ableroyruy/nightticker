import { ImageResponse } from 'next/og';
import { getStockBySymbol } from '@/lib/markets/stocks';

export const runtime = 'edge';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; symbol: string }>;
}) {
  const { locale, symbol } = await params;
  const stock = getStockBySymbol(symbol);

  if (!stock) {
    return new ImageResponse(
      (
        <div
          style={{
            background: '#0f172a',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '48px',
          }}
        >
          Not Found
        </div>
      ),
      { ...size }
    );
  }

  const name = locale === 'ko' ? stock.nameKo : stock.name;
  const priceLabel = locale === 'ko' ? '야간 시세' : 'Night Price';
  const source = locale === 'ko' ? 'Hyperliquid 기준 참고가격' : 'Hyperliquid Market Price';

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px',
              fontSize: '32px',
              color: 'white',
            }}
          >
            N
          </div>
          <span style={{ fontSize: '32px', fontWeight: 600, color: 'white' }}>NightTicker</span>
        </div>

        {/* Stock Info */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
          <div
            style={{
              fontSize: '96px',
              fontWeight: 700,
              color: 'white',
              marginBottom: '16px',
              letterSpacing: '-2px',
            }}
          >
            {stock.symbol}
          </div>
          <div
            style={{
              fontSize: '48px',
              color: '#94a3b8',
              marginBottom: '32px',
            }}
          >
            {name}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '24px',
                color: '#60a5fa',
              }}
            >
              {priceLabel}
            </div>
            <span style={{ fontSize: '20px', color: '#64748b' }}>{stock.category}</span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(148, 163, 184, 0.2)',
            paddingTop: '24px',
          }}
        >
          <span style={{ fontSize: '18px', color: '#475569' }}>{source}</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
