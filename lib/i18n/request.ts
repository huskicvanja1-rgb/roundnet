import { getRequestConfig } from 'next-intl/server';
import { locales, type Locale, defaultLocale } from './locales';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale is valid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
