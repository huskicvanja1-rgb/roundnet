import { Link } from '@/lib/i18n/routing';
import type { Country } from '@/lib/data/schemas';
import { MapPin, Users } from 'lucide-react';

interface CountryCardProps {
  country: Country;
}

export function CountryCard({ country }: CountryCardProps) {
  return (
    <Link
      href={`/clubs/${country.slug}`}
      className="group block bg-white rounded-xl border border-gray-200 p-6 hover:border-orange-300 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        {/* Flag */}
        <span className="text-4xl" role="img" aria-label={country.name}>
          {country.flag}
        </span>

        <div className="flex-1 min-w-0">
          {/* Country name */}
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
            {country.name}
          </h3>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {country.clubCount} {country.clubCount === 1 ? 'club' : 'clubs'}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {country.cityCount} {country.cityCount === 1 ? 'city' : 'cities'}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <span className="text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all">
          →
        </span>
      </div>
    </Link>
  );
}
