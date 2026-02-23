import { PrismaClient, ClubType, ClubStatus, ClubFeature, PlayStyle } from '@prisma/client';

const prisma = new PrismaClient();

// European countries with Roundnet activity
const countries = [
  { code: 'AT', name: { en: 'Austria', de: 'Österreich', fr: 'Autriche' }, slug: 'austria', flagEmoji: '🇦🇹' },
  { code: 'BE', name: { en: 'Belgium', de: 'Belgien', fr: 'Belgique', nl: 'België' }, slug: 'belgium', flagEmoji: '🇧🇪' },
  { code: 'CH', name: { en: 'Switzerland', de: 'Schweiz', fr: 'Suisse', it: 'Svizzera' }, slug: 'switzerland', flagEmoji: '🇨🇭' },
  { code: 'CZ', name: { en: 'Czech Republic', de: 'Tschechien', fr: 'Tchéquie' }, slug: 'czech-republic', flagEmoji: '🇨🇿' },
  { code: 'DE', name: { en: 'Germany', de: 'Deutschland', fr: 'Allemagne' }, slug: 'germany', flagEmoji: '🇩🇪' },
  { code: 'DK', name: { en: 'Denmark', de: 'Dänemark', fr: 'Danemark' }, slug: 'denmark', flagEmoji: '🇩🇰' },
  { code: 'ES', name: { en: 'Spain', de: 'Spanien', fr: 'Espagne', es: 'España' }, slug: 'spain', flagEmoji: '🇪🇸' },
  { code: 'FI', name: { en: 'Finland', de: 'Finnland', fr: 'Finlande' }, slug: 'finland', flagEmoji: '🇫🇮' },
  { code: 'FR', name: { en: 'France', de: 'Frankreich', fr: 'France' }, slug: 'france', flagEmoji: '🇫🇷' },
  { code: 'GB', name: { en: 'United Kingdom', de: 'Vereinigtes Königreich', fr: 'Royaume-Uni' }, slug: 'united-kingdom', flagEmoji: '🇬🇧' },
  { code: 'GR', name: { en: 'Greece', de: 'Griechenland', fr: 'Grèce' }, slug: 'greece', flagEmoji: '🇬🇷' },
  { code: 'HR', name: { en: 'Croatia', de: 'Kroatien', fr: 'Croatie' }, slug: 'croatia', flagEmoji: '🇭🇷' },
  { code: 'HU', name: { en: 'Hungary', de: 'Ungarn', fr: 'Hongrie' }, slug: 'hungary', flagEmoji: '🇭🇺' },
  { code: 'IE', name: { en: 'Ireland', de: 'Irland', fr: 'Irlande' }, slug: 'ireland', flagEmoji: '🇮🇪' },
  { code: 'IT', name: { en: 'Italy', de: 'Italien', fr: 'Italie', it: 'Italia' }, slug: 'italy', flagEmoji: '🇮🇹' },
  { code: 'NL', name: { en: 'Netherlands', de: 'Niederlande', fr: 'Pays-Bas', nl: 'Nederland' }, slug: 'netherlands', flagEmoji: '🇳🇱' },
  { code: 'NO', name: { en: 'Norway', de: 'Norwegen', fr: 'Norvège' }, slug: 'norway', flagEmoji: '🇳🇴' },
  { code: 'PL', name: { en: 'Poland', de: 'Polen', fr: 'Pologne' }, slug: 'poland', flagEmoji: '🇵🇱' },
  { code: 'PT', name: { en: 'Portugal', de: 'Portugal', fr: 'Portugal' }, slug: 'portugal', flagEmoji: '🇵🇹' },
  { code: 'RO', name: { en: 'Romania', de: 'Rumänien', fr: 'Roumanie' }, slug: 'romania', flagEmoji: '🇷🇴' },
  { code: 'SE', name: { en: 'Sweden', de: 'Schweden', fr: 'Suède' }, slug: 'sweden', flagEmoji: '🇸🇪' },
  { code: 'SI', name: { en: 'Slovenia', de: 'Slowenien', fr: 'Slovénie' }, slug: 'slovenia', flagEmoji: '🇸🇮' },
  { code: 'SK', name: { en: 'Slovakia', de: 'Slowakei', fr: 'Slovaquie' }, slug: 'slovakia', flagEmoji: '🇸🇰' },
];

