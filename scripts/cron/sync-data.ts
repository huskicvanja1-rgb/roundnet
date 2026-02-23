/**
 * Scheduled Data Synchronization
 * Runs periodic jobs to keep data fresh
 */

import * as cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { runAllScrapers } from '../scrapers/index';

const prisma = new PrismaClient();

interface SyncJob {
  name: string;
  schedule: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  handler: () => Promise<void>;
}

const jobs: SyncJob[] = [
  {
    name: 'Full Data Sync',
    schedule: '0 2 * * 0', // Every Sunday at 2 AM
    enabled: true,
    handler: async () => {
      console.log('🔄 Running full data sync...');
      await runAllScrapers();
    },
  },
  {
    name: 'Federation Check',
    schedule: '0 3 1 * *', // 1st of every month at 3 AM
    enabled: true,
    handler: async () => {
      console.log('🏛️ Checking federation updates...');
      const { runFederationScraper } = await import('../scrapers/federations');
      await runFederationScraper();
    },
  },
  {
    name: 'Cleanup Stale Data',
    schedule: '0 4 * * 1', // Every Monday at 4 AM
    enabled: true,
    handler: async () => {
      console.log('🧹 Cleaning up stale data...');
      
      // Mark clubs as inactive if not updated in 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const result = await prisma.club.updateMany({
        where: {
          lastScrapedAt: {
            lt: sixMonthsAgo,
          },
          status: 'ACTIVE',
          sourceUrl: { not: null }, // Only scraped clubs
        },
        data: {
          status: 'INACTIVE',
        },
      });

      console.log(`Marked ${result.count} clubs as inactive`);
    },
  },
  {
    name: 'Analytics Aggregation',
    schedule: '0 1 * * *', // Every day at 1 AM
    enabled: true,
    handler: async () => {
      console.log('📊 Aggregating analytics...');
      
      // Aggregate page views by day (keep last 90 days of detailed data)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      await prisma.pageView.deleteMany({
        where: {
          createdAt: {
            lt: ninetyDaysAgo,
          },
        },
      });

      console.log('Analytics cleanup complete');
    },
  },
  {
    name: 'Geocode Missing Locations',
    schedule: '0 5 * * 3', // Every Wednesday at 5 AM
    enabled: true,
    handler: async () => {
      console.log('📍 Geocoding missing locations...');
      
      const { geocodeAddress } = await import('../scrapers/config');
      
      const clubsWithoutCoords = await prisma.club.findMany({
        where: {
          latitude: null,
          city: { isNot: null },
        },
        include: {
          city: true,
          country: true,
        },
        take: 50, // Process in batches
      });

      for (const club of clubsWithoutCoords) {
        if (club.city?.name) {
          const cityName = (club.city.name as { en?: string }).en || '';
          const coords = await geocodeAddress(cityName, club.country.code);
          
          if (coords) {
            await prisma.club.update({
              where: { id: club.id },
              data: {
                latitude: coords.latitude,
                longitude: coords.longitude,
              },
            });
            console.log(`Geocoded: ${club.name}`);
          }
        }
      }
    },
  },
];

/**
 * Initialize and start all cron jobs
 */
export function startScheduler(): void {
  console.log('⏰ Starting scheduler...\n');

  for (const job of jobs) {
    if (!job.enabled) {
      console.log(`⏸️  ${job.name}: Disabled`);
      continue;
    }

    if (!cron.validate(job.schedule)) {
      console.error(`❌ Invalid schedule for ${job.name}: ${job.schedule}`);
      continue;
    }

    cron.schedule(job.schedule, async () => {
      const startTime = Date.now();
      console.log(`\n${'─'.repeat(40)}`);
      console.log(`🚀 Starting job: ${job.name}`);
      console.log(`📅 ${new Date().toISOString()}`);

      try {
        await job.handler();
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ ${job.name} completed in ${duration}s`);
      } catch (error) {
        console.error(`❌ ${job.name} failed:`, error);
      }

      job.lastRun = new Date();
    });

    console.log(`✅ ${job.name}: Scheduled (${job.schedule})`);
  }

  console.log('\n📅 Scheduler is running. Press Ctrl+C to stop.\n');
}

/**
 * Run a specific job manually
 */
export async function runJob(jobName: string): Promise<void> {
  const job = jobs.find((j) => j.name.toLowerCase() === jobName.toLowerCase());
  
  if (!job) {
    console.error(`Job not found: ${jobName}`);
    console.log('Available jobs:', jobs.map((j) => j.name).join(', '));
    return;
  }

  console.log(`Running ${job.name}...`);
  await job.handler();
}

/**
 * Get status of all jobs
 */
export function getJobStatus(): Array<{ name: string; enabled: boolean; schedule: string; lastRun?: Date }> {
  return jobs.map((job) => ({
    name: job.name,
    enabled: job.enabled,
    schedule: job.schedule,
    lastRun: job.lastRun,
  }));
}

// Run if executed directly
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args[0] === 'run' && args[1]) {
    runJob(args[1])
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  } else if (args[0] === 'status') {
    console.log('Job Status:');
    console.table(getJobStatus());
  } else {
    startScheduler();
  }
}
