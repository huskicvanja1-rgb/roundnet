import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/lib/i18n/locales';
import { Link } from '@/lib/i18n/routing';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://roundnet-directory.eu'),
  icons: {
    icon: '/favicon.ico',
  },
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const locale = params.locale as Locale;

  // Validate locale
  if (!locales.includes(locale)) {
    notFound();
  }

  // Enable static rendering
  unstable_setRequestLocale(locale);

  // Get messages for the locale
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">🏐</span>
                <span className="font-bold text-lg text-gray-900 hidden sm:block">
                  Roundnet Directory
                </span>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/clubs"
                  className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
                >
                  {(messages as any).nav?.clubs || 'Clubs'}
                </Link>
                <Link
                  href="/events"
                  className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
                >
                  {(messages as any).nav?.events || 'Events'}
                </Link>
                <Link
                  href="/about"
                  className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
                >
                  {(messages as any).nav?.about || 'About'}
                </Link>
              </nav>

              {/* Right side */}
              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <Link
                  href="/submit"
                  className="hidden sm:inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {(messages as any).nav?.submitClub || 'Add Club'}
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🏐</span>
                  <span className="font-bold text-lg text-white">Roundnet Directory</span>
                </div>
                <p className="text-sm text-gray-400 max-w-md">
                  {(messages as any).footer?.tagline || 'Find your Roundnet community across Europe'}
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-semibold text-white mb-4">
                  {(messages as any).footer?.quickLinks || 'Quick Links'}
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/clubs" className="hover:text-orange-400 transition-colors">
                      {(messages as any).nav?.clubs || 'Clubs'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/events" className="hover:text-orange-400 transition-colors">
                      {(messages as any).nav?.events || 'Events'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/submit" className="hover:text-orange-400 transition-colors">
                      {(messages as any).footer?.submitClub || 'Submit Club'}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="font-semibold text-white mb-4">
                  {(messages as any).footer?.legal || 'Legal'}
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/privacy" className="hover:text-orange-400 transition-colors">
                      {(messages as any).footer?.privacy || 'Privacy'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-orange-400 transition-colors">
                      {(messages as any).footer?.terms || 'Terms'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-orange-400 transition-colors">
                      {(messages as any).footer?.contact || 'Contact'}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-gray-500 text-center">
              © {new Date().getFullYear()} Roundnet Directory Europe. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </NextIntlClientProvider>
  );
}
