import type { Country, City, Club, DirectoryDataProvider } from './schemas';

// =============================================================================
// MOCK DATA - Replace with Prisma queries when connecting to Neon
// =============================================================================

const mockCountries: Country[] = [
  {
    slug: 'france',
    name: 'France',
    code: 'FR',
    flag: '🇫🇷',
    clubCount: 2,
    cityCount: 1,
  },
  {
    slug: 'germany',
    name: 'Germany',
    code: 'DE',
    flag: '🇩🇪',
    clubCount: 2,
    cityCount: 1,
  },
  {
    slug: 'italy',
    name: 'Italy',
    code: 'IT',
    flag: '🇮🇹',
    clubCount: 2,
    cityCount: 1,
  },
  {
    slug: 'spain',
    name: 'Spain',
    code: 'ES',
    flag: '🇪🇸',
    clubCount: 2,
    cityCount: 1,
  },
  {
    slug: 'switzerland',
    name: 'Switzerland',
    code: 'CH',
    flag: '🇨🇭',
    clubCount: 1,
    cityCount: 1,
  },
];

const mockCities: City[] = [
  {
    slug: 'lyon',
    name: 'Lyon',
    countrySlug: 'france',
    clubCount: 2,
    latitude: 45.764,
    longitude: 4.8357,
  },
  {
    slug: 'berlin',
    name: 'Berlin',
    countrySlug: 'germany',
    clubCount: 2,
    latitude: 52.52,
    longitude: 13.405,
  },
  {
    slug: 'bologna',
    name: 'Bologna',
    countrySlug: 'italy',
    clubCount: 2,
    latitude: 44.4949,
    longitude: 11.3426,
  },
  {
    slug: 'madrid',
    name: 'Madrid',
    countrySlug: 'spain',
    clubCount: 2,
    latitude: 40.4168,
    longitude: -3.7038,
  },
  {
    slug: 'basel',
    name: 'Basel',
    countrySlug: 'switzerland',
    clubCount: 1,
    latitude: 47.5596,
    longitude: 7.5886,
  },
];

