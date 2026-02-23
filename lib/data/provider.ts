import type { Country, City, Club, DirectoryDataProvider } from './schemas';
import { SCRAPED_COUNTRIES, SCRAPED_CITIES, SCRAPED_CLUBS } from './scraped-data';

// =============================================================================
// DATA SOURCES — Real data scraped from Google Maps via Outscraper
// =============================================================================

const allCountries: Country[] = SCRAPED_COUNTRIES;
const allCities: City[] = SCRAPED_CITIES;
const allClubs: Club[] = SCRAPED_CLUBS;

// =============================================================================
// SCRAPED DATA PROVIDER — Uses real Google Maps data
// =============================================================================

class ScrapedDataProvider implements DirectoryDataProvider {
  private enrichClubWithRelations(club: Club): Club {
    const city = allCities.find((c) => c.slug === club.citySlug);
    const country = allCountries.find((c) => c.slug === club.countrySlug);

    return {
      ...club,
      city: city ? { slug: city.slug, name: city.name } : undefined,
      country: country
        ? { slug: country.slug, name: country.name, flag: country.flag }
        : undefined,
    };
  }

  async getCountries(): Promise<Country[]> {
    return allCountries;
  }

  async getCountryBySlug(slug: string): Promise<Country | null> {
    return allCountries.find((c) => c.slug === slug) || null;
  }

  async getCitiesByCountry(countrySlug: string): Promise<City[]> {
    return allCities.filter((c) => c.countrySlug === countrySlug);
  }

  async getAllCities(): Promise<City[]> {
    return allCities;
  }

  async getCityBySlug(slug: string): Promise<City | null> {
    return allCities.find((c) => c.slug === slug) || null;
  }

  async getClubsByCountry(countrySlug: string): Promise<Club[]> {
    return allClubs
      .filter((c) => c.countrySlug === countrySlug)
      .map((c) => this.enrichClubWithRelations(c));
  }

  async getClubsByCity(citySlug: string): Promise<Club[]> {
    return allClubs
      .filter((c) => c.citySlug === citySlug)
      .map((c) => this.enrichClubWithRelations(c));
  }

  async getClubBySlug(slug: string): Promise<Club | null> {
    const club = allClubs.find((c) => c.slug === slug);
    return club ? this.enrichClubWithRelations(club) : null;
  }

  async getAllClubs(): Promise<Club[]> {
    return allClubs.map((c) => this.enrichClubWithRelations(c));
  }
}

// =============================================================================
// PRISMA DATA PROVIDER (Template for Neon connection)
// =============================================================================

// Uncomment and implement when connecting to Neon/Prisma:
/*
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class PrismaDataProvider implements DirectoryDataProvider {
  async getCountries(): Promise<Country[]> {
    return prisma.country.findMany({
      include: {
        _count: {
          select: { clubs: true, cities: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getCountryBySlug(slug: string): Promise<Country | null> {
    return prisma.country.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { clubs: true, cities: true },
        },
      },
    });
  }

  async getCitiesByCountry(countrySlug: string): Promise<City[]> {
    return prisma.city.findMany({
      where: { country: { slug: countrySlug } },
      include: {
        _count: { select: { clubs: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getCityBySlug(slug: string): Promise<City | null> {
    return prisma.city.findUnique({
      where: { slug },
      include: {
        _count: { select: { clubs: true } },
      },
    });
  }

  async getClubsByCountry(countrySlug: string): Promise<Club[]> {
    return prisma.club.findMany({
      where: { country: { slug: countrySlug } },
      include: {
        city: { select: { slug: true, name: true } },
        country: { select: { slug: true, name: true, flag: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getClubsByCity(citySlug: string): Promise<Club[]> {
    return prisma.club.findMany({
      where: { city: { slug: citySlug } },
      include: {
        city: { select: { slug: true, name: true } },
        country: { select: { slug: true, name: true, flag: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getClubBySlug(slug: string): Promise<Club | null> {
    return prisma.club.findUnique({
      where: { slug },
      include: {
        city: { select: { slug: true, name: true } },
        country: { select: { slug: true, name: true, flag: true } },
      },
    });
  }

  async getAllClubs(): Promise<Club[]> {
    return prisma.club.findMany({
      include: {
        city: { select: { slug: true, name: true } },
        country: { select: { slug: true, name: true, flag: true } },
      },
      orderBy: { name: 'asc' },
    });
  }
}
*/

// =============================================================================
// EXPORT PROVIDER
// =============================================================================

// Use scraped data provider with real Google Maps data
// Switch to PrismaDataProvider when connected to Neon
export const dataProvider: DirectoryDataProvider = new ScrapedDataProvider();
