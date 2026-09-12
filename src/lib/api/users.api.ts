/**
 * Users and Profile API Service
 */

import { api } from './apiClient';
import { API_ENDPOINTS } from './apiConfig';
import {
  BackendUser,
  BackendUserPublicProfile,
  BackendTrip,
  FollowToggleResult,
  FollowUserItem,
  StandardResponse,
  PaginatedResponse,
} from './api.types';

export interface UpdateProfilePayload {
  fullName?: string;
  bio?: string;
  location?: string;
  travelStyle?: string;
  preferredCurrency?: string;
  preferredLanguage?: string;
  avatar?: {
    url: string;
    publicId?: string;
  };
  coverImage?: {
    url: string;
    publicId?: string;
  };
}

export const usersApi = {
  async updateMe(data: UpdateProfilePayload): Promise<BackendUser> {
    const res = await api.patch<StandardResponse<BackendUser>>(API_ENDPOINTS.USERS_ME, data);
    return res.data;
  },

  async getMyTrips(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<BackendTrip>> {
    return api.get<PaginatedResponse<BackendTrip>>(API_ENDPOINTS.USERS_ME_TRIPS, { params });
  },

  async getMySavedTrips(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<BackendTrip>> {
    return api.get<PaginatedResponse<BackendTrip>>(API_ENDPOINTS.USERS_ME_SAVED_TRIPS, { params });
  },

  async getPublicProfile(username: string): Promise<BackendUserPublicProfile> {
    const res = await api.get<StandardResponse<BackendUserPublicProfile>>(
      API_ENDPOINTS.USERS_PROFILE(username)
    );
    return res.data;
  },

  async toggleFollow(username: string): Promise<FollowToggleResult> {
    const res = await api.post<StandardResponse<FollowToggleResult>>(
      API_ENDPOINTS.USERS_FOLLOW(username)
    );
    return res.data;
  },

  async getFollowers(
    username: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<FollowUserItem>> {
    return api.get<PaginatedResponse<FollowUserItem>>(
      API_ENDPOINTS.USERS_FOLLOWERS(username),
      { params }
    );
  },

  async getFollowing(
    username: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<FollowUserItem>> {
    return api.get<PaginatedResponse<FollowUserItem>>(
      API_ENDPOINTS.USERS_FOLLOWING(username),
      { params }
    );
  },
};
