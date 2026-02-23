import { SITE_URL } from './metadata';

/**
 * Base JSON-LD structure
 */
interface JsonLdBase {
  '@context': string;
  '@type': string | string[];
}

/**
 * Serialize JSON-LD to string safely
 */
export function serializeJsonLd(jsonLd: Record<string, unknown>): string {
  return JSON.stringify(jsonLd, null, 2);
}

/**
 * Club options for JSON-LD generation
 */
interface ClubJsonLdOptions {
  name: string;
  description?: string;
  url: string;
  address?: {
    street?: string;
    city?: string;
    country?: string;
  };
  geo?: {
    lat: number;
    lng: number;
  };
  email?: string;
  phone?: string;
  website?: string;
  socialLinks?: string[];
  memberCount?: number;
  foundingYear?: number;
}

/**
 * Generate JSON-LD for a Roundnet Club (SportsActivityLocation + Organization)
 */
export function generateClubJsonLd(options: ClubJsonLdOptions): JsonLdBase & Record<string, unknown> {
  const jsonLd: JsonLdBase & Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['SportsActivityLocation', 'Organization'],
    '@id': options.url,
    name: options.name,
    url: options.website || options.url,
    sport: 'Roundnet',
  };

  if (options.description) {
    jsonLd.description = options.description;
  }

  // Add address
  if (options.address) {
    jsonLd.address = {
      '@type': 'PostalAddress',
      ...(options.address.street && { streetAddress: options.address.street }),
      ...(options.address.city && { addressLocality: options.address.city }),
      ...(options.address.country && { addressCountry: options.address.country }),
    };
  }

  // Add geo coordinates if available
  if (options.geo) {
    jsonLd.geo = {
      '@type': 'GeoCoordinates',
      latitude: options.geo.lat,
      longitude: options.geo.lng,
    };
  }

  // Add contact info
  if (options.email) {
    jsonLd.email = options.email;
  }
  if (options.phone) {
    jsonLd.telephone = options.phone;
  }

  // Add social links
  if (options.socialLinks && options.socialLinks.length > 0) {
    jsonLd.sameAs = options.socialLinks;
  }

  // Add founding date
  if (options.foundingYear) {
    jsonLd.foundingDate = `${options.foundingYear}-01-01`;
  }

  // Add member count
  if (options.memberCount) {
    jsonLd.numberOfEmployees = {
      '@type': 'QuantitativeValue',
      value: options.memberCount,
    };
  }

  return jsonLd;
}

/**
 * Club list item for JSON-LD
 */
interface ClubListItem {
  name: string;
  url: string;
  address?: string;
}

/**
 * Club list options for JSON-LD
 */
interface ClubListJsonLdOptions {
  name: string;
  description?: string;
  itemCount: number;
  items: ClubListItem[];
}

/**
 * Generate JSON-LD ItemList for Club listings
 */
export function generateClubListJsonLd(options: ClubListJsonLdOptions): JsonLdBase & Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: options.name,
    description: options.description,
    numberOfItems: options.itemCount,
    itemListElement: options.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'SportsActivityLocation',
        name: item.name,
        url: item.url,
        ...(item.address && {
          address: {
            '@type': 'PostalAddress',
            addressLocality: item.address,
          },
        }),
      },
    })),
  };
}

/**
 * FAQ item
 */
interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Generate JSON-LD FAQPage
 */
export function generateFaqJsonLd(items: FaqItem[]): JsonLdBase & Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * Breadcrumb item
 */
interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generate JSON-LD BreadcrumbList
 */
export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]): JsonLdBase & Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate JSON-LD WebSite for homepage
 */
export function generateWebsiteJsonLd(): JsonLdBase & Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'Roundnet Directory Europe',
    description: 'Find Roundnet and Spikeball clubs, communities, and events across Europe',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Roundnet Directory Europe',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
  };
}

/**
 * Generate JSON-LD Organization
 */
export function generateOrganizationJsonLd(): JsonLdBase & Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Roundnet Directory Europe',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'The comprehensive directory for Roundnet and Spikeball clubs across Europe',
    sameAs: [],
  };
}