// Sample federations data from IRF
const federations = [
  {
    countryCode: 'FR',
    name: { en: 'Roundnet France', fr: 'Roundnet France' },
    website: 'https://www.roundnetfrance.fr',
    email: 'contact@roundnetfrance.fr',
    irfMember: true,
  },
  {
    countryCode: 'DE',
    name: { en: 'Roundnet Germany', de: 'Roundnet Germany' },
    website: 'https://roundnetgermany.de',
    email: 'info@roundnetgermany.de',
    irfMember: true,
  },
  {
    countryCode: 'IT',
    name: { en: 'Italian Roundnet Federation', it: 'Federazione Italiana Roundnet' },
    website: 'https://federazioneitalianaroundnet.com',
    email: 'info@federazioneitalianaroundnet.com',
    irfMember: true,
  },
  {
    countryCode: 'ES',
    name: { en: 'Spanish Roundnet Federation', es: 'Federación Española de Roundnet' },
    website: 'https://roundnetspain.com',
    email: 'info@roundnetspain.com',
    irfMember: true,
  },
  {
    countryCode: 'GB',
    name: { en: 'Roundnet UK' },
    website: 'https://roundnetuk.com',
    email: 'info@roundnetuk.com',
    irfMember: true,
  },
  {
    countryCode: 'NL',
    name: { en: 'Roundnet Netherlands', nl: 'Roundnet Nederland' },
    website: 'https://roundnet.nl',
    email: 'info@roundnet.nl',
    irfMember: true,
  },
  {
    countryCode: 'BE',
    name: { en: 'Roundnet Belgium', fr: 'Roundnet Belgique', nl: 'Roundnet België' },
    website: 'https://roundnetbelgium.be',
    email: 'info@roundnetbelgium.be',
    irfMember: true,
  },
  {
    countryCode: 'CH',
    name: { en: 'Swiss Roundnet', de: 'Swiss Roundnet', fr: 'Swiss Roundnet' },
    website: 'https://swissroundnet.ch',
    email: 'info@swissroundnet.ch',
    irfMember: true,
  },
  {
    countryCode: 'AT',
    name: { en: 'Roundnet Austria', de: 'Roundnet Austria' },
    website: 'https://roundnet.at',
    email: 'info@roundnet.at',
    irfMember: true,
  },
  {
    countryCode: 'PL',
    name: { en: 'Roundnet Poland', pl: 'Roundnet Polska' },
    website: 'https://roundnetpolska.pl',
    email: 'kontakt@roundnetpolska.pl',
    irfMember: true,
  },
];

// Sample clubs for demonstration
const sampleClubs = [
  {
    name: 'Paris Roundnet Club',
    countryCode: 'FR',
    city: 'Paris',
    slug: 'paris-roundnet-club',
    description: {
      en: 'The largest Roundnet club in Paris. We welcome players of all levels and organize weekly training sessions and tournaments.',
      fr: 'Le plus grand club de Roundnet à Paris. Nous accueillons les joueurs de tous niveaux et organisons des entraînements hebdomadaires et des tournois.',
    },
    latitude: 48.8566,
    longitude: 2.3522,
    type: ClubType.OFFICIAL_CLUB,
    features: [ClubFeature.OUTDOOR, ClubFeature.INDOOR, ClubFeature.BEGINNERS_WELCOME, ClubFeature.TOURNAMENTS],
    playStyle: [PlayStyle.COMPETITIVE, PlayStyle.RECREATIONAL],
  },
  {
    name: 'Angers Spikeball',
    countryCode: 'FR',
    city: 'Angers',
    slug: 'angers-spikeball',
    description: {
      en: 'Community group playing Spikeball in Angers. Join us every Saturday at Lac de Maine!',
      fr: 'Groupe communautaire de Spikeball à Angers. Rejoignez-nous chaque samedi au Lac de Maine!',
    },
    latitude: 47.4784,
    longitude: -0.5632,
    type: ClubType.COMMUNITY,
    features: [ClubFeature.OUTDOOR, ClubFeature.BEGINNERS_WELCOME, ClubFeature.FREE_TO_JOIN],
    playStyle: [PlayStyle.RECREATIONAL],
  },
  {
    name: 'Berlin Roundnet',
    countryCode: 'DE',
    city: 'Berlin',
    slug: 'berlin-roundnet',
    description: {
      en: 'Berlin\'s premier Roundnet community with multiple training locations across the city.',
      de: 'Berlins führende Roundnet-Community mit mehreren Trainingsorten in der Stadt.',
    },
    latitude: 52.5200,
    longitude: 13.4050,
    type: ClubType.OFFICIAL_CLUB,
    features: [ClubFeature.OUTDOOR, ClubFeature.INDOOR, ClubFeature.ADVANCED_TRAINING, ClubFeature.COACHING],
    playStyle: [PlayStyle.COMPETITIVE, PlayStyle.MIXED],
  },
  {
    name: 'Milano Roundnet ASD',
    countryCode: 'IT',
    city: 'Milano',
    slug: 'milano-roundnet',
    description: {
      en: 'Official Roundnet club in Milan, affiliated with the Italian Roundnet Federation.',
      it: 'Club ufficiale di Roundnet a Milano, affiliato alla Federazione Italiana Roundnet.',
    },
    latitude: 45.4642,
    longitude: 9.1900,
    type: ClubType.OFFICIAL_CLUB,
    features: [ClubFeature.OUTDOOR, ClubFeature.TOURNAMENTS, ClubFeature.EQUIPMENT_PROVIDED],
    playStyle: [PlayStyle.COMPETITIVE],
  },
  {
    name: 'Lyon Spikeball',
    countryCode: 'FR',
    city: 'Lyon',
    slug: 'lyon-spikeball',
    description: {
      en: 'Active Roundnet community in Lyon with regular meetups at Parc de la Tête d\'Or.',
      fr: 'Communauté active de Roundnet à Lyon avec des rencontres régulières au Parc de la Tête d\'Or.',
    },
    latitude: 45.7640,
    longitude: 4.8357,
    type: ClubType.COMMUNITY,
    features: [ClubFeature.OUTDOOR, ClubFeature.BEGINNERS_WELCOME, ClubFeature.SOCIAL_EVENTS],
    playStyle: [PlayStyle.RECREATIONAL, PlayStyle.MIXED],
  },
];

