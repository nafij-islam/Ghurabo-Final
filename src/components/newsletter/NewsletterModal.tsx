'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mail,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Compass,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useNewsletterModal } from '@/context/NewsletterModalContext';
import { useAuth } from '@/hooks/useAuth';
import { newsletterApi } from '@/lib/api/newsletter.api';
import { usePathname } from 'next/navigation';

export default function NewsletterModal() {
  const pathname = usePathname();
  const { isOpen, closeModal, markAsSubscribed } = useNewsletterModal();
  const { user } = useAuth();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [successStatus, setSuccessStatus] = useState<'idle' | 'success' | 'alreadySubscribed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (isOpen) {
      if (user?.email && !email) {
        setEmail(user.email);
      }
      setValidationError('');
      setErrorMessage('');
      setSuccessStatus('idle');

      // Focus input after modal mounts
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, user]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal(true);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setValidationError('Please enter your email address.');
      return false;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(trimmed)) {
      setValidationError('Please enter a valid email address.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await newsletterApi.subscribe(email.trim(), 'HOMEPAGE_POPUP');
      markAsSubscribed();

      if (res?.message && res.message.toLowerCase().includes('already')) {
        setSuccessStatus('alreadySubscribed');
      } else {
        setSuccessStatus('success');
      }

      // Auto-close after 2.5 seconds
      setTimeout(() => {
        closeModal(false);
      }, 2500);
    } catch (err: any) {
      console.error('Newsletter subscribe failed:', err);
      const backendMsg = err?.response?.data?.message || err?.message;
      if (backendMsg && backendMsg.toLowerCase().includes('already')) {
        markAsSubscribed();
        setSuccessStatus('alreadySubscribed');
        setTimeout(() => closeModal(false), 2500);
      } else {
        setErrorMessage(
          err?.response?.data?.errors?.[0]?.message ||
          backendMsg ||
          "Couldn't subscribe right now. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-modal-title"
    >
      {/* Translucent Backdrop with Blur */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={() => closeModal(true)}
      />

      {/* Modal Dialog Card */}
      <div
        ref={modalRef}
        className="relative w-[calc(100vw-24px)] sm:w-[calc(100vw-32px)] max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-y-auto border border-slate-200/90 flex flex-col md:flex-row z-10 animate-scaleUp scrollbar-thin"
      >
        {/* Sticky/Fixed Close Button */}
        <button
          onClick={() => closeModal(true)}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          aria-label="Close newsletter popup"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Left Column: Visual Aesthetic Side (Full on Desktop, Compact on Small Mobile) */}
        <div className="relative md:w-5/12 bg-gradient-to-br from-darkslate-950 via-darkslate-900 to-brand-950 text-white p-5 sm:p-6 md:p-8 flex flex-col justify-between overflow-hidden shrink-0">
          {/* Decorative Travel Background Blur & Pattern */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-brand-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-full opacity-15 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Top Brand Tag */}
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border border-brand-500/30">
              <Compass className="w-3.5 h-3.5" />
              <span>GHURABO INSIDER</span>
            </div>
          </div>

          {/* Center Visual Content */}
          <div className="relative z-10 my-3 sm:my-6 md:my-0 space-y-2 sm:space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-500/10 border border-brand-400/30 flex items-center justify-center text-brand-300 shadow-inner">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-display text-lg sm:text-2xl font-bold uppercase tracking-wide text-white leading-tight">
              Real Trips.<br />Real Costs.<br />Zero Fluff.
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-300 font-light leading-relaxed hidden sm:block">
              Join 10,000+ travelers discovering Bangladesh's hidden trails, transparent budgets, and local stories.
            </p>
          </div>

          {/* Bottom Trust Badge */}
          <div className="relative z-10 pt-3 md:pt-4 border-t border-white/10 flex items-center space-x-2 text-[10px] sm:text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
            <span>100% Community-Verified Guides</span>
          </div>
        </div>

        {/* Right Column: Interactive Form & Feedback Area */}
        <div className="p-5 sm:p-7 md:p-8 md:w-7/12 flex flex-col justify-center">
          {successStatus !== 'idle' ? (
            /* Success State */
            <div className="text-center py-4 sm:py-6 space-y-4 animate-fadeIn">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-display text-xl sm:text-2xl font-bold uppercase text-slate-900 tracking-wide">
                  {successStatus === 'alreadySubscribed'
                    ? "YOU'RE ALREADY ON THE LIST!"
                    : "YOU'RE ON THE LIST!"}
                </h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                  {successStatus === 'alreadySubscribed'
                    ? "You're already part of the Ghurabo community. We will continue sending you the best travel updates!"
                    : 'Travel inspiration, curated budget itineraries, and hidden spot highlights are coming your way.'}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => closeModal(false)}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-sm"
                >
                  Got It
                </button>
              </div>
            </div>
          ) : (
            /* Subscription Form */
            <div className="space-y-4 sm:space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-brand-600 block">
                  GHURABO TRAVEL COMMUNITY
                </span>
                <h2
                  id="newsletter-modal-title"
                  className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold uppercase text-slate-900 tracking-tight leading-snug"
                >
                  DISCOVER YOUR NEXT ADVENTURE
                </h2>
                <p className="text-xs text-slate-500 font-normal leading-relaxed">
                  Get inspiring trips, hidden destinations, and community travel stories delivered straight to your inbox.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
                <div className="space-y-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      ref={inputRef}
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (validationError) setValidationError('');
                        if (errorMessage) setErrorMessage('');
                      }}
                      disabled={loading}
                      placeholder="Enter your email address"
                      className={`w-full pl-10 pr-4 py-3 bg-slate-50 border text-slate-900 text-xs sm:text-sm rounded-xl transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                        validationError || errorMessage
                          ? 'border-rose-400 focus:ring-rose-400'
                          : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/20'
                      }`}
                    />
                  </div>

                  {/* Inline Error Helper */}
                  {(validationError || errorMessage) && (
                    <p className="text-[11px] text-rose-600 font-medium pl-1 animate-fadeIn">
                      {validationError || errorMessage}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <>
                      <span>JOIN THE COMMUNITY</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Trust Subtext */}
              <div className="pt-0.5 text-center">
                <p className="text-[11px] text-slate-400 font-light">
                  No spam. Unsubscribe anytime with one click.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
