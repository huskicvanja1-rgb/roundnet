/**
 * Club Scrapers for National Federations
 * Scrapes club data from various national Roundnet federation websites
 */

import * as cheerio from 'cheerio';
import { PrismaClient, ClubType, ClubStatus, ClubFeature } from '@prisma/client';
import {
  rateLimitedFetch,
  cleanText,
  extractEmail,
  extractPhone,
  generateSlug,
  geocodeAddress,
  logScrapingActivity,
  defaultConfig,
} from './config';

const prisma = new PrismaClient();

interface ClubData {
  name: string;
  city: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  contactPerson?: string;
  type: ClubType;
  features?: ClubFeature[];
  sourceUrl: string;
  sourceId?: string;
}

interface ScraperResult {
  source: string;
  countryCode: string;
  clubs: ClubData[];
  errors: string[];
}

// ============================================
// ROUNDNET FRANCE SCRAPER
// Source: https://www.roundnetfrance.fr/clubs-et-communautes/liste-des-clubs
// ============================================

export async function scrapeRoundnetFrance(): Promise<ScraperResult> {
  const source = 'Roundnet France';
  const countryCode = 'FR';
  const url = 'https://www.roundnetfrance.fr/clubs-et-communautes/liste-des-clubs';
  
  logScrapingActivity(source, 'start', { url });
  
  const result: ScraperResult = {
    source,
    countryCode,
    clubs: [],
    errors: [],
  };

  try {
    const html = await rateLimitedFetch(url);
    if (!html) {
      result.errors.push('Failed to fetch page');
      return result;
    }

    const $ = cheerio.load(html);

    // Parse club cards/list items
    // Note: Actual selectors need to be adjusted based on live page structure
    $('.club-card, .club-item, article.club, .elementor-post').each((_, element) => {
      try {
        const $club = $(element);

        // Extract club name
        const name = cleanText(
          $club.find('h2, h3, .club-name, .entry-title').first().text()
        );
        if (!name) return;

        // Extract city
        const city = cleanText(
          $club.find('.city, .location, .club-city, [data-city]').text() ||
          $club.find('p').filter((_, el) => {
            const text = $(el).text().toLowerCase();
            return text.includes('ville') || text.includes('city');
          }).text().replace(/ville\s*:/i, '').trim()
        );

        // Extract description
        const description = cleanText(
          $club.find('.description, .club-description, .excerpt, p').first().text()
        );

        // Extract website
        const website = $club.find('a[href*="http"]:not([href*="facebook"]):not([href*="instagram"])').attr('href');

        // Extract email
        const emailLink = $club.find('a[href^="mailto:"]').attr('href');
        const email = emailLink?.replace('mailto:', '') || extractEmail($club.text());

        // Determine club type
        const fullText = $club.text().toLowerCase();
        let type = ClubType.COMMUNITY;
        if (fullText.includes('association') || fullText.includes('club officiel') || fullText.includes('affilié')) {
          type = ClubType.OFFICIAL_CLUB;
        } else if (fullText.includes('université') || fullText.includes('university')) {
          type = ClubType.UNIVERSITY;
        }

        // Extract features
        const features: ClubFeature[] = [];
        if (fullText.includes('indoor') || fullText.includes('intérieur')) {
          features.push(ClubFeature.INDOOR);
        }
        if (fullText.includes('outdoor') || fullText.includes('extérieur')) {
          features.push(ClubFeature.OUTDOOR);
        }
        if (fullText.includes('débutant') || fullText.includes('beginner')) {
          features.push(ClubFeature.BEGINNERS_WELCOME);
        }
        if (fullText.includes('tournoi') || fullText.includes('tournament')) {
          features.push(ClubFeature.TOURNAMENTS);
        }

        result.clubs.push({
          name,
          city: city || 'Unknown',
          description,
          website,
          email,
          type,
          features,
          sourceUrl: url,
        });
      } catch (error) {
        result.errors.push(`Error parsing club: ${error}`);
      }
    });

    logScrapingActivity(source, 'complete', { clubsFound: result.clubs.length });
  } catch (error) {
    result.errors.push(`Scraper error: ${error}`);
    logScrapingActivity(source, 'error', { error: String(error) });
  }

  return result;
}

// ============================================
// ITALIAN ROUNDNET FEDERATION SCRAPER
// Source: https://federazioneitalianaroundnet.com/en/clubs/
// ============================================

