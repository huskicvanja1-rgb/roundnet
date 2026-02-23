import { MetadataRoute } from 'next';
import { locales } from '@/lib/i18n/locales';
import { dataProvider } from '@/lib/data/provider';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://roundnet-directory.eu';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages = ['', '/clubs'];

  // Generate static page entries for all locales
  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${page}`,
      lastModified: now,
      changeFrequency: page === '' ? 'weekly' : 'monthly' as const,
      priority: page === '' ? 1.0 : page === '/clubs' ? 0.9 : 0.7,
    }))
  );

  // Get all countries
  const countries = await dataProvider.getCountries();

  // Country pages (exclude countries with 0 clubs — those are noindex)
  const countryEntries: MetadataRoute.Sitemap = countries.filter((c) => c.clubCount > 0).flatMap((country) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/clubs/${country.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }))
  );

  // Get all cities
  const cities = await dataProvider.getAllCities();

  // City pages (exclude cities with 0 clubs — those are noindex)
  const cityEntries: MetadataRoute.Sitemap = cities.filter((city) => city.clubCount > 0).flatMap((city) => {
    const country = countries.find((c) => c.slug === city.countrySlug);
    if (!country) return [];
    
    return locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/clubs/${country.slug}/${city.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  });

  // Get all clubs
  const clubs = await dataProvider.getAllClubs();

  // Club pages
  const clubEntries: MetadataRoute.Sitemap = clubs.flatMap((club) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/club/${club.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }))
  );

  return [
    ...staticEntries,
    ...countryEntries,
    ...cityEntries,
    ...clubEntries,
  ];
}
