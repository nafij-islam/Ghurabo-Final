/**
 * Media & Cloudinary API Service
 */

import { api } from './apiClient';
import { API_ENDPOINTS } from './apiConfig';
import {
  BackendMediaSignature,
  BackendMediaAsset,
  StandardResponse,
} from './api.types';

export const mediaApi = {
  async getSignature(folder = 'ghurabo/trips', tags?: string): Promise<BackendMediaSignature> {
    const res = await api.post<StandardResponse<BackendMediaSignature>>(API_ENDPOINTS.MEDIA_SIGNATURE, {
      folder,
      tags,
    });
    return res.data;
  },

  async uploadMedia(file: File, folder = 'ghurabo/trips', caption?: string): Promise<BackendMediaAsset> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    if (caption) {
      formData.append('caption', caption);
    }

    const res = await api.post<StandardResponse<BackendMediaAsset>>(API_ENDPOINTS.MEDIA_UPLOAD, formData);
    return res.data;
  },

  async deleteMedia(id: string): Promise<void> {
    await api.delete(API_ENDPOINTS.MEDIA_BY_ID(id));
  },
};