export async function scrapeItalianFederation(): Promise<ScraperResult> {
  const source = 'Italian Roundnet Federation';
  const countryCode = 'IT';
  const url = 'https://federazioneitalianaroundnet.com/en/clubs/';
  
  logScrapingActivity(source, 'start', { url });
  
  const result: ScraperResult = {
    source,
    countryCode,
    clubs: [],
    errors: [],
  };

  try {
    const html = await rateLimitedFetch(url);
    if (!html) {
      result.errors.push('Failed to fetch page');
      return result;
    }

    const $ = cheerio.load(html);

    // Parse club entries
    // The Italian federation shows clubs with contact info
    $('.club, .team-member, article, .wp-block-group').each((_, element) => {
      try {
        const $club = $(element);
        
        // Look for club name patterns like "ASD MILANO ROUNDNET"
        const name = cleanText(
          $club.find('h2, h3, h4, .club-name, strong').first().text()
        );
        if (!name || name.length < 3) return;

        // Skip if it's just a heading
        if (name.toLowerCase().includes('club') && name.split(' ').length <= 2) return;

        // Extract city from name or content
        const cityMatch = name.match(/(?:ASD\s+)?(\w+)\s+ROUNDNET/i);
        const city = cityMatch ? cityMatch[1] : cleanText(
          $club.find('.city, .location').text()
        ) || 'Unknown';

        // Extract contact person
        const contactPerson = cleanText(
          $club.find('.contact-name, .referente, [data-contact]').text()
        );

        // Extract email
        const email = extractEmail($club.text());

        // Extract phone
        const phone = extractPhone($club.text());

        // Description
        const description = cleanText(
          $club.find('p, .description').not('.contact-info').first().text()
        );

        result.clubs.push({
          name,
          city,
          description,
          email,
          phone,
          contactPerson,
          type: ClubType.OFFICIAL_CLUB, // Italian federation lists affiliated clubs
          features: [ClubFeature.TOURNAMENTS],
          sourceUrl: url,
        });
      } catch (error) {
        result.errors.push(`Error parsing club: ${error}`);
      }
    });

    logScrapingActivity(source, 'complete', { clubsFound: result.clubs.length });
  } catch (error) {
    result.errors.push(`Scraper error: ${error}`);
    logScrapingActivity(source, 'error', { error: String(error) });
  }

  return result;
}

// ============================================
// ROUNDNET GERMANY / PLAYERZONE SCRAPER
// Source: https://playerzone.roundnetgermany.de/clubs
// ============================================

export async function scrapeGermanyPlayerzone(): Promise<ScraperResult> {
  const source = 'Roundnet Germany Playerzone';
  const countryCode = 'DE';
  const url = 'https://playerzone.roundnetgermany.de/clubs';
  
  logScrapingActivity(source, 'start', { url });
  
  const result: ScraperResult = {
    source,
    countryCode,
    clubs: [],
    errors: [],
  };

  try {
    const html = await rateLimitedFetch(url);
    if (!html) {
      result.errors.push('Failed to fetch page');
      return result;
    }

    const $ = cheerio.load(html);

    // Parse club cards from Playerzone
    $('.club-card, .community-card, [data-club], .card').each((_, element) => {
      try {
        const $club = $(element);

        const name = cleanText(
          $club.find('.club-name, h3, h4, .card-title').first().text()
        );
        if (!name) return;

        const city = cleanText(
          $club.find('.city, .location, .club-location, .card-subtitle').text()
        );

        const description = cleanText(
          $club.find('.description, .club-description, .card-text').text()
        );

        const website = $club.find('a[href*="http"]').attr('href');

        // Check if it's official or community
        const isOfficial = $club.hasClass('official') || 
          $club.find('.badge-official, .verified').length > 0;

        result.clubs.push({
          name,
          city: city || 'Unknown',
          description,
          website,
          type: isOfficial ? ClubType.OFFICIAL_CLUB : ClubType.COMMUNITY,
          sourceUrl: url,
        });
      } catch (error) {
        result.errors.push(`Error parsing club: ${error}`);
      }
    });

    logScrapingActivity(source, 'complete', { clubsFound: result.clubs.length });
  } catch (error) {
    result.errors.push(`Scraper error: ${error}`);
    logScrapingActivity(source, 'error', { error: String(error) });
  }

  return result;
}

// ============================================
// GENERIC SCRAPER FOR OTHER FEDERATIONS
// ============================================

export async function scrapeGenericFederation(
  url: string,
  countryCode: string,
  source: string
): Promise<ScraperResult> {
  logScrapingActivity(source, 'start', { url });
  
  const result: ScraperResult = {
    source,
    countryCode,
    clubs: [],
    errors: [],
  };

  try {
    const html = await rateLimitedFetch(url);
    if (!html) {
      result.errors.push('Failed to fetch page');
      return result;
    }

    const $ = cheerio.load(html);

    // Generic selectors for common patterns
    const selectors = [
      '.club', '.team', '.community', '.group',
      'article', '.card', '.item', '.member',
      '[data-club]', '[data-team]',
    ];

    $(selectors.join(', ')).each((_, element) => {
      try {
        const $el = $(element);

        const name = cleanText($el.find('h2, h3, h4, .name, .title').first().text());
        if (!name || name.length < 3) return;

        const city = cleanText($el.find('.city, .location, .address').text());
        const description = cleanText($el.find('p, .description, .content').first().text());
        const email = extractEmail($el.text());
        const website = $el.find('a[href*="http"]:not([href*="facebook"])').attr('href');

        result.clubs.push({
          name,
          city: city || 'Unknown',
          description,
          email,
          website,
          type: ClubType.COMMUNITY,
          sourceUrl: url,
        });
      } catch (error) {
        result.errors.push(`Error parsing element: ${error}`);
      }
    });

    logScrapingActivity(source, 'complete', { clubsFound: result.clubs.length });
  } catch (error) {
    result.errors.push(`Scraper error: ${error}`);
  }

  return result;
}