const mockClubs: Club[] = [
  // Lyon clubs
  {
    slug: 'lyon-roundnet-club',
    name: 'Lyon Roundnet Club',
    description: 'The official Roundnet club of Lyon, offering weekly training sessions and tournaments for all skill levels.',
    type: 'official',
    citySlug: 'lyon',
    countrySlug: 'france',
    address: "Parc de la Tête d'Or, 69006 Lyon",
    latitude: 45.7772,
    longitude: 4.8531,
    website: 'https://lyonroundnet.fr',
    email: 'contact@lyonroundnet.fr',
    instagram: 'https://instagram.com/lyonroundnet',
    features: ['beginner_friendly', 'equipment_provided', 'outdoor', 'tournaments', 'weekly_meetups'],
    trainingSchedule: 'Wednesdays 18:00-20:00, Saturdays 10:00-12:00',
    isVerified: true,
    memberCount: 45,
    foundedYear: 2018,
  },
  {
    slug: 'lyon-university-spikeball',
    name: 'Lyon University Spikeball',
    description: 'University club for students passionate about Spikeball. Open to all university students.',
    type: 'university',
    citySlug: 'lyon',
    countrySlug: 'france',
    address: 'Campus de la Doua, Villeurbanne',
    features: ['beginner_friendly', 'equipment_provided', 'outdoor', 'indoor'],
    trainingSchedule: 'Tuesdays 17:00-19:00',
    isVerified: false,
    memberCount: 20,
    foundedYear: 2021,
  },
  // Berlin clubs
  {
    slug: 'berlin-roundnet-verein',
    name: 'Berlin Roundnet e.V.',
    description: "Berlin's largest Roundnet community with regular training, competitive teams, and coaching for all levels.",
    type: 'official',
    citySlug: 'berlin',
    countrySlug: 'germany',
    address: 'Tempelhofer Feld, Berlin',
    latitude: 52.4731,
    longitude: 13.4018,
    website: 'https://berlin-roundnet.de',
    email: 'info@berlin-roundnet.de',
    instagram: 'https://instagram.com/berlinroundnet',
    facebook: 'https://facebook.com/berlinroundnet',
    features: ['beginner_friendly', 'equipment_provided', 'outdoor', 'tournaments', 'coaching', 'weekly_meetups'],
    trainingSchedule: 'Tuesdays & Thursdays 18:00-20:00, Sundays 11:00-14:00',
    isVerified: true,
    memberCount: 120,
    foundedYear: 2016,
  },
  {
    slug: 'spikeball-kreuzberg',
    name: 'Spikeball Kreuzberg',
    description: 'Casual Spikeball group meeting regularly in Görlitzer Park. All skill levels welcome!',
    type: 'community',
    citySlug: 'berlin',
    countrySlug: 'germany',
    address: 'Görlitzer Park, Berlin-Kreuzberg',
    features: ['beginner_friendly', 'outdoor', 'weekly_meetups'],
    trainingSchedule: 'Saturdays 14:00-17:00',
    isVerified: false,
    memberCount: 25,
  },
  // Bologna clubs
  {
    slug: 'roundnet-bologna',
    name: 'Roundnet Bologna ASD',
    description: 'The official Roundnet association in Bologna, organizing training, tournaments, and community events.',
    type: 'official',
    citySlug: 'bologna',
    countrySlug: 'italy',
    address: 'Parco della Montagnola, Bologna',
    latitude: 44.5014,
    longitude: 11.3443,
    website: 'https://roundnetbologna.it',
    email: 'info@roundnetbologna.it',
    instagram: 'https://instagram.com/roundnetbologna',
    features: ['beginner_friendly', 'equipment_provided', 'outdoor', 'tournaments'],
    trainingSchedule: 'Tuesdays & Fridays 18:30-20:30',
    isVerified: true,
    memberCount: 35,
    foundedYear: 2019,
  },
  {
    slug: 'unibo-spikeball',
    name: 'UniBO Spikeball',
    description: 'Student-run Spikeball club at University of Bologna. Weekly sessions and university tournaments.',
    type: 'university',
    citySlug: 'bologna',
    countrySlug: 'italy',
    features: ['beginner_friendly', 'equipment_provided', 'outdoor'],
    trainingSchedule: 'Thursdays 17:00-19:00',
    isVerified: false,
    memberCount: 15,
    foundedYear: 2022,
  },
  // Madrid clubs
  {
    slug: 'madrid-roundnet',
    name: 'Madrid Roundnet',
    description: "Spain's most active Roundnet community, hosting training sessions, leagues, and national tournaments.",
    type: 'official',
    citySlug: 'madrid',
    countrySlug: 'spain',
    address: 'Parque de El Retiro, Madrid',
    latitude: 40.4153,
    longitude: -3.6845,
    website: 'https://madridroundnet.es',
    email: 'hola@madridroundnet.es',
    instagram: 'https://instagram.com/madridroundnet',
    features: ['beginner_friendly', 'equipment_provided', 'outdoor', 'tournaments', 'coaching', 'weekly_meetups'],
    trainingSchedule: 'Saturdays 10:00-13:00, Sundays 10:00-13:00',
    isVerified: true,
    memberCount: 80,
    foundedYear: 2017,
  },
  {
    slug: 'spikeball-complutense',
    name: 'Spikeball Complutense',
    description: 'Universidad Complutense de Madrid Spikeball club. Fun and competitive play for students.',
    type: 'university',
    citySlug: 'madrid',
    countrySlug: 'spain',
    features: ['beginner_friendly', 'outdoor'],
    trainingSchedule: 'Wednesdays 16:00-18:00',
    isVerified: false,
    memberCount: 25,
    foundedYear: 2020,
  },
  // Basel club
  {
    slug: 'roundnet-basel',
    name: 'Roundnet Basel',
    description: 'Active Roundnet community in Basel with regular training and tournaments. Trilingual (DE/FR/EN).',
    type: 'official',
    citySlug: 'basel',
    countrySlug: 'switzerland',
    address: 'Schützenmattpark, Basel',
    latitude: 47.5566,
    longitude: 7.5808,
    website: 'https://roundnetbasel.ch',
    email: 'info@roundnetbasel.ch',
    instagram: 'https://instagram.com/roundnetbasel',
    features: ['beginner_friendly', 'equipment_provided', 'outdoor', 'indoor', 'tournaments'],
    trainingSchedule: 'Thursdays 18:30-20:30',
    isVerified: true,
    memberCount: 30,
    foundedYear: 2018,
  },
];

// =============================================================================
// MOCK DATA PROVIDER
// =============================================================================

class MockDataProvider implements DirectoryDataProvider {
  private enrichClubWithRelations(club: Club): Club {
    const city = mockCities.find((c) => c.slug === club.citySlug);
    const country = mockCountries.find((c) => c.slug === club.countrySlug);

    return {
      ...club,
      city: city ? { slug: city.slug, name: city.name } : undefined,
      country: country
        ? { slug: country.slug, name: country.name, flag: country.flag }
        : undefined,
    };
  }

  async getCountries(): Promise<Country[]> {
    return mockCountries;
  }

  async getCountryBySlug(slug: string): Promise<Country | null> {
    return mockCountries.find((c) => c.slug === slug) || null;
  }

  async getCitiesByCountry(countrySlug: string): Promise<City[]> {
    return mockCities.filter((c) => c.countrySlug === countrySlug);
  }

  async getAllCities(): Promise<City[]> {
    return mockCities;
  }

  async getCityBySlug(slug: string): Promise<City | null> {
    return mockCities.find((c) => c.slug === slug) || null;
  }

  async getClubsByCountry(countrySlug: string): Promise<Club[]> {
    return mockClubs
      .filter((c) => c.countrySlug === countrySlug)
      .map((c) => this.enrichClubWithRelations(c));
  }

  async getClubsByCity(citySlug: string): Promise<Club[]> {
    return mockClubs
      .filter((c) => c.citySlug === citySlug)
      .map((c) => this.enrichClubWithRelations(c));
  }

  async getClubBySlug(slug: string): Promise<Club | null> {
    const club = mockClubs.find((c) => c.slug === slug);
    return club ? this.enrichClubWithRelations(club) : null;
  }

  async getAllClubs(): Promise<Club[]> {
    return mockClubs.map((c) => this.enrichClubWithRelations(c));
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

// Use mock provider for now, switch to PrismaDataProvider when connected to Neon
export const dataProvider: DirectoryDataProvider = new MockDataProvider();
