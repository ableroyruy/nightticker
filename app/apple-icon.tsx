import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  const logoUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nightticker.com'}/nightticker-logo-transparent-512.png`;

  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt="NightTicker"
        width={180}
        height={180}
        style={{
          borderRadius: 40,
        }}
      />
    ),
    { ...size }
  );
}
