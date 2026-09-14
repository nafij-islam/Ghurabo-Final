/**
 * Authentication API Service
 */

import { api } from './apiClient';
import { API_ENDPOINTS } from './apiConfig';
import { tokenStorage } from './tokenStorage';
import { BackendUser, AuthTokens, StandardResponse } from './api.types';

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface SignupPayload {
  fullName: string;
  username: string;
  email: string;
  password?: string;
  preferredCurrency?: string;
}

export interface GoogleLoginPayload {
  idToken: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface AuthSuccessData {
  user: BackendUser;
  tokens: AuthTokens;
}

export const authApi = {
  async signup(payload: SignupPayload): Promise<AuthSuccessData> {
    const res = await api.post<StandardResponse<AuthSuccessData>>(API_ENDPOINTS.AUTH_SIGNUP, payload, {
      skipAuth: true,
    });
    if (res.data?.tokens) {
      tokenStorage.setTokens(res.data.tokens);
    }
    return res.data;
  },

  async login(payload: LoginPayload): Promise<AuthSuccessData> {
    const res = await api.post<StandardResponse<AuthSuccessData>>(API_ENDPOINTS.AUTH_LOGIN, payload, {
      skipAuth: true,
    });
    if (res.data?.tokens) {
      tokenStorage.setTokens(res.data.tokens);
    }
    return res.data;
  },

  async googleLogin(payload: string | GoogleLoginPayload): Promise<AuthSuccessData> {
    const body = typeof payload === 'string' ? { idToken: payload } : payload;
    const res = await api.post<StandardResponse<AuthSuccessData>>(
      API_ENDPOINTS.AUTH_GOOGLE,
      body,
      { skipAuth: true }
    );
    if (res.data?.tokens) {
      tokenStorage.setTokens(res.data.tokens);
    }
    return res.data;
  },

  async getMe(): Promise<BackendUser | null> {
    if (!tokenStorage.hasTokens()) return null;
    try {
      const res = await api.get<StandardResponse<BackendUser>>(API_ENDPOINTS.AUTH_ME);
      return res.data;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await api.post(API_ENDPOINTS.AUTH_LOGOUT, { refreshToken });
      }
    } catch {
      // Ignore network failures on logout
    } finally {
      tokenStorage.clearTokens();
    }
  },
};
