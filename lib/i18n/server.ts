import { cache } from 'react';
import { locales, defaultLocale, type Locale } from './locales';

// ---------------------------------------------------------------------------
// Request-scoped locale store (replaces unstable_setRequestLocale)
// React's cache() creates a new store per server request.
// ---------------------------------------------------------------------------
const getRequestLocaleStore = cache(() => ({ locale: defaultLocale as string }));

export function setRequestLocale(locale: string) {
  getRequestLocaleStore().locale = locale;
}

function getCurrentLocale(): string {
  return getRequestLocaleStore().locale;
}

// ---------------------------------------------------------------------------
// Message loading
// ---------------------------------------------------------------------------
async function loadMessages(locale: string): Promise<Record<string, any>> {
  switch (locale) {
    case 'de':
      return (await import('../../messages/de.json')).default;
    case 'fr':
      return (await import('../../messages/fr.json')).default;
    case 'es':
      return (await import('../../messages/es.json')).default;
    case 'it':
      return (await import('../../messages/it.json')).default;
    default:
      return (await import('../../messages/en.json')).default;
  }
}

export async function getMessages(locale?: string): Promise<Record<string, any>> {
  const loc = locale || getCurrentLocale();
  const validLocale = locales.includes(loc as Locale) ? loc : defaultLocale;
  return loadMessages(validLocale);
}

// ---------------------------------------------------------------------------
// Interpolation – handles {variable} placeholders in translation strings
// ---------------------------------------------------------------------------
function interpolate(
  template: string,
  values?: Record<string, string | number>,
): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    values[key] !== undefined ? String(values[key]) : `{${key}}`,
  );
}

// ---------------------------------------------------------------------------
// Translation function factory
// ---------------------------------------------------------------------------
type TranslatorFn = (
  key: string,
  values?: Record<string, string | number>,
) => string;

/**
 * Server-side translation helper.
 *
 * Supports two call signatures (mirrors next-intl API):
 *   await getTranslations('namespace')                   – uses request locale
 *   await getTranslations({ locale, namespace: 'ns' })   – explicit locale
 */
export async function getTranslations(
  namespaceOrOptions: string | { locale: string; namespace: string },
): Promise<TranslatorFn> {
  let locale: string;
  let namespace: string;

  if (typeof namespaceOrOptions === 'string') {
    locale = getCurrentLocale();
    namespace = namespaceOrOptions;
  } else {
    locale = namespaceOrOptions.locale;
    namespace = namespaceOrOptions.namespace;
  }

  const messages = await getMessages(locale);
  const section: Record<string, string> = messages[namespace] || {};

  return (key: string, values?: Record<string, string | number>): string => {
    const template = section[key];
    if (template === undefined) return key;
    return interpolate(template, values);
  };
}
