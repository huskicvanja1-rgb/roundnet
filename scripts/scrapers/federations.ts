/**
 * IRF Federation Scraper
 * Scrapes the International Roundnet Federation members page
 * Source: https://www.roundnetfederation.org/members
 */

import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import {
  rateLimitedFetch,
  cleanText,
  extractEmail,
  logScrapingActivity,
  defaultConfig,
} from './config';

const prisma = new PrismaClient();

interface FederationData {
  country: string;
  countryCode: string;
  name: string;
  website: string | null;
  email: string | null;
}

// Country name to ISO code mapping
const countryCodeMap: Record<string, string> = {
  'austria': 'AT',
  'belgium': 'BE',
  'croatia': 'HR',
  'czech republic': 'CZ',
  'czechia': 'CZ',
  'denmark': 'DK',
  'finland': 'FI',
  'france': 'FR',
  'germany': 'DE',
  'greece': 'GR',
  'hungary': 'HU',
  'ireland': 'IE',
  'italy': 'IT',
  'netherlands': 'NL',
  'norway': 'NO',
  'poland': 'PL',
  'portugal': 'PT',
  'romania': 'RO',
  'slovakia': 'SK',
  'slovenia': 'SI',
  'spain': 'ES',
  'sweden': 'SE',
  'switzerland': 'CH',
  'united kingdom': 'GB',
  'uk': 'GB',
};

/**
 * Scrape the IRF members page for federation data
 */
export async function scrapeIRFFederations(): Promise<FederationData[]> {
  const url = 'https://www.roundnetfederation.org/members';
  logScrapingActivity('IRF', 'start', { url });

  const html = await rateLimitedFetch(url, defaultConfig);
  if (!html) {
    logScrapingActivity('IRF', 'error', { message: 'Failed to fetch page' });
    return [];
  }

  const $ = cheerio.load(html);
  const federations: FederationData[] = [];

  // Parse the members table/list
  // Note: The actual HTML structure will need to be adjusted based on the live page
  $('table tr, .member-row, .federation-item').each((_, element) => {
    try {
      const $el = $(element);
      
      // Try to extract country name
      const countryText = cleanText(
        $el.find('td:first-child, .country, .federation-country').text() ||
        $el.find('h3, h4, .name').first().text()
      );

      if (!countryText) return;

      // Get country code
      const countryKey = countryText.toLowerCase();
      const countryCode = countryCodeMap[countryKey];
      
      if (!countryCode) {
        console.log(`Unknown country: ${countryText}`);
        return;
      }

      // Extract federation name
      const name = cleanText(
        $el.find('.federation-name, .org-name, td:nth-child(2)').text()
      ) || `Roundnet ${countryText}`;

      // Extract website
      const websiteLink = $el.find('a[href*="http"]').first();
      const website = websiteLink.attr('href') || null;

      // Extract email
      const emailLink = $el.find('a[href^="mailto:"]').first();
      let email = emailLink.attr('href')?.replace('mailto:', '') || null;
      
      // Try to find email in text if not in link
      if (!email) {
        email = extractEmail($el.text());
      }

      federations.push({
        country: countryText,
        countryCode,
        name,
        website,
        email,
      });
    } catch (error) {
      console.error('Error parsing federation row:', error);
    }
  });

  // Alternative parsing for different page structures
  if (federations.length === 0) {
    // Try parsing from a list structure
    $('.member, .federation, [data-country]').each((_, element) => {
      const $el = $(element);
      const countryAttr = $el.attr('data-country') || '';
      const countryCode = countryCodeMap[countryAttr.toLowerCase()];
      
      if (countryCode) {
        federations.push({
          country: countryAttr,
          countryCode,
          name: cleanText($el.find('.name, h3, h4').text()) || `Roundnet ${countryAttr}`,
          website: $el.find('a[href*="http"]').attr('href') || null,
          email: extractEmail($el.text()),
        });
      }
    });
  }

  logScrapingActivity('IRF', 'complete', { 
    federationsFound: federations.length,
    countries: federations.map(f => f.countryCode),
  });

  return federations;
}

/**
 * Import scraped federations into the database
 */
export async function importFederations(federations: FederationData[]): Promise<void> {
  logScrapingActivity('IRF', 'import_start', { count: federations.length });

  for (const fed of federations) {
    try {
      // Find the country
      const country = await prisma.country.findUnique({
        where: { code: fed.countryCode },
      });

      if (!country) {
        console.log(`Country not found for code: ${fed.countryCode}`);
        continue;
      }

      // Upsert the federation
      await prisma.federation.upsert({
        where: { countryId: country.id },
        update: {
          name: { en: fed.name },
          website: fed.website,
          email: fed.email,
          irfMember: true,
          lastScrapedAt: new Date(),
        },
        create: {
          name: { en: fed.name },
          countryId: country.id,
          website: fed.website,
          email: fed.email,
          irfMember: true,
          lastScrapedAt: new Date(),
        },
      });

      console.log(`✓ Imported federation: ${fed.name} (${fed.countryCode})`);
    } catch (error) {
      console.error(`Error importing federation ${fed.name}:`, error);
    }
  }

  logScrapingActivity('IRF', 'import_complete', { count: federations.length });
}

/**
 * Main function to run the federation scraper
 */
export async function runFederationScraper(): Promise<void> {
  console.log('🏛️  Starting IRF Federation Scraper...\n');

  try {
    const federations = await scrapeIRFFederations();
    
    if (federations.length > 0) {
      await importFederations(federations);
      console.log(`\n✅ Successfully processed ${federations.length} federations`);
    } else {
      console.log('\n⚠️  No federations found. The page structure may have changed.');
    }
  } catch (error) {
    console.error('Federation scraper failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  runFederationScraper().catch(console.error);
}
