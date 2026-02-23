import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { dataProvider } from '@/lib/data/provider';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { generateClubListJsonLd, serializeJsonLd } from '@/lib/seo/jsonld';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CountryCard } from '@/components/CountryCard';
import { locales, type Locale } from '@/lib/i18n/locales';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface ClubsPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: ClubsPageProps): Promise<Metadata> {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'nav' });
  const tSeo = await getTranslations({ locale, namespace: 'seo' });

  return generatePageMetadata({
    locale,
    path: '/clubs',
    title: t('clubs'),
    description: tSeo('clubsDescription'),
    type: 'website',
  });
}

export default async function ClubsPage({ params }: ClubsPageProps) {
  const locale = params.locale as Locale;
  setRequestLocale(locale);

  const t = await getTranslations('home');
  const tBreadcrumbs = await getTranslations('breadcrumbs');
  const tNav = await getTranslations('nav');

  // Fetch all countries
  const countries = await dataProvider.getCountries();
  const clubs = await dataProvider.getAllClubs();

  // Calculate total stats
  const totalClubs = countries.reduce((sum, c) => sum + c.clubCount, 0);
  const totalCities = countries.reduce((sum, c) => sum + c.cityCount, 0);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: tBreadcrumbs('home'), href: '/' },
    { label: tBreadcrumbs('clubs') },
  ];

  // JSON-LD
  const clubListJsonLd = generateClubListJsonLd({
    name: tNav('clubs'),
    description: t('countriesSubtitle'),
    itemCount: totalClubs,
    items: clubs.slice(0, 20).map((club) => ({
      name: club.name,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/club/${club.slug}`,
      address: club.city?.name,
    })),
  });

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(clubListJsonLd) }}
      />

      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Breadcrumbs items={breadcrumbItems} className="mb-4 text-orange-100" />

            <h1 className="text-3xl sm:text-4xl font-bold">{tNav('clubs')}</h1>
            <p className="text-orange-100 mt-2">{t('countriesSubtitle')}</p>

            {/* Stats */}
            <div className="flex gap-8 mt-6">
              <div>
                <div className="text-2xl font-bold">{totalClubs}+</div>
                <div className="text-sm text-orange-200">{t('statsClubs')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{totalCities}+</div>
                <div className="text-sm text-orange-200">{t('statsCities')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{countries.length}</div>
                <div className="text-sm text-orange-200">{t('statsCountries')}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Countries Grid */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('countriesTitle')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {countries.map((country) => (
                <CountryCard key={country.slug} country={country} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
