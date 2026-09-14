/**
 * Admin Moderation & Management API Service
 */

import { api } from './apiClient';
import { API_ENDPOINTS } from './apiConfig';
import {
  BackendTrip,
  PaginatedResponse,
  StandardResponse,
  TripStats,
  AdminTripsResponse,
  AdminUserItem,
} from './api.types';

export const adminApi = {
  async getAllTrips(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sort?: string;
  }): Promise<AdminTripsResponse> {
    return api.get<AdminTripsResponse>(API_ENDPOINTS.ADMIN_TRIPS, { params });
  },

  async getTripStats(): Promise<TripStats> {
    const res = await api.get<StandardResponse<TripStats>>(API_ENDPOINTS.ADMIN_TRIP_STATS);
    return res.data;
  },

  async toggleTripSuspend(id: string, isSuspended: boolean, reason?: string): Promise<BackendTrip> {
    const res = await api.patch<StandardResponse<BackendTrip>>(API_ENDPOINTS.ADMIN_TRIP_SUSPEND(id), {
      isSuspended,
      reason,
    });
    return res.data;
  },

  async getPendingTrips(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<BackendTrip>> {
    return api.get<PaginatedResponse<BackendTrip>>(API_ENDPOINTS.ADMIN_PENDING_TRIPS, { params });
  },

  async updateTripStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'PENDING',
    moderationReason?: string
  ): Promise<BackendTrip> {
    const res = await api.patch<StandardResponse<BackendTrip>>(API_ENDPOINTS.ADMIN_TRIP_STATUS(id), {
      status,
      moderationReason:
        moderationReason ||
        (status === 'APPROVED' ? 'Meets community quality guidelines' : 'Status updated by administrator'),
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

  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    sort?: string;
  }): Promise<PaginatedResponse<AdminUserItem>> {
    return api.get<PaginatedResponse<AdminUserItem>>(API_ENDPOINTS.ADMIN_USERS, { params });
  },

  async getUserById(id: string): Promise<AdminUserItem> {
    const res = await api.get<StandardResponse<AdminUserItem>>(API_ENDPOINTS.ADMIN_USER_BY_ID(id));
    return res.data;
  },
};

