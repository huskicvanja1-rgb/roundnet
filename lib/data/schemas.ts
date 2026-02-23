import { z } from 'zod';

// Country schema (plain strings for display)
export const CountrySchema = z.object({
  slug: z.string(),
  name: z.string(), // Display name
  code: z.string().length(2),
  flag: z.string(),
  clubCount: z.number().int().min(0),
  cityCount: z.number().int().min(0),
});

export type Country = z.infer<typeof CountrySchema>;

// City schema
export const CitySchema = z.object({
  slug: z.string(),
  name: z.string(), // Display name
  countrySlug: z.string(),
  clubCount: z.number().int().min(0),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type City = z.infer<typeof CitySchema>;

// Club features
export const ClubFeatureSchema = z.enum([
  'beginner_friendly',
  'equipment_provided',
  'indoor',
  'outdoor',
  'coaching',
  'tournaments',
  'weekly_meetups',
  'youth_program',
  'wheelchair_accessible',
]);

export type ClubFeature = z.infer<typeof ClubFeatureSchema>;

// Club type
export const ClubTypeSchema = z.enum([
  'official',
  'community',
  'university',
  'recreational',
]);

export type ClubType = z.infer<typeof ClubTypeSchema>;

// Club schema
export const ClubSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: ClubTypeSchema,
  citySlug: z.string(),
  countrySlug: z.string(),
  
  // Location
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  
  // Contact
  website: z.string().url().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  
  // Details
  features: z.array(ClubFeatureSchema).optional(),
  trainingSchedule: z.string().optional(),
  memberCount: z.number().int().optional(),
  foundedYear: z.number().int().optional(),
  isVerified: z.boolean().default(false),
  
  // Relations (populated when returned)
  city: z.object({
    slug: z.string(),
    name: z.string(),
  }).optional(),
  country: z.object({
    slug: z.string(),
    name: z.string(),
    flag: z.string(),
  }).optional(),
});

export type Club = z.infer<typeof ClubSchema>;

// Data provider interface (for swapping mock/Prisma)
export interface DirectoryDataProvider {
  getCountries(): Promise<Country[]>;
  getCountryBySlug(slug: string): Promise<Country | null>;
  getAllCities(): Promise<City[]>;
  getCitiesByCountry(countrySlug: string): Promise<City[]>;
  getCityBySlug(slug: string): Promise<City | null>;
  getClubsByCountry(countrySlug: string): Promise<Club[]>;
  getClubsByCity(citySlug: string): Promise<Club[]>;
  getClubBySlug(slug: string): Promise<Club | null>;
  getAllClubs(): Promise<Club[]>;
}
