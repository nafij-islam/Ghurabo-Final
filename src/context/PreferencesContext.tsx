'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CurrencyCode, LanguageCode } from '@/types';
import en, { TranslationKey } from '@/locales/en';
import bn from '@/locales/bn';
import { formatCurrency, FormatCurrencyOptions, DEFAULT_BDT_PER_USD } from '@/lib/currency/formatCurrency';

interface PreferencesContextType {
  currency: CurrencyCode;
  language: LanguageCode;
  exchangeRate: number;
  setCurrency: (c: CurrencyCode) => void;
  setLanguage: (l: LanguageCode) => void;
  t: (key: TranslationKey, fallback?: string) => string;
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
  document.cookie = `${name}=${value};path=/;expires=${d.toUTCString()}`;
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('BDT');
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_BDT_PER_USD);

  useEffect(() => {
    // Read stored cookies
    const savedCurrency = getCookie('ghurabo_currency') as CurrencyCode | null;
    const savedLanguage = getCookie('ghurabo_lang') as LanguageCode | null;

    if (savedCurrency && (savedCurrency === 'BDT' || savedCurrency === 'USD')) {
      setCurrencyState(savedCurrency);
    }
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'bn')) {
      setLanguageState(savedLanguage);
    }

    // Fetch exchange rate from API
    fetch('/api/currency/rate')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && typeof data.rate === 'number' && data.rate > 0) {
          setExchangeRate(data.rate);
        }
      })
      .catch(() => {});

    // Check user preference from /api/auth/me
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          if (data.user.preferredCurrency) {
            setCurrencyState(data.user.preferredCurrency);
            setCookie('ghurabo_currency', data.user.preferredCurrency);
          }
          if (data.user.preferredLanguage) {
            setLanguageState(data.user.preferredLanguage);
            setCookie('ghurabo_lang', data.user.preferredLanguage);
          }
        }
      })
      .catch(() => {});
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    setCookie('ghurabo_currency', c);
    // Sync with user profile if logged in
    fetch('/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferredCurrency: c }),
    }).catch(() => {});
  };

  const setLanguage = (l: LanguageCode) => {
    setLanguageState(l);
    setCookie('ghurabo_lang', l);
    // Sync with user profile if logged in
    fetch('/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferredLanguage: l }),
    }).catch(() => {});
  };

  const t = (key: TranslationKey, fallback?: string): string => {
    const dictionary = language === 'bn' ? bn : en;
    return dictionary[key] || fallback || en[key] || String(key);
  };

  const formatCost = (amountBDT: number, options?: Partial<FormatCurrencyOptions>): string => {
    return formatCurrency({
      amountBDT,
      currency,
      exchangeRate,
      locale: language,
      ...options,
    });
  };

  return (
    <PreferencesContext.Provider
      value={{
        currency,
        language,
        exchangeRate,
        setCurrency,
        setLanguage,
        t,
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
