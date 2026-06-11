import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: 40,
        }}
      >
        {/* Simple "N" with accent */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <span
            style={{
              fontSize: 100,
              fontWeight: 800,
              color: '#ffffff',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '-4px',
            }}
          >
            N
          </span>
          {/* Small accent dot */}
          <div
            style={{
              position: 'absolute',
              top: 25,
              right: -10,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#22c55e',
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
