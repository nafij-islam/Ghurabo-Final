import { api } from './apiClient';
import { API_ENDPOINTS } from './apiConfig';
import {
  StandardResponse,
  PaginatedResponse,
  NewsletterSubscriber,
  NewsletterStats,
  NewsletterSubscriberStatus,
  NewsletterSource,
} from './api.types';

export const newsletterApi = {
  /**
   * Subscribe an email address to the Ghurabo newsletter (public, rate-limited)
   */
  async subscribe(
    email: string,
    source: NewsletterSource = 'HOMEPAGE_POPUP'
  ): Promise<StandardResponse<{ subscribed: boolean }>> {
    return api.post<StandardResponse<{ subscribed: boolean }>>(
      API_ENDPOINTS.NEWSLETTER_SUBSCRIBE,
      { email, source }
    );
  },

  /**
   * Unsubscribe an email address (public, rate-limited)
   */
  async unsubscribe(
    email: string
  ): Promise<StandardResponse<{ unsubscribed: boolean }>> {
    return api.post<StandardResponse<{ unsubscribed: boolean }>>(
      API_ENDPOINTS.NEWSLETTER_UNSUBSCRIBE,
      { email }
    );
  },

  /**
   * Admin: List subscribers with pagination, search, and filters
   */
  async getSubscribers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    source?: string;
    sort?: string;
  }): Promise<PaginatedResponse<NewsletterSubscriber>> {
    return api.get<PaginatedResponse<NewsletterSubscriber>>(
      API_ENDPOINTS.ADMIN_NEWSLETTER_SUBSCRIBERS,
      { params }
    );
  },

  /**
   * Admin: Get summary statistics for newsletter
   */
  async getStats(): Promise<NewsletterStats> {
    const res = await api.get<StandardResponse<NewsletterStats>>(
      API_ENDPOINTS.ADMIN_NEWSLETTER_STATS
    );
    return res.data;
  },

  /**
   * Admin: Get single subscriber detail
   */
  async getSubscriberById(id: string): Promise<NewsletterSubscriber> {
    const res = await api.get<StandardResponse<NewsletterSubscriber>>(
      API_ENDPOINTS.ADMIN_NEWSLETTER_SUBSCRIBER_BY_ID(id)
    );
    return res.data;
  },

  /**
   * Admin: Toggle or update subscriber status
   */
  async updateStatus(
    id: string,
    status: NewsletterSubscriberStatus
  ): Promise<NewsletterSubscriber> {
    const res = await api.patch<StandardResponse<NewsletterSubscriber>>(
      API_ENDPOINTS.ADMIN_NEWSLETTER_STATUS(id),
      { status }
    );
    return res.data;
  },
};
