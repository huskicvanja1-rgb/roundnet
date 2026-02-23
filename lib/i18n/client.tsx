'use client';

import { createContext, useContext, type ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Messages Context – replaces NextIntlClientProvider
// ---------------------------------------------------------------------------
const MessagesContext = createContext<Record<string, any>>({});

export function MessagesProvider({
  messages,
  children,
}: {
  messages: Record<string, any>;
  children: ReactNode;
}) {
  return (
    <MessagesContext.Provider value={messages}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages(): Record<string, any> {
  return useContext(MessagesContext);
}

// ---------------------------------------------------------------------------
// Client-side translation hook
// ---------------------------------------------------------------------------
function interpolate(
  template: string,
  values?: Record<string, string | number>,
): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_: string, key: string) =>
    values[key] !== undefined ? String(values[key]) : `{${key}}`,
  );
}

export function useTranslations(namespace: string) {
  const messages = useMessages();
  const section: Record<string, string> = messages[namespace] || {};

  return (key: string, values?: Record<string, string | number>): string => {
    const template = section[key];
    if (template === undefined) return key;
    return interpolate(template, values);
  };
}
