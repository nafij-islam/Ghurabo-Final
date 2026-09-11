/**
 * Centralized Reusable API Client
 * Features:
 * - Bearer authorization header injection
 * - Cross-origin credentials: "include"
 * - Centralized 401 token refresh with request deduplication
 * - Automatic retry of failed requests after token refresh
 * - Standardized ApiError mapping
 */

import { API_BASE_URL, API_ENDPOINTS } from './apiConfig';
import { ApiError } from './apiError';
import { tokenStorage } from './tokenStorage';
import { AuthTokens, StandardResponse } from './api.types';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
}

// Single deduplicated promise for concurrent token refresh operations
let refreshPromise: Promise<string | null> | null = null;

async function executeTokenRefresh(): Promise<string | null> {
  const currentRefreshToken = tokenStorage.getRefreshToken();
  if (!currentRefreshToken) {
    tokenStorage.clearTokens();
    return null;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_REFRESH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    if (!res.ok) {
      tokenStorage.clearTokens();
      return null;
    }

    const json: StandardResponse<AuthTokens & { tokens?: AuthTokens }> = await res.json();
    const tokens = json.data?.tokens || json.data;
    if (json.success && tokens?.accessToken) {
      tokenStorage.setTokens({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken || currentRefreshToken,
        expiresIn: tokens.expiresIn,
      });
      return tokens.accessToken;
    }

    tokenStorage.clearTokens();
    return null;
  } catch (err) {
    tokenStorage.clearTokens();
    return null;
  } finally {
    refreshPromise = null;
  }
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, body, headers: customHeaders, skipAuth = false, ...restOptions } = options;

  // Build URL with query parameters
  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const queryString = query.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  // Build headers
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (!skipAuth) {
    const token = tokenStorage.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  if (customHeaders) {
    Object.assign(headers, customHeaders);
  }

  const reqBody: BodyInit | null | undefined = isFormData
    ? (body as FormData)
    : body !== undefined && body !== null
    ? JSON.stringify(body)
    : undefined;

  let response = await fetch(url, {
    ...restOptions,
    headers,
    credentials: 'include',
    body: reqBody,
  });

  // Handle 401 Unauthorized with token refresh and retry
  if (response.status === 401 && !skipAuth && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    if (!refreshPromise) {
      refreshPromise = executeTokenRefresh();
    }
    const freshAccessToken = await refreshPromise;

    if (freshAccessToken) {
      // Retry original request with new access token
      headers['Authorization'] = `Bearer ${freshAccessToken}`;
      response = await fetch(url, {
        ...restOptions,
        headers,
        credentials: 'include',
        body: reqBody,
      });
    }
  }

  // Parse JSON response
  let data: any = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new ApiError({
      status: response.status,
      code: data?.code || `HTTP_${response.status}`,
      message: data?.message || response.statusText || 'An API error occurred',
      errors: data?.errors,
    });
  }

  return data as T;
}

export const api = {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: 'GET' });
  },
  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: 'POST', body });
  },
  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: 'PATCH', body });
  },
  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
