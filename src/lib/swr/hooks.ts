'use client';

/**
 * Central SWR Data-Fetching & Caching Hooks
 * Provides instant back-navigation caching, background revalidation, and zero layout shift
 */

import useSWR, { SWRConfiguration } from 'swr';
import {
  tripsApi,
  TripFilterParams,
  galleryApi,
  GalleryFilterParams,
  usersApi,
  adaptBackendTripToITrip,
  adaptBackendGalleryToIGalleryItem,
  PaginationMeta,
} from '../api';

const DEFAULT_SWR_OPTIONS: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateIfStale: false,
  dedupingInterval: 60000, // Cache for 60s
  shouldRetryOnError: true,
  errorRetryCount: 3,
};

/**
 * Hook to fetch and cache trips directory with filter parameters
 */
export function useTrips(
  params?: TripFilterParams,
  options?: SWRConfiguration
) {
  const key = ['/trips', JSON.stringify(params || {})];

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    async () => {
      const res = await tripsApi.getTrips(params);
      return {
        trips: (res.data || []).map(adaptBackendTripToITrip),
        pagination: res.meta,
      };
    },
    { ...DEFAULT_SWR_OPTIONS, ...options }
  );

  return {
    trips: data?.trips || [],
    pagination: data?.pagination,
    isLoading: isLoading && !data,
    isValidating,
    error,
    mutate,
  };
}

/**
 * Hook to fetch and cache a single trip itinerary by slug
 */
export function useTrip(slug: string | null, options?: SWRConfiguration) {
  const key = slug ? ['/trip', slug] : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    async () => {
      if (!slug) return null;
      const res = await tripsApi.getTripBySlug(slug);
      return adaptBackendTripToITrip(res);
    },
    { ...DEFAULT_SWR_OPTIONS, ...options }
  );

  return {
    trip: data || null,
    isLoading: isLoading && !data,
    isValidating,
    error,
    mutate,
  };
}

/**
 * Hook to fetch and cache community gallery items
 */
export function useGallery(
  params?: GalleryFilterParams,
  options?: SWRConfiguration
) {
  const key = ['/gallery', JSON.stringify(params || {})];

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    async () => {
      const res = await galleryApi.getGallery(params);
      return {
        items: (res.data || []).map(adaptBackendGalleryToIGalleryItem),
        pagination: res.meta,
      };
    },
    { ...DEFAULT_SWR_OPTIONS, ...options }
  );

  return {
    items: data?.items || [],
    pagination: data?.pagination,
    isLoading: isLoading && !data,
    isValidating,
    error,
    mutate,
  };
}

/**
 * Hook to fetch and cache authenticated user's authored trips
 */
export function useUserTrips(options?: SWRConfiguration) {
  const key = '/users/me/trips';

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    async () => {
      const res = await usersApi.getMyTrips();
      return res.data.map(adaptBackendTripToITrip);
    },
    { ...DEFAULT_SWR_OPTIONS, ...options }
  );

  return {
    trips: data || [],
    isLoading: isLoading && !data,
    isValidating,
    error,
    mutate,
  };
}

/**
 * Hook to fetch and cache authenticated user's saved trips
 */
export function useSavedTrips(options?: SWRConfiguration) {
  const key = '/users/me/saved-trips';

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    async () => {
      const res = await usersApi.getMySavedTrips();
      return res.data.map(adaptBackendTripToITrip);
    },
    { ...DEFAULT_SWR_OPTIONS, ...options }
  );

  return {
    trips: data || [],
    isLoading: isLoading && !data,
    isValidating,
    error,
    mutate,
  };
}
