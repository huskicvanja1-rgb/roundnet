import type { Metadata } from 'next';
import { locales, type Locale, localeConfig } from '../i18n/locales';

// Site URL from env or default
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://roundnet-directory.eu';

// Constant for home path
export const HOME_PATH = '';

/**
 * Generate absolute URL for a path
 */
export function getAbsoluteUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}

/**
 * Generate hreflang alternates for all locales
 */
export function generateAlternates(
  pathWithoutLocale: string,
  currentLocale: Locale
): Metadata['alternates'] {
  const normalizedPath = pathWithoutLocale.startsWith('/') 
    ? pathWithoutLocale 
    : `/${pathWithoutLocale}`;

  const languages: Record<string, string> = {};
  
  for (const locale of locales) {
    languages[localeConfig[locale].hreflang] = getAbsoluteUrl(`/${locale}${normalizedPath}`);
  }
  
  // Add x-default pointing to default locale (en)
  languages['x-default'] = getAbsoluteUrl(`/en${normalizedPath}`);

  return {
    canonical: getAbsoluteUrl(`/${currentLocale}${normalizedPath}`),
    languages,
  };
}

/**
 * Base metadata options
 */
interface BaseMetadataOptions {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  noIndex?: boolean;
  ogImage?: string;
  ogType?: 'website' | 'article';
  type?: 'website' | 'article';
}

/**
 * Generate complete metadata for a page
 */
export function generatePageMetadata({
  locale,
  path,
  title,
  description,
  noIndex = false,
  ogImage,
  ogType = 'website',
}: BaseMetadataOptions): Metadata {
  // Fallback to 'en' if locale is undefined or invalid
  const safeLocale = locale && localeConfig[locale] ? locale : 'en';
  const absoluteUrl = getAbsoluteUrl(`/${safeLocale}${path}`);
  const defaultOgImage = getAbsoluteUrl('/og-image.png');

  return {
    title,
    description,
    alternates: generateAlternates(path, safeLocale),
    openGraph: {
      title,
      description,
      url: absoluteUrl,
      siteName: 'Roundnet Directory Europe',
      locale: localeConfig[safeLocale].htmlLang,
      type: ogType,
      images: [
        {
          url: ogImage || defaultOgImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage || defaultOgImage],
    },
    robots: noIndex
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

/**
 * Country page metadata options
 */
interface CountryMetadataOptions {
  locale: Locale;
  country: {
    name: string;
    slug: string;
    description?: string;
  };
  clubCount: number;
  t: {
    title: (name: string, count: number) => string;
    description: (name: string, count: number) => string;
  };
}

/**
 * Country page metadata
 */
export function generateCountryMetadata({
  locale,
  country,
  clubCount,
  t,
}: CountryMetadataOptions): Metadata {
  const title = t.title(country.name, clubCount);
  const description = t.description(country.name, clubCount);
  
  return generatePageMetadata({
    locale,
    path: `/clubs/${country.slug}`,
    title,
    description,
    noIndex: clubCount === 0,
  });
}

/**
 * City page metadata options
 */
interface CityMetadataOptions {
  locale: Locale;
  city: {
    name: string;
    slug: string;
  };
  country: {
    name: string;
    slug: string;
  };
  clubCount: number;
  t: {
    title: (cityName: string, countryName: string, count: number) => string;
    description: (cityName: string, countryName: string, count: number) => string;
  };
}

/**
 * City page metadata
 */
export function generateCityMetadata({
  locale,
  city,
  country,
  clubCount,
  t,
}: CityMetadataOptions): Metadata {
  const title = t.title(city.name, country.name, clubCount);
  const description = t.description(city.name, country.name, clubCount);
  
  return generatePageMetadata({
    locale,
    path: `/clubs/${country.slug}/${city.slug}`,
    title,
    description,
    noIndex: clubCount === 0,
  });
}

/**
 * Club page metadata options
 */
interface ClubMetadataOptions {
  locale: Locale;
  club: {
    name: string;
    slug: string;
    description?: string;
    city?: string;
    country?: string;
  };
  t: {
    title: (name: string, city?: string) => string;
    description: (name: string, city?: string, country?: string) => string;
  };
}

/**
 * Club page metadata
 */
export function generateClubMetadata({
  locale,
  club,
  t,
}: ClubMetadataOptions): Metadata {
  const title = t.title(club.name, club.city);
  const description = t.description(club.name, club.city, club.country);
  
  return generatePageMetadata({
    locale,
    path: `/club/${club.slug}`,
    title,
    description,
  });
}
