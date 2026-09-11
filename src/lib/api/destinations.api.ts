/**
 * Destinations API Service
 */

import { api } from './apiClient';
import { API_ENDPOINTS } from './apiConfig';
import { BackendDestination, StandardResponse, PaginatedResponse } from './api.types';

export interface DestinationFilterParams {
  search?: string;
  category?: string;
  country?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export const destinationsApi = {
  async getDestinations(params?: DestinationFilterParams, signal?: AbortSignal): Promise<PaginatedResponse<BackendDestination>> {
    return api.get<PaginatedResponse<BackendDestination>>(API_ENDPOINTS.DESTINATIONS, {
      params: params as Record<string, string | number | boolean>,
      skipAuth: true,
      signal,
    });
  },

  async getDestinationBySlug(slug: string): Promise<BackendDestination> {
    const res = await api.get<StandardResponse<BackendDestination>>(
      API_ENDPOINTS.DESTINATION_BY_SLUG(slug),
      { skipAuth: true }
    );
    return res.data;
  },
};
