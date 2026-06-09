import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const title = 'NightTicker';
  const tagline = locale === 'ko' ? '시장은 잠들지 않는다' : 'The Market Never Sleeps';
  const description =
    locale === 'ko'
      ? '야간 시세 | 주말 시세 | 휴일 시세'
      : 'Overnight Prices | Weekend Prices | Holiday Prices';

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '24px',
              fontSize: '48px',
            }}
          >
            N
          </div>
          <div
            style={{
              fontSize: '72px',
              fontWeight: 700,
              color: 'white',
              letterSpacing: '-2px',
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            fontSize: '36px',
            color: '#94a3b8',
            marginBottom: '32px',
            fontWeight: 500,
          }}
        >
          {tagline}
        </div>

        <div
          style={{
            fontSize: '24px',
            color: '#64748b',
            textAlign: 'center',
          }}
        >
          {description}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '18px',
            color: '#475569',
          }}
        >
          <span>Powered by Hyperliquid Market Prices</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
