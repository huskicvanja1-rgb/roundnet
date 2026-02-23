import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Users, Star, ExternalLink, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, formatDistance } from '@/lib/utils';
import type { Dictionary } from '@/lib/i18n/dictionaries';

interface Club {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  type: string;
  features: string[];
  isVerified: boolean;
  location: {
    country: {
      code: string;
      name: string;
      flag?: string;
    };
    city?: {
      name: string;
      slug: string;
    };
    latitude?: number;
    longitude?: number;
  };
  contact: {
    website?: string;
    email?: string;
  };
  images: {
    logo?: string;
    cover?: string;
  };
  stats: {
    reviewCount: number;
    memberCount?: number;
  };
  distance?: number;
}

interface ClubCardProps {
  club: Club;
  locale: string;
  dictionary: Dictionary;
  variant?: 'default' | 'compact' | 'featured';
}

export function ClubCard({ club, locale, dictionary, variant = 'default' }: ClubCardProps) {
  const clubUrl = `/${locale}/clubs/${club.location.country.code.toLowerCase()}/${club.slug}`;
  
  const typeLabel = dictionary.clubTypes[club.type as keyof typeof dictionary.clubTypes] || club.type;
  const featureLabels = club.features.slice(0, 3).map(
    (f) => dictionary.features[f as keyof typeof dictionary.features] || f
  );

  if (variant === 'compact') {
    return (
      <Link href={clubUrl} className="block">
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              {club.images.logo ? (
                <Image
                  src={club.images.logo}
                  alt={club.name}
                  width={48}
                  height={48}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold truncate">{club.name}</h3>
                  {club.isVerified && (
                    <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground flex items-center mt-1">
                  <span>{club.location.country.flag}</span>
                  <span className="ml-1">
                    {club.location.city?.name || club.location.country.name}
                  </span>
                  {club.distance && (
                    <span className="ml-2 text-xs">
                      • {formatDistance(club.distance)}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={clubUrl} className="block">
      <Card className="card-hover overflow-hidden h-full">
        {/* Cover Image */}
        <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary/5">
          {club.images.cover ? (
            <Image
              src={club.images.cover}
              alt={club.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin className="h-16 w-16 text-primary/30" />
            </div>
          )}
          
          {/* Type Badge */}
          <Badge 
            variant={club.type === 'OFFICIAL_CLUB' ? 'default' : 'secondary'}
            className="absolute top-3 left-3"
          >
            {typeLabel}
          </Badge>

          {club.isVerified && (
            <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-1">
              <CheckCircle className="h-4 w-4" />
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{club.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center mt-1">
                <span className="mr-1">{club.location.country.flag}</span>
                {club.location.city?.name || club.location.country.name}
                {club.distance && (
                  <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">
                    {formatDistance(club.distance)}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Description */}
          {(club.shortDescription || club.description) && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {club.shortDescription || club.description}
            </p>
          )}

          {/* Features */}
          {featureLabels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {featureLabels.map((feature) => (
                <Badge key={feature} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {club.features.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{club.features.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-3 border-t">
            {club.stats.memberCount && (
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {club.stats.memberCount} {dictionary.common.members}
              </span>
            )}
            {club.stats.reviewCount > 0 && (
              <span className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-500" />
                {club.stats.reviewCount} {dictionary.club.reviews}
              </span>
            )}
            {club.contact.website && (
              <ExternalLink className="h-4 w-4" />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
