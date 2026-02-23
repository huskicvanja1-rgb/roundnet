/**
 * Internationalization Configuration
 * Supports: English, French, German, Spanish, Italian
 */

export const locales = ['en', 'fr', 'de', 'es', 'it'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  it: 'Italiano',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  de: '🇩🇪',
  es: '🇪🇸',
  it: '🇮🇹',
};

/**
 * Get the preferred locale from browser/request
 */
export function getPreferredLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [locale, q = 'q=1'] = lang.trim().split(';');
      const quality = parseFloat(q.replace('q=', '')) || 1;
      return { locale: locale.split('-')[0].toLowerCase(), quality };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { locale } of languages) {
    if (locales.includes(locale as Locale)) {
      return locale as Locale;
    }
  }

  return defaultLocale;
}

/**
 * Check if a locale is valid
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

/**
 * Get translated value from a JSON translation object
 */
export function getTranslation(
  translations: Record<string, string> | null | undefined,
  locale: Locale,
  fallback = ''
): string {
  if (!translations) return fallback;
  return translations[locale] || translations.en || translations[Object.keys(translations)[0]] || fallback;
}

/**
 * Generate alternate language URLs for SEO
 */
export function generateAlternateUrls(
  path: string,
  baseUrl: string
): Record<string, string> {
  const alternates: Record<string, string> = {};
  
  for (const locale of locales) {
    alternates[locale] = `${baseUrl}/${locale}${path}`;
  }
  
  alternates['x-default'] = `${baseUrl}/en${path}`;
  
  return alternates;
}