// Blog categories
const blogCategories = [
  { slug: 'rules', name: { en: 'Rules & Gameplay', fr: 'Règles et Jeu', de: 'Regeln & Spielweise' } },
  { slug: 'techniques', name: { en: 'Techniques & Tips', fr: 'Techniques et Conseils', de: 'Techniken & Tipps' } },
  { slug: 'tournaments', name: { en: 'Tournaments', fr: 'Tournois', de: 'Turniere' } },
  { slug: 'interviews', name: { en: 'Interviews', fr: 'Interviews', de: 'Interviews' } },
  { slug: 'equipment', name: { en: 'Equipment', fr: 'Équipement', de: 'Ausrüstung' } },
  { slug: 'community', name: { en: 'Community', fr: 'Communauté', de: 'Gemeinschaft' } },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.review.deleteMany();
  await prisma.clubImage.deleteMany();
  await prisma.clubAdmin.deleteMany();
  await prisma.trainingSchedule.deleteMany();
  await prisma.eventRsvp.deleteMany();
  await prisma.event.deleteMany();
  await prisma.club.deleteMany();
  await prisma.federation.deleteMany();
  await prisma.city.deleteMany();
  await prisma.region.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.blogTag.deleteMany();
  await prisma.blogCategory.deleteMany();
  await prisma.country.deleteMany();

  // Seed countries
  console.log('Seeding countries...');
  for (const country of countries) {
    await prisma.country.create({
      data: {
        code: country.code,
        name: country.name,
        slug: country.slug,
        flagEmoji: country.flagEmoji,
      },
    });
  }

  // Seed federations
  console.log('Seeding federations...');
  for (const fed of federations) {
    const country = await prisma.country.findUnique({
      where: { code: fed.countryCode },
    });
    
    if (country) {
      await prisma.federation.create({
        data: {
          name: fed.name,
          countryId: country.id,
          website: fed.website,
          email: fed.email,
          irfMember: fed.irfMember,
        },
      });
    }
  }

  // Seed cities and clubs
  console.log('Seeding cities and clubs...');
  for (const clubData of sampleClubs) {
    const country = await prisma.country.findUnique({
      where: { code: clubData.countryCode },
    });

    if (country) {
      // Create or find city
      let city = await prisma.city.findFirst({
        where: {
          slug: clubData.city.toLowerCase().replace(/\s+/g, '-'),
        },
      });

      if (!city) {
        city = await prisma.city.create({
          data: {
            name: { en: clubData.city, fr: clubData.city, de: clubData.city },
            slug: clubData.city.toLowerCase().replace(/\s+/g, '-'),
            latitude: clubData.latitude,
            longitude: clubData.longitude,
          },
        });
      }

      // Find federation
      const federation = await prisma.federation.findUnique({
        where: { countryId: country.id },
      });

      // Create club
      await prisma.club.create({
        data: {
          name: clubData.name,
          slug: clubData.slug,
          description: clubData.description,
          countryId: country.id,
          cityId: city.id,
          latitude: clubData.latitude,
          longitude: clubData.longitude,
          type: clubData.type,
          features: clubData.features,
          playStyle: clubData.playStyle,
          status: ClubStatus.ACTIVE,
          isVerified: true,
          federationId: clubData.type === ClubType.OFFICIAL_CLUB ? federation?.id : null,
        },
      });
    }
  }

  // Seed blog categories
  console.log('Seeding blog categories...');
  for (const category of blogCategories) {
    await prisma.blogCategory.create({
      data: {
        name: category.name,
        slug: category.slug,
      },
    });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
