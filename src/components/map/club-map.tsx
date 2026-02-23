'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Dictionary } from '@/lib/i18n/dictionaries';

import 'leaflet/dist/leaflet.css';

// Custom marker icon
const createMarkerIcon = (isSelected = false) => new Icon({
  iconUrl: isSelected 
    ? '/images/marker-selected.svg'
    : '/images/marker.svg',
  iconSize: isSelected ? [40, 40] : [32, 32],
  iconAnchor: isSelected ? [20, 40] : [16, 32],
  popupAnchor: [0, -32],
});

// Default icon fallback using data URI
const defaultIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjZiMzUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjEgMTBjMCA3LTkgMTMtOSAxM3MtOS02LTktMTNhOSA5IDAgMCAxIDE4IDB6Ii8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMyIvPjwvc3ZnPg==',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface Club {
  id: string;
  name: string;
  slug: string;
  type: string;
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
  features: string[];
  isVerified: boolean;
}

interface ClubMapProps {
  clubs: Club[];
  locale: string;
  dictionary: Dictionary;
  initialCenter?: [number, number];
  initialZoom?: number;
  selectedClubId?: string;
  onClubSelect?: (clubId: string | null) => void;
  showUserLocation?: boolean;
  className?: string;
}

// Component to handle map events and fit bounds
function MapController({ 
  clubs, 
  userLocation,
  selectedClubId,
}: { 
  clubs: Club[];
  userLocation: [number, number] | null;
  selectedClubId?: string;
}) {
  const map = useMap();
  const initialFitDone = useRef(false);

  useEffect(() => {
    if (initialFitDone.current) return;
    
    const validClubs = clubs.filter(
      (c) => c.location.latitude && c.location.longitude
    );

    if (validClubs.length === 0) {
      // Default to Europe center
      map.setView([50.0, 10.0], 4);
      initialFitDone.current = true;
      return;
    }

    if (validClubs.length === 1) {
      map.setView(
        [validClubs[0].location.latitude!, validClubs[0].location.longitude!],
        12
      );
    } else {
      const bounds = new LatLngBounds(
        validClubs.map((c) => [c.location.latitude!, c.location.longitude!])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
    
    initialFitDone.current = true;
  }, [clubs, map]);

  // Center on selected club
  useEffect(() => {
    if (selectedClubId) {
      const club = clubs.find((c) => c.id === selectedClubId);
      if (club?.location.latitude && club?.location.longitude) {
        map.setView([club.location.latitude, club.location.longitude], 14);
      }
    }
  }, [selectedClubId, clubs, map]);

  // Center on user location if provided
  useEffect(() => {
    if (userLocation) {
      map.setView(userLocation, 12);
    }
  }, [userLocation, map]);

  return null;
}

// User location marker
function UserLocationMarker({ position }: { position: [number, number] }) {
  const userIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMTk5MmZmIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIvPjwvc3ZnPg==',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return <Marker position={position} icon={userIcon} />;
}

export function ClubMap({
  clubs,
  locale,
  dictionary,
  initialCenter = [50.0, 10.0], // Center of Europe
  initialZoom = 4,
  selectedClubId,
  onClubSelect,
  showUserLocation = true,
  className,
}: ClubMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Get user's location
  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // Filter clubs with valid coordinates
  const mappableClubs = clubs.filter(
    (club) => club.location.latitude && club.location.longitude
  );

  return (
    <div className={cn('relative rounded-lg overflow-hidden', className)}>
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        className="h-full w-full min-h-[400px]"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController 
          clubs={mappableClubs} 
          userLocation={userLocation}
          selectedClubId={selectedClubId}
        />

        {/* User location marker */}
        {userLocation && <UserLocationMarker position={userLocation} />}

        {/* Club markers */}
        {mappableClubs.map((club) => (
          <Marker
            key={club.id}
            position={[club.location.latitude!, club.location.longitude!]}
            icon={defaultIcon}
            eventHandlers={{
              click: () => onClubSelect?.(club.id),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{club.name}</h3>
                  <span className="text-lg">{club.location.country.flag}</span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {club.location.city?.name || club.location.country.name}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {dictionary.clubTypes[club.type as keyof typeof dictionary.clubTypes]}
                  </Badge>
                  {club.isVerified && (
                    <Badge variant="success" className="text-xs">
                      {dictionary.club.verified}
                    </Badge>
                  )}
                </div>

                <Link
                  href={`/${locale}/clubs/${club.location.country.code.toLowerCase()}/${club.slug}`}
                  className="text-sm text-primary hover:underline"
                >
                  {dictionary.common.view} →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Locate me button */}
      {showUserLocation && (
        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-4 right-4 z-[1000] shadow-lg"
          onClick={handleLocate}
          disabled={isLocating}
          aria-label="Find my location"
        >
          {isLocating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Navigation className="h-5 w-5" />
          )}
        </Button>
      )}

      {/* No clubs message */}
      {mappableClubs.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-[1000]">
          <div className="text-center p-4">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">{dictionary.clubs.noResults}</p>
          </div>
        </div>
      )}
    </div>
  );
}
