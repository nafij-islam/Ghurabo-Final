'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CurrencyCode, LanguageCode } from '@/types';
import en, { TranslationKey } from '@/locales/en';
import bn from '@/locales/bn';
import { formatCurrency, FormatCurrencyOptions, DEFAULT_BDT_PER_USD } from '@/lib/currency/formatCurrency';
import { getCurrentUser, getCurrencyRate, updateProfile } from '@/lib/clientStore';

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
    // Read stored cookies / preferences
    const savedCurrency = getCookie('ghurabo_currency') as CurrencyCode | null;
    const savedLanguage = getCookie('ghurabo_lang') as LanguageCode | null;

    if (savedCurrency && (savedCurrency === 'BDT' || savedCurrency === 'USD')) {
      setCurrencyState(savedCurrency);
    }
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'bn')) {
      setLanguageState(savedLanguage);
    }

    // Get exchange rate from clientStore
    const rate = getCurrencyRate();
    if (rate && rate > 0) {
      setExchangeRate(rate);
    }

    // Check user preference from clientStore
    const user = getCurrentUser();
    if (user) {
      if (user.preferredCurrency) {
        setCurrencyState(user.preferredCurrency as CurrencyCode);
        setCookie('ghurabo_currency', user.preferredCurrency);
      }
      if (user.preferredLanguage) {
        setLanguageState(user.preferredLanguage as LanguageCode);
        setCookie('ghurabo_lang', user.preferredLanguage);
      }
    }
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    setCookie('ghurabo_currency', c);
    // Sync with user profile if logged in
    const user = getCurrentUser();
    if (user) {
      updateProfile(user.id, { preferredCurrency: c });
    }
  };

  const setLanguage = (l: LanguageCode) => {
    setLanguageState(l);
    setCookie('ghurabo_lang', l);
    // Sync with user profile if logged in
    const user = getCurrentUser();
    if (user) {
      updateProfile(user.id, { preferredLanguage: l });
    }
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
