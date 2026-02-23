'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, MapPin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { locales, localeNames, localeFlags, type Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

interface HeaderProps {
  locale: Locale;
  dictionary: Dictionary['nav'];
}

export function Header({ locale, dictionary }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: dictionary.home, href: `/${locale}` },
    { name: dictionary.clubs, href: `/${locale}/clubs` },
    { name: dictionary.events, href: `/${locale}/events` },
    { name: dictionary.blog, href: `/${locale}/blog` },
    { name: dictionary.about, href: `/${locale}/about` },
  ];

  // Get current path without locale for language switching
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center space-x-2">
          <MapPin className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">
            <span className="gradient-text">Roundnet</span>
            <span className="text-muted-foreground">.eu</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === item.href
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center space-x-1"
            >
              <Globe className="h-4 w-4" />
              <span>{localeFlags[locale]}</span>
            </Button>
            
            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-md bg-background border shadow-lg py-1 z-50">
                {locales.map((loc) => (
                  <Link
                    key={loc}
                    href={`/${loc}${pathWithoutLocale}`}
                    onClick={() => setLangMenuOpen(false)}
                    className={cn(
                      'flex items-center space-x-2 px-4 py-2 text-sm hover:bg-accent',
                      loc === locale && 'bg-accent'
                    )}
                  >
                    <span>{localeFlags[loc]}</span>
                    <span>{localeNames[loc]}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* CTA Button */}
          <Button asChild size="sm" className="hidden sm:flex">
            <Link href={`/${locale}/submit`}>
              {dictionary.submit}
            </Link>
          </Button>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block text-base font-medium transition-colors',
                  pathname === item.href
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {item.name}
              </Link>
            ))}
            <Button asChild className="w-full mt-4">
              <Link href={`/${locale}/submit`}>
                {dictionary.submit}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
