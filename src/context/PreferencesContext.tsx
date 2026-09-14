'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CurrencyCode } from '@/types';
import { formatCurrency, FormatCurrencyOptions, DEFAULT_BDT_PER_USD } from '@/lib/currency/formatCurrency';
import { settingsApi } from '@/lib/api/settings.api';
import { usersApi } from '@/lib/api/users.api';
import { authApi } from '@/lib/api/auth.api';
import { tokenStorage } from '@/lib/api/tokenStorage';
import { notifyAuthChange } from '@/hooks/useAuth';

interface PreferencesContextType {
  currency: CurrencyCode;
  exchangeRate: number;
  setCurrency: (c: CurrencyCode) => Promise<void>;
  formatCost: (amountBDT: number, options?: Partial<FormatCurrencyOptions>) => string;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};path=/;expires=${d.toUTCString()};SameSite=Lax`;
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('BDT');
  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_BDT_PER_USD);

  const syncUserCurrency = useCallback(async () => {
    if (tokenStorage.hasTokens()) {
      try {
        const backendUser = await authApi.getMe();
        if (backendUser?.preferredCurrency) {
          const pref = backendUser.preferredCurrency === 'USD' ? 'USD' : 'BDT';
          setCurrencyState(pref);
          setCookie('ghurabo_currency', pref);
          return;
        }
      } catch {
        // Fallback on cookie or BDT if getMe fails
      }
    } else {
      // Logged out visitors strictly default to BDT
      setCurrencyState('BDT');
      setCookie('ghurabo_currency', 'BDT');
      return;
    }

    const savedCurrency = getCookie('ghurabo_currency') as CurrencyCode | null;
    if (savedCurrency === 'BDT' || savedCurrency === 'USD') {
      setCurrencyState(savedCurrency);
    } else {
      setCurrencyState('BDT');
    }
  }, []);

  useEffect(() => {
    // Initial sync
    syncUserCurrency();

    // Fetch dynamic exchange rate from backend settings
    settingsApi
      .getSettingByKey('USD_TO_BDT_RATE')
      .then((setting) => {
        if (setting && setting.value) {
          const rate = Number(setting.value);
          if (rate > 0) {
            setExchangeRate(rate);
          }
        }
      })
      .catch((err) => {
        console.warn('Could not fetch USD_TO_BDT_RATE from backend, using default:', err);
      });

    // Listen to login/logout/profile changes
    const handleAuthChange = () => {
      syncUserCurrency();
    };

    window.addEventListener('ghurabo-auth-state-change', handleAuthChange);
    return () => window.removeEventListener('ghurabo-auth-state-change', handleAuthChange);
  }, [syncUserCurrency]);

  const setCurrency = async (c: CurrencyCode) => {
    setCurrencyState(c);
    setCookie('ghurabo_currency', c);
    // Persist to backend if logged in
    if (tokenStorage.hasTokens()) {
      try {
        await usersApi.updateMe({ preferredCurrency: c });
        notifyAuthChange();
      } catch (err) {
        console.error('Failed to save preferredCurrency to backend:', err);
        throw err;
      }
    }
  };

  const formatCost = (amountBDT: number, options?: Partial<FormatCurrencyOptions>): string => {
    return formatCurrency({
      amountBDT,
      currency,
      exchangeRate,
      ...options,
    });
  };

  return (
    <PreferencesContext.Provider
      value={{
        currency,
        exchangeRate,
        setCurrency,
        formatCost,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
