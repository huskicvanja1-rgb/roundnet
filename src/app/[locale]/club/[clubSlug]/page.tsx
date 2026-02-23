import { Metadata } from 'next';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/lib/i18n/routing';
import { dataProvider } from '@/lib/data/provider';
import { generateClubMetadata } from '@/lib/seo/metadata';
import {
  generateClubJsonLd,
  generateBreadcrumbJsonLd,
  generateFaqJsonLd,
  serializeJsonLd,
} from '@/lib/seo/jsonld';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { FAQ } from '@/components/FAQ';
import { locales, type Locale } from '@/lib/i18n/locales';

interface ClubPageProps {
  params: {
    locale: string;
    clubSlug: string;
  };
}

export async function generateStaticParams() {
  const clubs = await dataProvider.getAllClubs();
  const params: { locale: string; clubSlug: string }[] = [];

  for (const locale of locales) {
    for (const club of clubs) {
      params.push({
        locale,
        clubSlug: club.slug,
      });
    }
  }

  return params;
}

export async function generateMetadata({ params }: ClubPageProps): Promise<Metadata> {
  const locale = params.locale as Locale;
  const club = await dataProvider.getClubBySlug(params.clubSlug);

  if (!club) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'club' });

  return generateClubMetadata({
    locale,
    club: {
      name: club.name,
      slug: club.slug,
      description: club.description,
      city: club.city?.name,
      country: club.country?.name,
    },
    t: {
      title: (name: string, city?: string) =>
        city ? t('metaTitle', { club: name, city }) : name,
      description: (name: string, city?: string, country?: string) =>
        t('metaDescription', { club: name, city: city || '', country: country || '' }),
    },
  });
}