// ============================================
// DATABASE IMPORT FUNCTIONS
// ============================================

export async function importClubs(result: ScraperResult): Promise<void> {
  logScrapingActivity(result.source, 'import_start', { count: result.clubs.length });

  // Find country
  const country = await prisma.country.findUnique({
    where: { code: result.countryCode },
    include: { federation: true },
  });

  if (!country) {
    console.error(`Country not found: ${result.countryCode}`);
    return;
  }

  for (const clubData of result.clubs) {
    try {
      const slug = generateSlug(clubData.name);

      // Find or create city
      let city = await prisma.city.findFirst({
        where: {
          slug: generateSlug(clubData.city),
        },
      });

      if (!city && clubData.city && clubData.city !== 'Unknown') {
        // Geocode the city
        const coords = await geocodeAddress(clubData.city, country.code);
        
        city = await prisma.city.create({
          data: {
            name: { en: clubData.city },
            slug: generateSlug(clubData.city),
            latitude: coords?.latitude,
            longitude: coords?.longitude,
          },
        });
      }

      // Check for existing club
      const existingClub = await prisma.club.findFirst({
        where: {
          OR: [
            { slug, countryId: country.id },
            { sourceUrl: clubData.sourceUrl, name: clubData.name },
          ],
        },
      });

      if (existingClub) {
        // Update existing club
        await prisma.club.update({
          where: { id: existingClub.id },
          data: {
            description: clubData.description ? { en: clubData.description } : undefined,
            website: clubData.website,
            email: clubData.email,
            phone: clubData.phone,
            features: clubData.features,
            lastScrapedAt: new Date(),
          },
        });
        console.log(`↻ Updated club: ${clubData.name}`);
      } else {
        // Geocode if we have city coordinates
        let latitude = city?.latitude;
        let longitude = city?.longitude;

        if (!latitude && clubData.city) {
          const coords = await geocodeAddress(`${clubData.city}, ${country.code}`);
          latitude = coords?.latitude;
          longitude = coords?.longitude;
        }

        // Create new club
        await prisma.club.create({
          data: {
            name: clubData.name,
            slug,
            description: clubData.description ? { en: clubData.description } : null,
            countryId: country.id,
            cityId: city?.id,
            latitude,
            longitude,
            website: clubData.website,
            email: clubData.email,
            phone: clubData.phone,
            type: clubData.type,
            features: clubData.features,
            status: ClubStatus.PENDING, // Requires moderation
            federationId: country.federation?.id,
            sourceUrl: clubData.sourceUrl,
            sourceId: clubData.sourceId,
            lastScrapedAt: new Date(),
          },
        });
        console.log(`✓ Created club: ${clubData.name}`);
      }
    } catch (error) {
      console.error(`Error importing club ${clubData.name}:`, error);
    }
  }

  logScrapingActivity(result.source, 'import_complete', { count: result.clubs.length });
}

// ============================================
// MAIN SCRAPER RUNNER
// ============================================

export async function runAllClubScrapers(): Promise<void> {
  console.log('🏃 Starting Club Scrapers...\n');

  const scrapers = [
    scrapeRoundnetFrance,
    scrapeItalianFederation,
    scrapeGermanyPlayerzone,
  ];

  let totalClubs = 0;
  const errors: string[] = [];

  for (const scraper of scrapers) {
    try {
      const result = await scraper();
      console.log(`\n📍 ${result.source}: Found ${result.clubs.length} clubs`);
      
      if (result.clubs.length > 0) {
        await importClubs(result);
        totalClubs += result.clubs.length;
      }

      if (result.errors.length > 0) {
        errors.push(...result.errors.map(e => `${result.source}: ${e}`));
      }
    } catch (error) {
      errors.push(`Scraper failed: ${error}`);
      console.error(`Scraper error:`, error);
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Scraping complete: ${totalClubs} clubs processed`);
  
  if (errors.length > 0) {
    console.log(`\n⚠️  ${errors.length} errors occurred:`);
    errors.forEach(e => console.log(`   - ${e}`));
  }

  await prisma.$disconnect();
}

// Run if executed directly
if (require.main === module) {
  runAllClubScrapers().catch(console.error);
}
