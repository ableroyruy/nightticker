import { metadataLogo } from '@/lib/metadata-logo';
import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  const logoUrl = metadataLogo;

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
