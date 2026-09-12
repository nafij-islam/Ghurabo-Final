'use client';

import { useState, useEffect, useCallback } from 'react';
import { IUser } from '@/types';
import { authApi, LoginPayload, SignupPayload, GoogleLoginPayload } from '@/lib/api/auth.api';
import { adaptBackendUserToIUser } from '@/lib/api/adapters';
import { tokenStorage } from '@/lib/api/tokenStorage';
import { googleSignOut } from '@/lib/auth/googleAuth';

const AUTH_CHANGE_EVENT = 'ghurabo-auth-state-change';

export function notifyAuthChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

// In-memory cache to prevent hydration flicker
let cachedUser: IUser | null = null;
let sessionValidationPromise: Promise<IUser | null> | null = null;

export function useAuth() {
  const [user, setUser] = useState<IUser | null>(() => cachedUser);
  const [isLoading, setIsLoading] = useState<boolean>(() => !cachedUser && tokenStorage.hasTokens());

  const refreshAuth = useCallback(async () => {
    if (!tokenStorage.hasTokens()) {
      cachedUser = null;
      setUser(null);
      setIsLoading(false);
      return null;
    }

    try {
      const backendUser = await authApi.getMe();
      const adapted = adaptBackendUserToIUser(backendUser);
      cachedUser = adapted;
      setUser(adapted);
      return adapted;
    } catch {
      cachedUser = null;
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setIsLoading(true);
      try {
        const { user: backendUser } = await authApi.login(payload);
        const adapted = adaptBackendUserToIUser(backendUser);
        cachedUser = adapted;
        setUser(adapted);
        notifyAuthChange();
        return adapted;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signup = useCallback(
    async (payload: SignupPayload) => {
      setIsLoading(true);
      try {
        const { user: backendUser } = await authApi.signup(payload);
        const adapted = adaptBackendUserToIUser(backendUser);
        cachedUser = adapted;
        setUser(adapted);
        notifyAuthChange();
        return adapted;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const googleLogin = useCallback(
    async (payload: string | GoogleLoginPayload) => {
      setIsLoading(true);
      try {
        const { user: backendUser } = await authApi.googleLogin(payload);
        const adapted = adaptBackendUserToIUser(backendUser);
        cachedUser = adapted;
        setUser(adapted);
        notifyAuthChange();
        return adapted;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.allSettled([authApi.logout(), googleSignOut()]);
    } finally {
      cachedUser = null;
      setUser(null);
      setIsLoading(false);
      notifyAuthChange();
    }
  }, []);

  useEffect(() => {
    // Only trigger session validation once if multiple components mount useAuth
    if (tokenStorage.hasTokens()) {
      if (!sessionValidationPromise) {
        sessionValidationPromise = refreshAuth();
      }
      sessionValidationPromise.then((validatedUser) => {
        setUser(validatedUser);
        sessionValidationPromise = null;
      });
    } else {
      setIsLoading(false);
    }

    const handleAuthChange = () => {
      refreshAuth();
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    };
  }, [refreshAuth]);

  const isAdmin = user?.role === 'admin' || (user as any)?.role === 'ADMIN';

  return {
    user,
    isAuthenticated: !!user,
    isAdmin,
    loading: isLoading,
    isLoading,
    login,
    signup,
    googleLogin,
    logout,
    refresh: refreshAuth,
    refreshAuth,
  };
}
