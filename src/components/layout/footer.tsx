import Link from 'next/link';
import { MapPin, Mail, Heart } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

interface FooterProps {
  locale: Locale;
  dictionary: Dictionary['footer'];
}

export function Footer({ locale, dictionary }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const links = {
    directory: [
      { name: dictionary.clubs, href: `/${locale}/clubs` },
      { name: dictionary.events, href: `/${locale}/events` },
      { name: dictionary.submit, href: `/${locale}/submit` },
    ],
    content: [
      { name: dictionary.blog, href: `/${locale}/blog` },
      { name: dictionary.about, href: `/${locale}/about` },
      { name: dictionary.contact, href: `/${locale}/contact` },
    ],
    legal: [
      { name: dictionary.privacy, href: `/${locale}/privacy` },
      { name: dictionary.terms, href: `/${locale}/terms` },
    ],
  };

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href={`/${locale}`} className="flex items-center space-x-2">
              <MapPin className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">
                <span className="gradient-text">Roundnet</span>
                <span className="text-muted-foreground">.eu</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {dictionary.tagline}
            </p>
          </div>

          {/* Directory Links */}
          <div>
            <h4 className="font-semibold mb-4">Directory</h4>
            <ul className="space-y-2">
              {links.directory.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Content Links */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {links.content.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {links.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            {dictionary.copyright.replace('{year}', currentYear.toString())}
          </p>
          <p className="text-sm text-muted-foreground flex items-center">
            Made with <Heart className="h-4 w-4 mx-1 text-red-500" /> for the Roundnet community
          </p>
        </div>
      </div>
    </footer>
  );
}
