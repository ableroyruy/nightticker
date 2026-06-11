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
          background: 'linear-gradient(145deg, #0c0a1d 0%, #1a1635 50%, #0f172a 100%)',
          borderRadius: 40,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow effects */}
        <div
          style={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%)',
            top: '20%',
            left: '-20%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%)',
            top: '-10%',
            right: '-10%',
          }}
        />

        <svg
          width="150"
          height="150"
          viewBox="0 0 150 150"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Crescent Moon */}
          <circle cx="112" cy="38" r="22" fill="#fbbf24" />
          <circle cx="124" cy="32" r="20" fill="#0c0a1d" />
          {/* Stars */}
          <circle cx="25" cy="25" r="2" fill="#fff" opacity="0.6" />
          <circle cx="45" cy="40" r="1.5" fill="#fff" opacity="0.4" />
          <circle cx="70" cy="20" r="1" fill="#fff" opacity="0.5" />
          <circle cx="30" cy="55" r="1.5" fill="#fff" opacity="0.3" />
          {/* Chart candlesticks */}
          <rect x="20" y="90" width="12" height="30" rx="2" fill="#ef4444" opacity="0.9" />
          <rect x="24" y="82" width="4" height="48" rx="1" fill="#ef4444" opacity="0.9" />
          <rect x="42" y="75" width="12" height="35" rx="2" fill="#22c55e" opacity="0.9" />
          <rect x="46" y="68" width="4" height="50" rx="1" fill="#22c55e" opacity="0.9" />
          <rect x="64" y="85" width="12" height="25" rx="2" fill="#ef4444" opacity="0.9" />
          <rect x="68" y="80" width="4" height="38" rx="1" fill="#ef4444" opacity="0.9" />
          <rect x="86" y="55" width="12" height="45" rx="2" fill="#22c55e" opacity="0.9" />
          <rect x="90" y="48" width="4" height="60" rx="1" fill="#22c55e" opacity="0.9" />
          <rect x="108" y="70" width="12" height="30" rx="2" fill="#22c55e" opacity="0.9" />
          <rect x="112" y="62" width="4" height="46" rx="1" fill="#22c55e" opacity="0.9" />
          {/* Glowing trend line */}
          <path
            d="M26 95 L48 85 L70 92 L92 60 L114 75"
            stroke="url(#glowLine)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M26 95 L48 85 L70 92 L92 60 L114 75"
            stroke="url(#mainLine)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <defs>
            <linearGradient id="glowLine" x1="26" y1="95" x2="114" y2="60">
              <stop stopColor="#22c55e" stopOpacity="0.5" />
              <stop offset="1" stopColor="#4ade80" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="mainLine" x1="26" y1="95" x2="114" y2="60">
              <stop stopColor="#22c55e" />
              <stop offset="1" stopColor="#86efac" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    { ...size }
  );
}
