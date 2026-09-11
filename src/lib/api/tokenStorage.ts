/**
 * Client-Side Token Storage & Session Manager
 */

import { AuthTokens } from './api.types';

const ACCESS_TOKEN_KEY = 'ghurabo_access_token';
const REFRESH_TOKEN_KEY = 'ghurabo_refresh_token';
const AUTH_STATE_EVENT = 'ghurabo-auth-state-change';

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function setCookie(name: string, value: string, days = 30) {
  if (!isClient()) return;
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;expires=${d.toUTCString()};SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (!isClient()) return;
  document.cookie = `${name}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (!isClient()) return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export const tokenStorage = {
  getAccessToken(): string | null {
    if (!isClient()) return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY) || getCookie(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    if (!isClient()) return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY) || getCookie(REFRESH_TOKEN_KEY);
  },

  setTokens(tokens: AuthTokens): void {
    if (!isClient()) return;
    if (tokens.accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
      setCookie(ACCESS_TOKEN_KEY, tokens.accessToken, 1); // 1 day fallback
    }
    if (tokens.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      setCookie(REFRESH_TOKEN_KEY, tokens.refreshToken, 30); // 30 days
    }
    window.dispatchEvent(new Event(AUTH_STATE_EVENT));
  },

  clearTokens(): void {
    if (!isClient()) return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    deleteCookie(ACCESS_TOKEN_KEY);
    deleteCookie(REFRESH_TOKEN_KEY);
    window.dispatchEvent(new Event(AUTH_STATE_EVENT));
  },

  hasTokens(): boolean {
    return !!this.getAccessToken() || !!this.getRefreshToken();
  },
};
