/**
 * Trips and Social Interactions API Service
 */

import { api } from './apiClient';
import { API_ENDPOINTS } from './apiConfig';
import {
  BackendTrip,
  BackendInteractionToggleResult,
  StandardResponse,
  PaginatedResponse,
} from './api.types';

export interface TripFilterParams {
  search?: string;
  travelType?: string;
  destination?: string;
  maxBudget?: number;
  featured?: boolean;
  author?: string;
  sort?: 'newest' | 'popular' | 'lowest-cost' | 'highest-cost';
  page?: number;
  limit?: number;
}

export interface CreateTripPayload {
  title: string;
  destination: string | { name: string; city?: string; country?: string; latitude?: number; longitude?: number };
  summary: string;
  story: string;
  travelType: 'SOLO' | 'COUPLE' | 'FAMILY' | 'GROUP';
  days: number;
  nights: number;
  costs: {
    transport: number;
    lodging: number;
    food: number;
    sightseeing: number;
    activities: number;
    miscellaneous: number;
  };
  itinerary: Array<{
    day: number;
    title: string;
    description: string;
    locations?: Array<{
      name: string;
      latitude?: number;
      longitude?: number;
    }>;
  }>;
  coverImage?: {
    url: string;
    publicId?: string;
    caption?: string;
  };
  photos?: Array<{
    url: string;
    publicId?: string;
    caption?: string;
  }>;
}

export const tripsApi = {
  async getTrips(params?: TripFilterParams, signal?: AbortSignal): Promise<PaginatedResponse<BackendTrip>> {
    return api.get<PaginatedResponse<BackendTrip>>(API_ENDPOINTS.TRIPS, {
      params: params as Record<string, string | number | boolean>,
      skipAuth: true,
      signal,
    });
  },

  async getTripBySlug(slug: string): Promise<BackendTrip> {
    const res = await api.get<StandardResponse<BackendTrip>>(API_ENDPOINTS.TRIP_BY_SLUG(slug));
    return res.data;
  },

  async createTrip(payload: CreateTripPayload): Promise<BackendTrip> {
    const res = await api.post<StandardResponse<BackendTrip>>(API_ENDPOINTS.TRIPS, payload);
    return res.data;
  },

  async updateTrip(id: string, payload: Partial<CreateTripPayload>): Promise<BackendTrip> {
    const res = await api.patch<StandardResponse<BackendTrip>>(API_ENDPOINTS.TRIP_BY_ID(id), payload);
    return res.data;
  },

  async deleteTrip(id: string): Promise<void> {
    await api.delete(API_ENDPOINTS.TRIP_BY_ID(id));
  },

  async toggleLike(id: string): Promise<BackendInteractionToggleResult> {
    const res = await api.post<StandardResponse<BackendInteractionToggleResult>>(
      API_ENDPOINTS.TRIP_LIKE(id)
    );
    return res.data;
  },

  async toggleSave(id: string): Promise<BackendInteractionToggleResult> {
    const res = await api.post<StandardResponse<BackendInteractionToggleResult>>(
      API_ENDPOINTS.TRIP_SAVE(id)
    );
    return res.data;
  },

  async toggleHelpful(id: string): Promise<BackendInteractionToggleResult> {
    const res = await api.post<StandardResponse<BackendInteractionToggleResult>>(
      API_ENDPOINTS.TRIP_HELPFUL(id)
    );
    return res.data;
  },
};
