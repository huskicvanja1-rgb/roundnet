// Supported locales for the Roundnet Directory
export const locales = ['en', 'de', 'fr', 'es', 'it'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

// Locale display names for language switcher
export const localeNames: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
};

// Locale flags for visual identification
export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  de: '🇩🇪',
  fr: '🇫🇷',
  es: '🇪🇸',
  it: '🇮🇹',
};

// Locale configuration for SEO
export const localeConfig: Record<Locale, { 
  hreflang: string; 
  htmlLang: string;
  dateFormat: string;
}> = {
  en: { hreflang: 'en', htmlLang: 'en', dateFormat: 'MMM d, yyyy' },
  de: { hreflang: 'de', htmlLang: 'de', dateFormat: 'd. MMM yyyy' },
  fr: { hreflang: 'fr', htmlLang: 'fr', dateFormat: 'd MMM yyyy' },
  es: { hreflang: 'es', htmlLang: 'es', dateFormat: 'd MMM yyyy' },
  it: { hreflang: 'it', htmlLang: 'it', dateFormat: 'd MMM yyyy' },
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
