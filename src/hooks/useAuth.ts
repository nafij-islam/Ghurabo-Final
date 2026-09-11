'use client';

import { useState, useEffect, useCallback } from 'react';
import { IUser } from '@/types';
import { getCurrentUser, logoutUser, AUTH_CHANGE_EVENT } from '@/lib/clientStore';

export function useAuth() {
  const [user, setUser] = useState<IUser | null>(() => getCurrentUser());
  const [loading, setLoading] = useState<boolean>(false);

  const refresh = useCallback(() => {
    setUser(getCurrentUser());
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
  }, []);

  useEffect(() => {
    // Initial sync
    setUser(getCurrentUser());

    const handleAuthChange = () => {
      setUser(getCurrentUser());
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    };
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    loading,
    logout,
    refresh,
  };
}
