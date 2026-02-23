import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from './locales';

export const localePrefix = 'always';

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales, localePrefix });

// Helper to generate locale-prefixed paths
export function getLocalePath(locale: string, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${normalizedPath}`;
}

// Helper to remove locale prefix from path
export function removeLocalePrefix(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && locales.includes(segments[0] as any)) {
    return '/' + segments.slice(1).join('/');
  }
  return pathname;
}

// Get all locale paths for a given path (for hreflang)
export function getAllLocalePaths(path: string): Record<string, string> {
  const cleanPath = removeLocalePrefix(path);
  return Object.fromEntries(
    locales.map((locale) => [locale, getLocalePath(locale, cleanPath)])
  );
}
