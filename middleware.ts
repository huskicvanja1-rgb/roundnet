import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // List of locales
  const locales = ['en', 'de', 'fr', 'es', 'it'];
  
  // Check if pathname starts with a locale
  const hasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}`) || pathname === `/${locale}`
  );

  if (hasLocale) return NextResponse.next();

  // Redirect to /en if no locale
  return NextResponse.redirect(new URL(`/en${pathname === '/' ? '' : pathname}`, request.url));
}

export const config = {
  matcher: ['/((?!_next|api|static|favicon.ico|public).*)'],
};

export const runtime = 'edge';
