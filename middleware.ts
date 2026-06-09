import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './lib/i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: true,
});

export const config = {
  matcher: ['/', '/(ko|en|ja|zh)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
