'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface NewsletterModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: (isDismiss?: boolean) => void;
  markAsSubscribed: () => void;
}

const NewsletterModalContext = createContext<NewsletterModalContextType | undefined>(
  undefined
);

const STORAGE_KEY_SUBSCRIBED = 'ghurabo_newsletter_subscribed';
const STORAGE_KEY_DISMISSED_AT = 'ghurabo_newsletter_dismissed_at';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function NewsletterModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const markAsSubscribed = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SUBSCRIBED, 'true');
    } catch {
      // Ignore localStorage errors (e.g. private browsing quota)
    }
  }, []);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback((isDismiss = true) => {
    setIsOpen(false);
    if (isDismiss) {
      try {
        localStorage.setItem(STORAGE_KEY_DISMISSED_AT, Date.now().toString());
      } catch {
        // Ignore localStorage errors
      }
    }
  }, []);

  useEffect(() => {
    // 1. Exclude admin and auth routes from auto-showing
    if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/auth')) {
      return;
    }

    try {
      // 2. Check if user is already subscribed
      const subscribed = localStorage.getItem(STORAGE_KEY_SUBSCRIBED);
      if (subscribed === 'true') {
        return;
      }

      // 3. Check if user dismissed recently (wait 7 days)
      const dismissedAtStr = localStorage.getItem(STORAGE_KEY_DISMISSED_AT);
      if (dismissedAtStr) {
        const dismissedAt = parseInt(dismissedAtStr, 10);
        if (!isNaN(dismissedAt) && Date.now() - dismissedAt < SEVEN_DAYS_MS) {
          return;
        }
      }
    } catch {
      // In case localStorage is blocked, do nothing or proceed safely
    }

    // 4. Trigger auto-popup around 5000ms after landing
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <NewsletterModalContext.Provider
      value={{
        isOpen,
        openModal,
        closeModal,
        markAsSubscribed,
      }}
    >
      {children}
    </NewsletterModalContext.Provider>
  );
}

export function useNewsletterModal() {
  const context = useContext(NewsletterModalContext);
  if (!context) {
    throw new Error('useNewsletterModal must be used within a NewsletterModalProvider');
  }
  return context;
}
