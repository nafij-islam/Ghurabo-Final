/**
 * Admin Moderation & Management API Service
 */

import { api } from './apiClient';
import { API_ENDPOINTS } from './apiConfig';
import {
  BackendTrip,
  BackendDestination,
  PaginatedResponse,
  StandardResponse,
} from './api.types';

export const adminApi = {
  async getPendingTrips(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<BackendTrip>> {
    return api.get<PaginatedResponse<BackendTrip>>(API_ENDPOINTS.ADMIN_PENDING_TRIPS, { params });
  },

  async updateTripStatus(id: string, status: 'APPROVED' | 'REJECTED', moderationReason?: string): Promise<BackendTrip> {
    const res = await api.patch<StandardResponse<BackendTrip>>(API_ENDPOINTS.ADMIN_TRIP_STATUS(id), {
      status,
      moderationReason: moderationReason || (status === 'APPROVED' ? 'Meets community quality guidelines' : 'Does not meet guidelines'),
    });
    return res.data;
  },

  async toggleTripVerified(id: string, isVerified: boolean): Promise<BackendTrip> {
    const res = await api.patch<StandardResponse<BackendTrip>>(API_ENDPOINTS.ADMIN_TRIP_VERIFIED(id), {
      isVerified,
    });
    return res.data;
  },

  async toggleTripFeatured(id: string, isFeatured: boolean): Promise<BackendTrip> {
    const res = await api.patch<StandardResponse<BackendTrip>>(API_ENDPOINTS.ADMIN_TRIP_FEATURED(id), {
      isFeatured,
    });
    return res.data;
  },

  async deleteTrip(id: string): Promise<void> {
    await api.delete(API_ENDPOINTS.ADMIN_TRIP_DELETE(id));
  },

  async createDestination(data: Partial<BackendDestination>): Promise<BackendDestination> {
    const res = await api.post<StandardResponse<BackendDestination>>(API_ENDPOINTS.ADMIN_DESTINATIONS, data);
    return res.data;
  },

  async updateDestination(id: string, data: Partial<BackendDestination>): Promise<BackendDestination> {
    const res = await api.patch<StandardResponse<BackendDestination>>(
      API_ENDPOINTS.ADMIN_DESTINATION_BY_ID(id),
      data
    );
    return res.data;
  },

  async deleteDestination(id: string): Promise<void> {
    await api.delete(API_ENDPOINTS.ADMIN_DESTINATION_BY_ID(id));
  },

  async toggleDestinationFeatured(id: string, isFeatured: boolean): Promise<BackendDestination> {
    const res = await api.patch<StandardResponse<BackendDestination>>(
      API_ENDPOINTS.ADMIN_DESTINATION_FEATURED(id),
      { isFeatured }
    );
    return res.data;
  },
};
