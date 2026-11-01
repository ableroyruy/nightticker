import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './lib/i18n';
import { canonicalMarketPath } from './lib/seo/site';

const localize = createMiddleware({ locales, defaultLocale, localePrefix: 'as-needed', localeDetection: true });
export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  // Removing an explicit default-language prefix is stable URL normalization,
  // including static documents; locale negotiation remains temporary.
  const englishPath = /^\/en(?:\/|$)/i.test(pathname) ? pathname.replace(/^\/en(?:\/|$)/i, '/') : null;
  const canonicalPath = canonicalMarketPath(pathname) ?? englishPath;
  if (canonicalPath) {
    const destination = request.nextUrl.clone();
    destination.pathname = canonicalPath;
    const response = NextResponse.redirect(destination, 308);
    // An explicit /en URL selects English even when the visitor previously
    // selected another locale; preserve that choice when removing the prefix.
    if (englishPath) response.cookies.set('NEXT_LOCALE', 'en', { path: '/', sameSite: 'lax' });
    return response;
  }
  return localize(request);
}
export const config = {
  matcher: ['/', '/(ko|en|ja|zh|pt|es)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
