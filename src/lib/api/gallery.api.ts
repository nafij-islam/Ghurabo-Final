/**
 * Public Gallery API Service
 */

import { api } from './apiClient';
import { API_ENDPOINTS } from './apiConfig';
import { BackendGalleryItem, PaginatedResponse } from './api.types';

export interface GalleryFilterParams {
  travelType?: string;
  destination?: string;
  photographer?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const galleryApi = {
  async getGallery(params?: GalleryFilterParams, signal?: AbortSignal): Promise<PaginatedResponse<BackendGalleryItem>> {
    return api.get<PaginatedResponse<BackendGalleryItem>>(API_ENDPOINTS.GALLERY, {
      params: params as Record<string, string | number | boolean>,
      skipAuth: true,
      signal,
    });
  },
};
