import { cache } from 'react';
import { tripsApi } from '@/lib/api/trips.api';
import { adaptBackendTripToITrip } from '@/lib/api/adapters';
import { ITrip } from '@/types';

/**
 * Server-side deduplicated trip fetcher using React cache()
 * Ensures generateMetadata() and Page share a single network call per request.
 */
export const getCachedTripBySlug = cache(async (slug: string): Promise<ITrip | null> => {
  if (!slug) return null;
  try {
    const backendTrip = await tripsApi.getTripBySlug(slug);
    if (!backendTrip) return null;
    return adaptBackendTripToITrip(backendTrip);
  } catch (err) {
    console.error(`[Server SEO] Failed to fetch trip "${slug}":`, err);
    return null;
  }
});
