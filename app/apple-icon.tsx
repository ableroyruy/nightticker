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
          background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
          borderRadius: 32,
        }}
      >
        <svg
          width="140"
          height="140"
          viewBox="0 0 140 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Chart line */}
          <path
            d="M10 100 L35 85 L60 92 L85 50 L110 62 L130 30"
            stroke="url(#chartGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Moon */}
          <circle cx="105" cy="35" r="18" fill="#fbbf24" />
          <circle cx="115" cy="30" r="16" fill="#1e1b4b" />
          <defs>
            <linearGradient id="chartGrad" x1="10" y1="100" x2="130" y2="30">
              <stop stopColor="#22c55e" />
              <stop offset="1" stopColor="#4ade80" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    { ...size }
  );
}
