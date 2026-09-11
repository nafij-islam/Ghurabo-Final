/**
 * Comments API Service
 */

import { api } from './apiClient';
import { API_ENDPOINTS } from './apiConfig';
import { BackendComment, StandardResponse, PaginatedResponse } from './api.types';

export const commentsApi = {
  async getTripComments(tripId: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<BackendComment>> {
    return api.get<PaginatedResponse<BackendComment>>(API_ENDPOINTS.TRIP_COMMENTS(tripId), {
      params,
      skipAuth: true,
    });
  },

  async createComment(tripId: string, content: string, parentComment?: string | null): Promise<BackendComment> {
    const res = await api.post<StandardResponse<BackendComment>>(API_ENDPOINTS.TRIP_COMMENTS(tripId), {
      content,
      parentComment: parentComment || null,
    });
    return res.data;
  },

  async updateComment(commentId: string, content: string): Promise<BackendComment> {
    const res = await api.patch<StandardResponse<BackendComment>>(API_ENDPOINTS.COMMENT_BY_ID(commentId), {
      content,
    });
    return res.data;
  },

  async deleteComment(commentId: string): Promise<void> {
    await api.delete(API_ENDPOINTS.COMMENT_BY_ID(commentId));
  },
};
