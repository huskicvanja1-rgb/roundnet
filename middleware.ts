import createMiddleware from 'next-intl/middleware';

// Inline locales to avoid Edge Runtime import issues on Vercel
const locales = ['en', 'de', 'fr', 'es', 'it'];
const defaultLocale = 'en';

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

// Use Edge Runtime for middleware - most reliable with next-intl
export const runtime = 'edge';