export default async function ClubPage({ params }: ClubPageProps) {
  const locale = params.locale as Locale;
  unstable_setRequestLocale(locale);

  const club = await dataProvider.getClubBySlug(params.clubSlug);

  if (!club) {
    notFound();
  }

  const t = await getTranslations('club');
  const tBreadcrumbs = await getTranslations('breadcrumbs');
  const tFaq = await getTranslations('faq');

  // Breadcrumb items
  const breadcrumbItems = [
    { label: tBreadcrumbs('home'), href: '/' },
    { label: tBreadcrumbs('clubs'), href: '/clubs' },
    ...(club.country
      ? [{ label: club.country.name, href: `/clubs/${club.country.slug}` }]
      : []),
    ...(club.city && club.country
      ? [{ label: club.city.name, href: `/clubs/${club.country.slug}/${club.city.slug}` }]
      : []),
    { label: club.name },
  ];

  // FAQ items
  const faqItems = [
    {
      question: tFaq('clubQ1', { club: club.name }),
      answer: tFaq('clubA1', { club: club.name, city: club.city?.name || '' }),
    },
    {
      question: tFaq('clubQ2', { club: club.name }),
      answer: tFaq('clubA2', { club: club.name }),
    },
    {
      question: tFaq('clubQ3'),
      answer: tFaq('clubA3', { club: club.name }),
    },
  ];

  // JSON-LD
  const clubJsonLd = generateClubJsonLd({
    name: club.name,
    description: club.description,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/club/${club.slug}`,
    address: {
      city: club.city?.name,
      country: club.country?.name,
    },
    geo: club.latitude && club.longitude
      ? { lat: club.latitude, lng: club.longitude }
      : undefined,
    socialLinks: [club.website, club.instagram, club.facebook].filter(Boolean) as string[],
    memberCount: club.memberCount,
    foundingYear: club.foundedYear,
  });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(
    breadcrumbItems.map((item) => ({
      name: item.label,
      url: item.href
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}${item.href}`
        : `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/club/${club.slug}`,
    }))
  );

  const faqJsonLd = generateFaqJsonLd(faqItems);

  // Feature labels
  const featureLabels: Record<string, string> = {
    beginner_friendly: t('featureBeginnerFriendly'),
    equipment_provided: t('featureEquipmentProvided'),
    outdoor: t('featureOutdoor'),
    indoor: t('featureIndoor'),
    weekly_meetups: t('featureWeeklyMeetups'),
    tournaments: t('featureTournaments'),
    coaching: t('featureCoaching'),
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(clubJsonLd) }}
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

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl font-bold">{club.name}</h1>
                  {club.isVerified && (
                    <span className="inline-flex items-center px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                      ✓ {t('verified')}
                    </span>
                  )}
                </div>
                <p className="text-orange-100 mt-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {club.city?.name}, {club.country?.name}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                {club.website && (
                  <a
                    href={club.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-white text-orange-600 font-medium rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                    {t('visitWebsite')}
                  </a>
                )}
                {club.email && (
                  <a
                    href={`mailto:${club.email}`}
                    className="inline-flex items-center px-4 py-2 bg-orange-700 text-white font-medium rounded-lg hover:bg-orange-800 transition-colors border border-orange-400"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {t('contact')}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              {club.description && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('about')}</h2>
                  <div className="prose prose-gray max-w-none">
                    <p>{club.description}</p>
                  </div>
                </section>
              )}

              {/* Features */}
              {club.features && club.features.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('features')}</h2>
                  <div className="flex flex-wrap gap-2">
                    {club.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-3 py-1.5 bg-orange-100 text-orange-800 text-sm rounded-full"
                      >
                        {featureLabels[feature] || feature}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Map Placeholder */}
              {club.latitude && club.longitude && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('location')}</h2>
                  <div className="bg-gray-100 rounded-xl h-80 flex items-center justify-center">
                    <p className="text-gray-500">
                      {t('mapPlaceholder')} ({club.latitude}, {club.longitude})
                    </p>
                  </div>
                </section>
              )}

              {/* FAQ */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('faqTitle')}</h2>
                <FAQ items={faqItems} />
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-4">{t('clubInfo')}</h3>

                <dl className="space-y-4 text-sm">
                  {club.memberCount && (
                    <div>
                      <dt className="text-gray-500">{t('members')}</dt>
                      <dd className="font-medium text-gray-900">{club.memberCount}+</dd>
                    </div>
                  )}

                  {club.foundedYear && (
                    <div>
                      <dt className="text-gray-500">{t('founded')}</dt>
                      <dd className="font-medium text-gray-900">{club.foundedYear}</dd>
                    </div>
                  )}

                  {club.trainingSchedule && (
                    <div>
                      <dt className="text-gray-500">{t('trainingSchedule')}</dt>
                      <dd className="font-medium text-gray-900">{club.trainingSchedule}</dd>
                    </div>
                  )}

                  {club.address && (
                    <div>
                      <dt className="text-gray-500">{t('address')}</dt>
                      <dd className="font-medium text-gray-900">{club.address}</dd>
                    </div>
                  )}
                </dl>

                {/* Social Links */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">{t('socialLinks')}</h4>
                  <div className="flex gap-3">
                    {club.instagram && (
                      <a
                        href={club.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-pink-100 hover:text-pink-600 transition-colors"
                        aria-label="Instagram"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </a>
                    )}
                    {club.facebook && (
                      <a
                        href={club.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                        aria-label="Facebook"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>

                {/* Report/Claim */}
                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                  <Link
                    href={`/claim/${club.slug}`}
                    className="text-sm text-gray-500 hover:text-orange-600 transition-colors"
                  >
                    {t('claimClub')}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Related Clubs */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('relatedClubs', { city: club.city?.name || '' })}
            </h2>
            <div className="flex flex-wrap gap-3">
              {club.city &&
                (await dataProvider.getClubsByCity(club.city.slug))
                  .filter((c) => c.slug !== club.slug)
                  .slice(0, 4)
                  .map((relatedClub) => (
                    <Link
                      key={relatedClub.slug}
                      href={`/club/${relatedClub.slug}`}
                      className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-orange-100 hover:text-orange-700 transition-colors"
                    >
                      {relatedClub.name}
                    </Link>
                  ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
