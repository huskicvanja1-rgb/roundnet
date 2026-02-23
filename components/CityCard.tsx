import { Link } from '@/lib/i18n/routing';
import type { City } from '@/lib/data/schemas';
import { Users, ArrowRight } from 'lucide-react';

interface CityCardProps {
  city: City;
  countrySlug: string;
}

export function CityCard({ city, countrySlug }: CityCardProps) {
  return (
    <Link
      href={`/clubs/${countrySlug}/${city.slug}`}
      className="group flex items-center justify-between bg-white rounded-lg border border-gray-200 px-5 py-4 hover:border-orange-300 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        {/* City name */}
        <h3 className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
          {city.name}
        </h3>

        {/* Club count badge */}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-sm rounded-full">
          <Users className="h-3.5 w-3.5" />
          {city.clubCount}
        </span>
      </div>

      {/* Arrow */}
      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}
