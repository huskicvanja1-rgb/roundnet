/**
 * Master Scraper Orchestrator
 * Coordinates all scraping operations with proper scheduling
 */

import { runFederationScraper } from './federations';
import { runAllClubScrapers } from './clubs';
import { logScrapingActivity } from './config';

interface ScrapeResult {
  success: boolean;
  duration: number;
  errors: string[];
}

/**
 * Run all scrapers in sequence
 */
export async function runAllScrapers(): Promise<ScrapeResult> {
  const startTime = Date.now();
  const errors: string[] = [];

  console.log('═'.repeat(60));
  console.log('🌍 ROUNDNET DIRECTORY - DATA SCRAPING');
  console.log(`📅 Started: ${new Date().toISOString()}`);
  console.log('═'.repeat(60));

  logScrapingActivity('orchestrator', 'start_all');

  try {
    // 1. Scrape federations first (they provide context for clubs)
    console.log('\n\n📋 PHASE 1: Federation Data\n' + '─'.repeat(40));
    try {
      await runFederationScraper();
    } catch (error) {
      errors.push(`Federation scraper: ${error}`);
      console.error('Federation scraper failed:', error);
    }

    // 2. Scrape clubs from all sources
    console.log('\n\n🏠 PHASE 2: Club Data\n' + '─'.repeat(40));
    try {
      await runAllClubScrapers();
    } catch (error) {
      errors.push(`Club scrapers: ${error}`);
      console.error('Club scrapers failed:', error);
    }

    // Summary
    const duration = (Date.now() - startTime) / 1000;
    
    console.log('\n\n' + '═'.repeat(60));
    console.log('✅ SCRAPING COMPLETE');
    console.log(`⏱️  Duration: ${duration.toFixed(2)} seconds`);
    console.log(`📅 Finished: ${new Date().toISOString()}`);
    
    if (errors.length > 0) {
      console.log(`\n⚠️  ${errors.length} errors occurred during scraping`);
    }
    
    console.log('═'.repeat(60));

    logScrapingActivity('orchestrator', 'complete', {
      duration,
      errorCount: errors.length,
    });

    return {
      success: errors.length === 0,
      duration,
      errors,
    };
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    
    logScrapingActivity('orchestrator', 'failed', {
      duration,
      error: String(error),
    });

    return {
      success: false,
      duration,
      errors: [...errors, String(error)],
    };
  }
}

// Run if executed directly
if (require.main === module) {
  runAllScrapers()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
