import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n.ts');

const nextConfig: NextConfig = {
  async redirects() {
    return [{
      source: '/:path*',
      has: [{ type: 'host', value: 'nightticker.com' }],
      destination: 'https://www.nightticker.com/:path*',
      permanent: true,
    }];
  },
};

export default withNextIntl(nextConfig);
