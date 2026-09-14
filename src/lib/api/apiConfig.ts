/**
 * Central API Configuration for Ghurabo (ঘুড়াবো)
 * Resolves base URL from NEXT_PUBLIC_API_URL or defaults to the deployed backend.
 */

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'https://ghurabo-final-backend.vercel.app'
).replace(/\/+$/, '');

export const API_V1_PREFIX = '/api/v1';

export const API_ENDPOINTS = {
  // System
  HEALTH: '/health',
  READY: '/ready',
  DOCS: '/docs',

  // Authentication
  AUTH_SIGNUP: `${API_V1_PREFIX}/auth/signup`,
  AUTH_LOGIN: `${API_V1_PREFIX}/auth/login`,
  AUTH_GOOGLE: `${API_V1_PREFIX}/auth/google`,
  AUTH_REFRESH: `${API_V1_PREFIX}/auth/refresh`,
  AUTH_LOGOUT: `${API_V1_PREFIX}/auth/logout`,
  AUTH_ME: `${API_V1_PREFIX}/auth/me`,

  // Users
  USERS_ME: `${API_V1_PREFIX}/users/me`,
  USERS_ME_TRIPS: `${API_V1_PREFIX}/users/me/trips`,
  USERS_ME_SAVED_TRIPS: `${API_V1_PREFIX}/users/me/saved-trips`,
  USERS_PROFILE: (username: string) => `${API_V1_PREFIX}/users/${encodeURIComponent(username)}`,
  USERS_FOLLOW: (username: string) => `${API_V1_PREFIX}/users/${encodeURIComponent(username)}/follow`,
  USERS_FOLLOWERS: (username: string) => `${API_V1_PREFIX}/users/${encodeURIComponent(username)}/followers`,
  USERS_FOLLOWING: (username: string) => `${API_V1_PREFIX}/users/${encodeURIComponent(username)}/following`,

  // Trips
  TRIPS: `${API_V1_PREFIX}/trips`,
  TRIP_BY_SLUG: (slug: string) => `${API_V1_PREFIX}/trips/${encodeURIComponent(slug)}`,
  TRIP_BY_ID: (id: string) => `${API_V1_PREFIX}/trips/${encodeURIComponent(id)}`,
  TRIP_LIKE: (id: string) => `${API_V1_PREFIX}/trips/${encodeURIComponent(id)}/like`,
  TRIP_SAVE: (id: string) => `${API_V1_PREFIX}/trips/${encodeURIComponent(id)}/save`,
  TRIP_HELPFUL: (id: string) => `${API_V1_PREFIX}/trips/${encodeURIComponent(id)}/helpful`,
  TRIP_COMMENTS: (id: string) => `${API_V1_PREFIX}/trips/${encodeURIComponent(id)}/comments`,

  // Comments
  COMMENT_BY_ID: (id: string) => `${API_V1_PREFIX}/comments/${encodeURIComponent(id)}`,

  // Gallery
  GALLERY: `${API_V1_PREFIX}/gallery`,

  // Media
  MEDIA_SIGNATURE: `${API_V1_PREFIX}/media/signature`,
  MEDIA_UPLOAD: `${API_V1_PREFIX}/media/upload`,
  MEDIA_BY_ID: (id: string) => `${API_V1_PREFIX}/media/${encodeURIComponent(id)}`,

  // Settings
  SETTINGS: `${API_V1_PREFIX}/settings`,
  SETTING_BY_KEY: (key: string) => `${API_V1_PREFIX}/settings/${encodeURIComponent(key)}`,

  // Admin
  ADMIN_TRIPS: `${API_V1_PREFIX}/admin/trips`,
  ADMIN_TRIP_STATS: `${API_V1_PREFIX}/admin/trips/stats`,
  ADMIN_PENDING_TRIPS: `${API_V1_PREFIX}/admin/trips/pending`,
  ADMIN_TRIP_STATUS: (id: string) => `${API_V1_PREFIX}/admin/trips/${encodeURIComponent(id)}/status`,
  ADMIN_TRIP_SUSPEND: (id: string) => `${API_V1_PREFIX}/admin/trips/${encodeURIComponent(id)}/suspend`,
  ADMIN_TRIP_VERIFIED: (id: string) => `${API_V1_PREFIX}/admin/trips/${encodeURIComponent(id)}/verified`,
  ADMIN_TRIP_FEATURED: (id: string) => `${API_V1_PREFIX}/admin/trips/${encodeURIComponent(id)}/featured`,
  ADMIN_TRIP_DELETE: (id: string) => `${API_V1_PREFIX}/admin/trips/${encodeURIComponent(id)}`,
  ADMIN_SETTINGS_CURRENCY: `${API_V1_PREFIX}/admin/settings/currency`,
  ADMIN_USERS: `${API_V1_PREFIX}/admin/users`,
  ADMIN_USER_BY_ID: (id: string) => `${API_V1_PREFIX}/admin/users/${encodeURIComponent(id)}`,

  // Newsletter
  NEWSLETTER_SUBSCRIBE: `${API_V1_PREFIX}/newsletter/subscribe`,
  NEWSLETTER_UNSUBSCRIBE: `${API_V1_PREFIX}/newsletter/unsubscribe`,
  ADMIN_NEWSLETTER_SUBSCRIBERS: `${API_V1_PREFIX}/admin/newsletter/subscribers`,
  ADMIN_NEWSLETTER_STATS: `${API_V1_PREFIX}/admin/newsletter/stats`,
  ADMIN_NEWSLETTER_SUBSCRIBER_BY_ID: (id: string) =>
    `${API_V1_PREFIX}/admin/newsletter/subscribers/${encodeURIComponent(id)}`,
  ADMIN_NEWSLETTER_STATUS: (id: string) =>
    `${API_V1_PREFIX}/admin/newsletter/subscribers/${encodeURIComponent(id)}/status`,

  // Contact Messages
  CONTACT_SUBMIT: `${API_V1_PREFIX}/contact`,
  ADMIN_CONTACT_MESSAGES: `${API_V1_PREFIX}/admin/contact-messages`,
  ADMIN_CONTACT_MESSAGES_STATS: `${API_V1_PREFIX}/admin/contact-messages/stats`,
  ADMIN_CONTACT_MESSAGE_BY_ID: (id: string) =>
    `${API_V1_PREFIX}/admin/contact-messages/${encodeURIComponent(id)}`,
  ADMIN_CONTACT_MESSAGE_READ: (id: string) =>
    `${API_V1_PREFIX}/admin/contact-messages/${encodeURIComponent(id)}/read`,
  ADMIN_CONTACT_MESSAGE_DELETE: (id: string) =>
    `${API_V1_PREFIX}/admin/contact-messages/${encodeURIComponent(id)}`,
} as const;


