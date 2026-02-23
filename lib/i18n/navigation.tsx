'use client';

import NextLink from 'next/link';
import { useParams } from 'next/navigation';
import { forwardRef, type ComponentProps } from 'react';
import { defaultLocale } from './locales';

// ---------------------------------------------------------------------------
// Locale-aware Link – replaces next-intl/navigation Link
// ---------------------------------------------------------------------------
type LinkProps = Omit<ComponentProps<typeof NextLink>, 'href'> & {
  href: string;
  /** Override locale (used by LanguageSwitcher to link to other locales) */
  locale?: string;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  function Link({ href, locale, ...props }, ref) {
    const params = useParams();
    const currentLocale =
      locale || (params?.locale as string) || defaultLocale;

    // Don't touch external, hash, or mailto links
    if (
      href.startsWith('http') ||
      href.startsWith('#') ||
      href.startsWith('mailto:')
    ) {
      return <NextLink ref={ref} href={href} {...props} />;
    }

    const normalizedHref = href.startsWith('/') ? href : `/${href}`;
    const localizedHref = `/${currentLocale}${normalizedHref}`;

    return <NextLink ref={ref} href={localizedHref} {...props} />;
  },
);

// ---------------------------------------------------------------------------
// useLocale – replaces next-intl useLocale()
// ---------------------------------------------------------------------------
export function useLocale(): string {
  const params = useParams();
  return (params?.locale as string) || defaultLocale;
}
