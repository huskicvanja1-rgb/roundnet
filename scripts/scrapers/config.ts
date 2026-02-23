/**
 * Scraping Configuration and Utilities
 * Respects robots.txt and implements rate limiting
 */

import robotsParser from 'robots-parser';
import axios from 'axios';

export interface ScraperConfig {
  userAgent: string;
  delayMs: number;
  respectRobots: boolean;
  maxRetries: number;
  timeout: number;
}

export const defaultConfig: ScraperConfig = {
  userAgent: process.env.SCRAPE_USER_AGENT || 'RoundnetDirectoryBot/1.0 (+https://roundnet-directory.eu/bot)',
  delayMs: parseInt(process.env.SCRAPE_DELAY_MS || '2000'),
  respectRobots: process.env.SCRAPE_RESPECT_ROBOTS !== 'false',
  maxRetries: 3,
  timeout: 30000,
};

// Cache for robots.txt parsers
const robotsCache: Map<string, ReturnType<typeof robotsParser>> = new Map();

/**
 * Check if scraping is allowed for a URL based on robots.txt
 */
export async function isScrapingAllowed(url: string, config: ScraperConfig = defaultConfig): Promise<boolean> {
  if (!config.respectRobots) return true;

  try {
    const urlObj = new URL(url);
    const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;

    if (!robotsCache.has(robotsUrl)) {
      const response = await axios.get(robotsUrl, {
        timeout: 5000,
        headers: { 'User-Agent': config.userAgent },
      });
      const robots = robotsParser(robotsUrl, response.data);
      robotsCache.set(robotsUrl, robots);
    }

    const robots = robotsCache.get(robotsUrl);
    return robots?.isAllowed(url, config.userAgent) ?? true;
  } catch (error) {
    // If we can't fetch robots.txt, assume scraping is allowed
    console.warn(`Could not fetch robots.txt for ${url}, proceeding with caution`);
    return true;
  }
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Rate-limited fetch with retry logic
 */
export async function rateLimitedFetch(
  url: string,
  config: ScraperConfig = defaultConfig
): Promise<string | null> {
  // Check robots.txt
  const allowed = await isScrapingAllowed(url, config);
  if (!allowed) {
    console.warn(`Scraping not allowed by robots.txt: ${url}`);
    return null;
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      // Rate limiting
      await sleep(config.delayMs);

      const response = await axios.get(url, {
        timeout: config.timeout,
        headers: {
          'User-Agent': config.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });

      return response.data;
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt} failed for ${url}: ${lastError.message}`);
      
      // Exponential backoff
      await sleep(config.delayMs * Math.pow(2, attempt));
    }
  }

  console.error(`All attempts failed for ${url}: ${lastError?.message}`);
  return null;
}

/**
 * Normalize and clean text
 */
export function cleanText(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\n\r\t]/g, ' ')
    .trim();
}

/**
 * Extract email from text
 */
export function extractEmail(text: string): string | null {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w{2,}/gi;
  const match = text.match(emailRegex);
  return match ? match[0].toLowerCase() : null;
}

/**
 * Extract phone number from text
 */
export function extractPhone(text: string): string | null {
  const phoneRegex = /(?:\+|00)?\d{1,3}[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}/g;
  const match = text.match(phoneRegex);
  return match ? match[0].replace(/[^\d+]/g, '') : null;
}

/**
 * Generate slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Geocode an address using Nominatim (OpenStreetMap)
 */
export async function geocodeAddress(
  address: string,
  country?: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    await sleep(1100); // Nominatim requires 1 second between requests

    const query = country ? `${address}, ${country}` : address;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;

    const response = await axios.get(url, {
      headers: { 'User-Agent': defaultConfig.userAgent },
      timeout: 10000,
    });

    if (response.data && response.data.length > 0) {
      return {
        latitude: parseFloat(response.data[0].lat),
        longitude: parseFloat(response.data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error(`Geocoding failed for "${address}":`, error);
    return null;
  }
}

/**
 * Log scraping activity for audit purposes
 */
export function logScrapingActivity(
  source: string,
  action: string,
  details?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({
    timestamp,
    source,
    action,
    ...details,
  }));
}
