import { api } from './apiClient';
import { API_ENDPOINTS } from './apiConfig';
import {
  StandardResponse,
  PaginatedResponse,
  ContactMessage,
  ContactMessageInput,
  ContactMessageStatus,
  ContactMessageStats,
} from './api.types';

export const contactApi = {
  /**
   * Submit a contact message (public, rate-limited)
   */
  async submitMessage(
    data: ContactMessageInput
  ): Promise<StandardResponse<{ id: string; name: string; email: string; subject: string }>> {
    return api.post<StandardResponse<{ id: string; name: string; email: string; subject: string }>>(
      API_ENDPOINTS.CONTACT_SUBMIT,
      data,
      { skipAuth: true }
    );
  },

  /**
   * Admin: List contact messages with pagination, search, and status filtering
   */
  async getMessages(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sort?: string;
  }): Promise<PaginatedResponse<ContactMessage>> {
    return api.get<PaginatedResponse<ContactMessage>>(
      API_ENDPOINTS.ADMIN_CONTACT_MESSAGES,
      { params }
    );
  },

  /**
   * Admin: Get summary statistics for contact messages
   */
  async getStats(): Promise<ContactMessageStats> {
    const res = await api.get<StandardResponse<ContactMessageStats>>(
      API_ENDPOINTS.ADMIN_CONTACT_MESSAGES_STATS
    );
    return res.data;
  },

  /**
   * Admin: Get single contact message detail
   */
  async getMessageById(id: string): Promise<ContactMessage> {
    const res = await api.get<StandardResponse<ContactMessage>>(
      API_ENDPOINTS.ADMIN_CONTACT_MESSAGE_BY_ID(id)
    );
    return res.data;
  },

  /**
   * Admin: Mark message as READ or UNREAD
   */
  async updateReadStatus(
    id: string,
    status: ContactMessageStatus
  ): Promise<ContactMessage> {
    const res = await api.patch<StandardResponse<ContactMessage>>(
      API_ENDPOINTS.ADMIN_CONTACT_MESSAGE_READ(id),
      { status }
    );
    return res.data;
  },

  /**
   * Admin: Delete contact message
   */
  async deleteMessage(id: string): Promise<{ deleted: boolean }> {
    const res = await api.delete<StandardResponse<{ deleted: boolean }>>(
      API_ENDPOINTS.ADMIN_CONTACT_MESSAGE_DELETE(id)
    );
    return res.data;
  },
};
