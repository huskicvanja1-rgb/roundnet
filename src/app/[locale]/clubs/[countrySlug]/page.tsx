import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/lib/i18n/routing';
import { dataProvider } from '@/lib/data/provider';
import { generateCountryMetadata } from '@/lib/seo/metadata';
import { generateClubListJsonLd, generateBreadcrumbJsonLd, serializeJsonLd } from '@/lib/seo/jsonld';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CityCard } from '@/components/CityCard';
import { ClubCard } from '@/components/ClubCard';
import { locales, type Locale } from '@/lib/i18n/locales';

interface CountryPageProps {
  params: {
    locale: string;
    countrySlug: string;
  };
}

export async function generateStaticParams() {
  const countries = await dataProvider.getCountries();
  const params: { locale: string; countrySlug: string }[] = [];

  for (const locale of locales) {
    for (const country of countries) {
      params.push({
        locale,
        countrySlug: country.slug,
      });
    }
  }

  return params;
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const locale = params.locale as Locale;
  const country = await dataProvider.getCountryBySlug(params.countrySlug);

  if (!country) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'country' });

  return generateCountryMetadata({
    locale,
    country: {
      name: country.name,
      slug: country.slug,
      description: t('metaDescription', { country: country.name, count: country.clubCount }),
    },
    clubCount: country.clubCount,
    t: {
      title: (name: string, count: number) => t('metaTitle', { country: name, count }),
      description: (name: string, count: number) => t('metaDescription', { country: name, count }),
    },
  });
}

export default async function CountryPage({ params }: CountryPageProps) {
  const locale = params.locale as Locale;
  setRequestLocale(locale);

  const country = await dataProvider.getCountryBySlug(params.countrySlug);

  if (!country) {
    notFound();
  }

  const t = await getTranslations('country');
  const tBreadcrumbs = await getTranslations('breadcrumbs');
  const tEmpty = await getTranslations('empty');

  // Get cities and clubs for this country
  const cities = await dataProvider.getCitiesByCountry(country.slug);
  const clubs = await dataProvider.getClubsByCountry(country.slug);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: tBreadcrumbs('home'), href: '/' },
    { label: tBreadcrumbs('clubs'), href: '/clubs' },
    { label: country.name },
  ];

  // JSON-LD
  const clubListJsonLd = generateClubListJsonLd({
    name: t('title', { country: country.name }),
    description: t('metaDescription', { country: country.name, count: country.clubCount }),
    itemCount: clubs.length,
    items: clubs.slice(0, 10).map((club) => ({
      name: club.name,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/club/${club.slug}`,
      address: club.city?.name,
    })),
  });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(
    breadcrumbItems.map((item, index) => ({
      name: item.label,
      url: item.href
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}${item.href}`
        : `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/clubs/${country.slug}`,
    }))
  );

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

      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Breadcrumbs items={breadcrumbItems} className="mb-4 text-orange-100" />

            <div className="flex items-center gap-4">
              <span className="text-5xl">{country.flag}</span>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold">
                  {t('title', { country: country.name })}
                </h1>
                <p className="text-orange-100 mt-1">
                  {t('subtitle', { clubCount: country.clubCount, cityCount: country.cityCount })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Cities Section */}
          {cities.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('citiesTitle', { country: country.name })}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cities.map((city) => (
                  <CityCard key={city.slug} city={city} countrySlug={country.slug} />
                ))}
              </div>
            </section>
          )}

          {/* All Clubs Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('clubsTitle', { country: country.name })}
            </h2>

            {clubs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clubs.map((club) => (
                  <ClubCard key={club.slug} club={club} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-gray-600 mb-4">{tEmpty('noClubsCountry')}</p>
                <Link
                  href="/submit"
                  className="inline-flex items-center px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {tEmpty('addFirst')}
                </Link>
              </div>
            )}
          </section>

          {/* SEO Content */}
          <section className="mt-16 prose prose-gray max-w-none">
            <h2>{t('seoTitle', { country: country.name })}</h2>
            <p>{t('seoContent', { country: country.name, clubCount: country.clubCount })}</p>
          </section>
        </div>
      </div>
    </>
  );
}
