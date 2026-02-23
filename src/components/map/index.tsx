'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamic import of the map component to avoid SSR issues with Leaflet
export const ClubMap = dynamic(
  () => import('./club-map').then((mod) => mod.ClubMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full rounded-lg bg-muted flex items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    ),
  }
);
