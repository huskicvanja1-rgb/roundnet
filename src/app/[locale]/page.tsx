import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from '@/lib/i18n/server';
import { Link } from '@/lib/i18n/routing';
import { dataProvider } from '@/lib/data/provider';
import { generatePageMetadata, generateAlternates, HOME_PATH } from '@/lib/seo/metadata';
import { CountryCard } from '@/components/CountryCard';
import { locales, type Locale } from '@/lib/i18n/locales';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface HomePageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'home' });

  return generatePageMetadata({
    locale,
    path: HOME_PATH,
    title: t('metaTitle'),
    description: t('metaDescription'),
    type: 'website',
  });
}

export default async function HomePage({ params }: HomePageProps) {
  const locale = params.locale as Locale;
  setRequestLocale(locale);

  const t = await getTranslations('home');
  const tNav = await getTranslations('nav');
  const tCta = await getTranslations('cta');

  // Fetch all countries
  const countries = await dataProvider.getCountries();

  // Calculate total stats
  const totalClubs = countries.reduce((sum, c) => sum + c.clubCount, 0);
  const totalCities = countries.reduce((sum, c) => sum + c.cityCount, 0);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              {t('heroTitle')}
            </h1>
            <p className="text-lg sm:text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              {t('heroSubtitle')}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-10">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold">{totalClubs}+</div>
                <div className="text-sm text-orange-200">{t('statsClubs')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold">{totalCities}+</div>
                <div className="text-sm text-orange-200">{t('statsCities')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold">{countries.length}</div>
                <div className="text-sm text-orange-200">{t('statsCountries')}</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/clubs"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors shadow-lg"
              >
                {t('ctaExplore')}
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/submit"
                className="inline-flex items-center justify-center px-6 py-3 bg-orange-700 text-white font-semibold rounded-lg hover:bg-orange-800 transition-colors border border-orange-400"
              >
                {tCta('submitClub')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Countries Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('countriesTitle')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('countriesSubtitle')}
            </p>
          </div>

          {/* Country Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {countries.map((country) => (
              <CountryCard key={country.slug} country={country} />
            ))}
          </div>

          {/* View All Link */}
          <div className="text-center mt-10">
            <Link
              href="/clubs"
              className="inline-flex items-center text-orange-600 font-semibold hover:text-orange-700 transition-colors"
            >
              {tNav('viewAllClubs')}
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('featuresTitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('feature1Title')}</h3>
              <p className="text-gray-600">{t('feature1Description')}</p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('feature2Title')}</h3>
              <p className="text-gray-600">{t('feature2Description')}</p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('feature3Title')}</h3>
              <p className="text-gray-600">{t('feature3Description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{tCta('title')}</h2>
          <p className="text-lg text-gray-300 mb-8">{tCta('subtitle')}</p>
          <Link
            href="/submit"
            className="inline-flex items-center justify-center px-8 py-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-lg"
          >
            {tCta('submitClub')}
          </Link>
        </div>
      </section>
    </div>
  );
}
