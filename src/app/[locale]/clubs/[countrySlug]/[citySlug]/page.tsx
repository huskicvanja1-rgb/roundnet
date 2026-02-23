import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from '@/lib/i18n/server';
import { notFound } from 'next/navigation';
import { Link } from '@/lib/i18n/routing';
import { dataProvider } from '@/lib/data/provider';
import { generateCityMetadata } from '@/lib/seo/metadata';
import {
  generateClubListJsonLd,
  generateBreadcrumbJsonLd,
  generateFaqJsonLd,
  serializeJsonLd,
} from '@/lib/seo/jsonld';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ClubCard } from '@/components/ClubCard';
import { FAQ } from '@/components/FAQ';
import { locales, type Locale } from '@/lib/i18n/locales';

interface CityPageProps {
  params: {
    locale: string;
    countrySlug: string;
    citySlug: string;
  };
}

export async function generateStaticParams() {
  const countries = await dataProvider.getCountries();
  const params: { locale: string; countrySlug: string; citySlug: string }[] = [];

  for (const locale of locales) {
    for (const country of countries) {
      const cities = await dataProvider.getCitiesByCountry(country.slug);
      for (const city of cities) {
        params.push({
          locale,
          countrySlug: country.slug,
          citySlug: city.slug,
        });
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const locale = params.locale as Locale;
  const city = await dataProvider.getCityBySlug(params.citySlug);
  const country = await dataProvider.getCountryBySlug(params.countrySlug);

  if (!city || !country) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'city' });

  return generateCityMetadata({
    locale,
    city: {
      name: city.name,
      slug: city.slug,
    },
    country: {
      name: country.name,
      slug: country.slug,
    },
    clubCount: city.clubCount,
    t: {
      title: (cityName: string, countryName: string, count: number) =>
        t('metaTitle', { city: cityName, country: countryName, count }),
      description: (cityName: string, countryName: string, count: number) =>
        t('metaDescription', { city: cityName, country: countryName, count }),
    },
  });
}

export default async function CityPage({ params }: CityPageProps) {
  const locale = params.locale as Locale;
  setRequestLocale(locale);

  const city = await dataProvider.getCityBySlug(params.citySlug);
  const country = await dataProvider.getCountryBySlug(params.countrySlug);

  if (!city || !country) {
    notFound();
  }

  const t = await getTranslations('city');
  const tBreadcrumbs = await getTranslations('breadcrumbs');
  const tEmpty = await getTranslations('empty');
  const tFaq = await getTranslations('faq');

  // Get clubs for this city
  const clubs = await dataProvider.getClubsByCity(city.slug);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: tBreadcrumbs('home'), href: '/' },
    { label: tBreadcrumbs('clubs'), href: '/clubs' },
    { label: country.name, href: `/clubs/${country.slug}` },
    { label: city.name },
  ];

  // FAQ items
  const faqItems = [
    {
      question: tFaq('cityQ1', { city: city.name }),
      answer: tFaq('cityA1', { city: city.name, count: clubs.length }),
    },
    {
      question: tFaq('cityQ2', { city: city.name }),
      answer: tFaq('cityA2', { city: city.name }),
    },
    {
      question: tFaq('cityQ3', { city: city.name }),
      answer: tFaq('cityA3', { city: city.name }),
    },
  ];

  // JSON-LD
  const clubListJsonLd = generateClubListJsonLd({
    name: t('title', { city: city.name }),
    description: t('metaDescription', { city: city.name, country: country.name, count: clubs.length }),
    itemCount: clubs.length,
    items: clubs.map((club) => ({
      name: club.name,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/club/${club.slug}`,
      address: `${city.name}, ${country.name}`,
    })),
  });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(
    breadcrumbItems.map((item) => ({
      name: item.label,
      url: item.href
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}${item.href}`
        : `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/clubs/${country.slug}/${city.slug}`,
    }))
  );

  const faqJsonLd = generateFaqJsonLd(faqItems);

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(clubListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
      />

      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Breadcrumbs items={breadcrumbItems} className="mb-4 text-orange-100" />

            <div className="flex items-center gap-4">
              <span className="text-5xl">{country.flag}</span>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold">
                  {t('title', { city: city.name })}
                </h1>
                <p className="text-orange-100 mt-1">
                  {t('subtitle', { clubCount: city.clubCount, country: country.name })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Clubs Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('clubsTitle', { city: city.name })}
            </h2>

            {clubs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clubs.map((club) => (
                  <ClubCard key={club.slug} club={club} showCity={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-gray-600 mb-4">{tEmpty('noClubsCity')}</p>
                <Link
                  href="/submit"
                  className="inline-flex items-center px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {tEmpty('addFirst')}
                </Link>
              </div>
            )}
          </section>

          {/* Map Placeholder */}
          {city.latitude && city.longitude && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('mapTitle', { city: city.name })}
              </h2>
              <div className="bg-gray-100 rounded-xl h-80 flex items-center justify-center">
                <p className="text-gray-500">
                  {t('mapPlaceholder')} ({city.latitude}, {city.longitude})
                </p>
              </div>
            </section>
          )}

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('faqTitle')}</h2>
            <FAQ items={faqItems} />
          </section>

          {/* SEO Content */}
          <section className="mt-16 prose prose-gray max-w-none">
            <h2>{t('seoTitle', { city: city.name, country: country.name })}</h2>
            <p>{t('seoContent', { city: city.name, country: country.name, clubCount: clubs.length })}</p>
          </section>

          {/* Related Cities */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('otherCities', { country: country.name })}
            </h2>
            <div className="flex flex-wrap gap-3">
              {(await dataProvider.getCitiesByCountry(country.slug))
                .filter((c) => c.slug !== city.slug)
                .slice(0, 6)
                .map((relatedCity) => (
                  <Link
                    key={relatedCity.slug}
                    href={`/clubs/${country.slug}/${relatedCity.slug}`}
                    className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-orange-100 hover:text-orange-700 transition-colors"
                  >
                    {relatedCity.name}
                  </Link>
                ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
