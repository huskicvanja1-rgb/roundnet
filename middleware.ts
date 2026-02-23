import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/lib/i18n/locales';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always use locale prefix (even for default locale)
  localePrefix: 'always',
});

export const config = {
  // Match only internationalized pathnames
  // Skip api routes, static files, and other non-page routes
  matcher: [
    // Match all pathnames except for
    // - /api (API routes)
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - /static (static files)
    // - .*\\..*$ (files with extensions like .js, .css, .png, etc.)
    '/((?!api|_next|_vercel|static|.*\\..*|_next/static|_next/image|favicon.ico).*)',
  ],
};
