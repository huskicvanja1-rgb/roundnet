import { Link } from '@/lib/i18n/routing';
import type { Club } from '@/lib/data/schemas';
import { MapPin, Users, CheckCircle, ExternalLink } from 'lucide-react';

interface ClubCardProps {
  club: Club;
  showCity?: boolean;
}

const featureIcons: Record<string, string> = {
  beginner_friendly: '👋',
  equipment_provided: '🎾',
  indoor: '🏠',
  outdoor: '🌳',
  coaching: '🎓',
  tournaments: '🏆',
  weekly_meetups: '📅',
  youth_program: '👶',
  wheelchair_accessible: '♿',
};

export function ClubCard({ club, showCity = true }: ClubCardProps) {
  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-orange-300 hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {club.name}
              </h3>
              {club.isVerified && (
                <span title="Verified">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                </span>
              )}
            </div>

            {/* City/Location */}
            {showCity && club.city && (
              <p className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  {club.city.name}
                  {club.country && `, ${club.country.name}`}
                </span>
              </p>
            )}

            {/* Description */}
            {club.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {club.description}
              </p>
            )}

            {/* Features */}
            {club.features && club.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {club.features.slice(0, 4).map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    <span>{featureIcons[feature] || '✓'}</span>
                    <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                  </span>
                ))}
                {club.features.length > 4 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                    +{club.features.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Member count */}
          {club.memberCount && (
            <div className="flex flex-col items-center text-gray-400">
              <Users className="h-5 w-5" />
              <span className="text-xs mt-1">{club.memberCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <Link
          href={`/club/${club.slug}`}
          className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
        >
          View Details →
        </Link>

        {club.website && (
          <a
            href={club.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}
