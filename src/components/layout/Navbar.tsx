'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Compass, Menu, X, User, PlusCircle, ShieldCheck, LogOut, Globe, DollarSign, ChevronDown } from 'lucide-react';
import { SessionUser } from '@/lib/auth/session';
import { AUTH_CHANGE_EVENT, notifyAuthChange } from '@/lib/auth/authEvent';
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary';
import { usePreferences } from '@/context/PreferencesContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuAnimate, setMobileMenuAnimate] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  const touchStartRef = useRef<number>(0);
  const { currency, language, setCurrency, setLanguage, t } = usePreferences();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const checkAuth = () => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => setCurrentUser(null));
  };

  useEffect(() => {
    checkAuth();

    if (typeof window !== 'undefined') {
      window.addEventListener(AUTH_CHANGE_EVENT, checkAuth);
      return () => window.removeEventListener(AUTH_CHANGE_EVENT, checkAuth);
    }
  }, [pathname]);

  // Open & Close mobile menu handlers with 2-stage smooth animation
  const openMobileMenu = () => {
    setMobileMenuOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setMobileMenuAnimate(true);
      });
    });
  };

  const closeMobileMenu = () => {
    setMobileMenuAnimate(false);
    setTimeout(() => {
      setMobileMenuOpen(false);
    }, 300);
  };

  // Lock background scroll when mobile drawer is open & handle Escape key
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
        setUserDropdownOpen(false);
        setLangDropdownOpen(false);
        setCurrencyDropdownOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Touch handlers for swipe-left to close gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const currentX = e.touches[0].clientX;
    const diffX = touchStartRef.current - currentX;
    if (diffX > 50) {
      touchStartRef.current = 0;
      closeMobileMenu();
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    setUserDropdownOpen(false);
    closeMobileMenu();
    notifyAuthChange();
    router.refresh();
    router.push('/');
  };

  const isHome = pathname === '/';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex items-center ${
        scrolled
          ? 'bg-darkslate-900/95 backdrop-blur-md h-16 sm:h-20 shadow-xl border-b border-white/10'
          : isHome
          ? 'bg-darkslate-900/60 md:bg-transparent backdrop-blur-md md:backdrop-blur-none h-16 sm:h-20 md:py-5'
          : 'bg-darkslate-900/90 backdrop-blur-md h-16 sm:h-20 border-b border-white/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between w-full h-full">
        {/* Brand Logo (Left) */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center group">
            <img
              src="/logo-ghurabo.png"
              alt="Ghurabo Logo"
              className="h-10 sm:h-14 md:h-16 w-auto object-contain group-hover:scale-105 transition-transform filter drop-shadow-md"
            />
          </Link>
        </div>

        {/* Center: Desktop Navigation Links (>= 768px) */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-7 text-sm font-medium text-white/90">
          <Link
            href="/"
            className={`transition-colors hover:text-brand-300 ${
              pathname === '/' ? 'text-brand-300 font-semibold' : ''
            }`}
          >
            {t('nav.home')}
          </Link>
          <Link
            href="/destinations"
            className={`transition-colors hover:text-brand-300 ${
              pathname.startsWith('/destinations') ? 'text-brand-300 font-semibold' : ''
            }`}
          >
            {t('nav.destinations')}
          </Link>
          <Link
            href="/trips"
            className={`transition-colors hover:text-brand-300 ${
              pathname === '/trips' ? 'text-brand-300 font-semibold' : ''
            }`}
          >
            {t('nav.trips')}
          </Link>
          <Link
            href="/gallery"
            className={`transition-colors hover:text-brand-300 ${
              pathname === '/gallery' ? 'text-brand-300 font-semibold' : ''
            }`}
          >
            {t('nav.gallery')}
          </Link>
          <Link
            href="/about"
            className={`transition-colors hover:text-brand-300 ${
              pathname === '/about' ? 'text-brand-300 font-semibold' : ''
            }`}
          >
            {t('nav.about')}
          </Link>
        </nav>

        {/* Right: Desktop Controls & Mobile Icons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Desktop Language Selector Dropdown (Hidden < 768px) */}
          <div className="hidden md:block relative">
            <button
              onClick={() => {
                setLangDropdownOpen(!langDropdownOpen);
                setCurrencyDropdownOpen(false);
                setUserDropdownOpen(false);
              }}
              className="flex items-center space-x-1 text-xs font-semibold text-white/90 bg-white/10 hover:bg-white/20 border border-white/20 px-2.5 py-1.5 rounded-full transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-brand-300" />
              <span>{language === 'bn' ? 'BN' : 'EN'}</span>
              <ChevronDown className="w-3 h-3 text-white/60" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl py-1.5 text-xs text-white z-50">
                <button
                  onClick={() => {
                    setLanguage('en');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/10 transition-colors ${
                    language === 'en' ? 'text-brand-300 font-bold' : 'text-slate-200'
                  }`}
                >
                  <span>English</span>
                  <span>🇬🇧</span>
                </button>
                <button
                  onClick={() => {
                    setLanguage('bn');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/10 transition-colors ${
                    language === 'bn' ? 'text-brand-300 font-bold' : 'text-slate-200'
                  }`}
                >
                  <span>বাংলা</span>
                  <span>🇧🇩</span>
                </button>
              </div>
            )}
          </div>

          {/* Desktop Currency Selector Dropdown (Hidden < 768px) */}
          <div className="hidden md:block relative">
            <button
              onClick={() => {
                setCurrencyDropdownOpen(!currencyDropdownOpen);
                setLangDropdownOpen(false);
                setUserDropdownOpen(false);
              }}
              className="flex items-center space-x-1 text-xs font-semibold text-white/90 bg-white/10 hover:bg-white/20 border border-white/20 px-2.5 py-1.5 rounded-full transition-all cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5 text-brand-300" />
              <span>{currency === 'USD' ? 'USD $' : 'BDT ৳'}</span>
              <ChevronDown className="w-3 h-3 text-white/60" />
            </button>

            {currencyDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl py-1.5 text-xs text-white z-50">
                <button
                  onClick={() => {
                    setCurrency('BDT');
                    setCurrencyDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/10 transition-colors ${
                    currency === 'BDT' ? 'text-brand-300 font-bold' : 'text-slate-200'
                  }`}
                >
                  <span>🇧🇩 BDT — ৳</span>
                </button>
                <button
                  onClick={() => {
                    setCurrency('USD');
                    setCurrencyDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/10 transition-colors ${
                    currency === 'USD' ? 'text-brand-300 font-bold' : 'text-slate-200'
                  }`}
                >
                  <span>🇺🇸 USD — $</span>
                </button>
              </div>
            )}
          </div>

          {/* Desktop Share a Trip CTA (Hidden < 768px) */}
          <Link
            href="/trips/share"
            className="hidden md:flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 px-3.5 py-2 rounded-full transition-all"
          >
            <PlusCircle className="w-4 h-4 text-brand-300" />
            <span>{t('nav.shareTrip')}</span>
          </Link>

          {/* User Profile or Log In Pill Button */}
          {currentUser ? (
            <div className="relative">
              {/* Desktop Profile Pill (Hidden < 768px) */}
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setLangDropdownOpen(false);
                  setCurrencyDropdownOpen(false);
                }}
                className="hidden md:flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white px-3.5 py-1.5 rounded-full font-medium text-sm transition-all shadow-md cursor-pointer"
              >
                <img
                  src={getOptimizedImageUrl(currentUser.avatar || 'https://i.pravatar.cc/150', { width: 100, height: 100 })}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-white"
                />
                <span className="max-w-[90px] truncate">{currentUser.name}</span>
              </button>

              {/* Mobile Small Avatar Icon (Visible < 768px when authenticated) */}
              <Link
                href={`/profile/${currentUser.id}`}
                className="md:hidden flex items-center justify-center p-0.5 rounded-full border border-brand-400/60 hover:border-brand-400 transition-all"
                aria-label="Profile"
              >
                <img
                  src={getOptimizedImageUrl(currentUser.avatar || 'https://i.pravatar.cc/150', { width: 100, height: 100 })}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-white shadow-sm"
                />
              </Link>

              {/* Desktop Profile Dropdown (Hidden < 768px) */}
              {userDropdownOpen && (
                <div className="hidden md:block absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl py-2 text-slate-800 border border-slate-100 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500">{t('nav.signedInAs')}</p>
                    <p className="font-semibold text-sm truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-brand-100 text-brand-700 text-[10px] font-bold rounded-full uppercase">
                      {currentUser.role}
                    </span>
                  </div>

                  <Link
                    href={`/profile/${currentUser.id}`}
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span>{t('nav.profile')}</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors"
                  >
                    <Compass className="w-4 h-4 text-slate-500" />
                    <span>{t('nav.dashboard')}</span>
                  </Link>

                  {currentUser.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2.5 text-sm hover:bg-brand-50 text-brand-700 font-medium transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-brand-500" />
                      <span>{t('nav.admin')}</span>
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100 mt-1 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav.logOut')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Desktop Log In Button (Hidden < 768px, Guest mobile uses menu) */
            <div className="hidden md:flex items-center space-x-2">
              <Link
                href="/auth/login"
                className="flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-full font-medium text-sm transition-all shadow-md transform hover:scale-105"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t('nav.logIn')}</span>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle Button (Visible < 768px) */}
          <button
            onClick={() => (mobileMenuOpen ? closeMobileMenu() : openMobileMenu())}
            className="md:hidden p-2 text-white hover:text-brand-300 focus:outline-none cursor-pointer rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all ml-1"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-brand-300" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>
      </div>

      {/* Portal Mounted Left-Sliding Mobile Navigation Drawer (< 768px) */}
      {mounted && mobileMenuOpen && createPortal(
        <div className="md:hidden fixed inset-0 z-[9998] overflow-hidden" role="dialog" aria-modal="true">
          {/* Backdrop Overlay with smooth fade in/out */}
          <div
            className={`fixed inset-0 bg-[#030a19]/60 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
              mobileMenuAnimate ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeMobileMenu}
            aria-hidden="true"
          />

          {/* Left-Sliding Mobile Drawer Panel */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            className={`fixed top-0 left-0 bottom-0 h-[100dvh] w-[min(88vw,360px)] z-[9999] bg-darkslate-950 text-white shadow-[20px_0_50px_rgba(0,0,0,0.4)] border-r border-white/10 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] transform ${
              mobileMenuAnimate ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
            }`}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-darkslate-900/80 shrink-0">
              <Link href="/" onClick={closeMobileMenu} className="flex items-center">
                <img
                  src="/logo-ghurabo.png"
                  alt="Ghurabo Logo"
                  className="h-9 w-auto object-contain"
                />
              </Link>
              <button
                onClick={closeMobileMenu}
                className="p-2 text-slate-300 hover:text-white rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-5 space-y-5">
              {/* Authenticated User Header Card */}
              {currentUser && (
                <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <img
                    src={getOptimizedImageUrl(currentUser.avatar || 'https://i.pravatar.cc/150', { width: 100, height: 100 })}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-brand-400 shadow-sm shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-xs text-slate-400 truncate mb-1">{currentUser.email}</p>
                    <span className="inline-block px-2 py-0.5 bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[10px] font-bold rounded-full uppercase">
                      {currentUser.role}
                    </span>
                  </div>
                </div>
              )}

              {/* Section 1: Navigation Links */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-2 mb-1.5">
                  Navigation
                </span>
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all text-sm font-medium ${
                    pathname === '/' ? 'bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30' : 'text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span>{t('nav.home')}</span>
                </Link>
                <Link
                  href="/destinations"
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all text-sm font-medium ${
                    pathname.startsWith('/destinations') ? 'bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30' : 'text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span>{t('nav.destinations')}</span>
                </Link>
                <Link
                  href="/trips"
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all text-sm font-medium ${
                    pathname === '/trips' ? 'bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30' : 'text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span>{t('nav.trips')}</span>
                </Link>
                <Link
                  href="/gallery"
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all text-sm font-medium ${
                    pathname === '/gallery' ? 'bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30' : 'text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span>{t('nav.gallery')}</span>
                </Link>
                <Link
                  href="/about"
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all text-sm font-medium ${
                    pathname === '/about' ? 'bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30' : 'text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span>{t('nav.about')}</span>
                </Link>
              </div>

              {/* Section 2: Action CTA */}
              <div className="pt-1">
                <Link
                  href="/trips/share"
                  onClick={closeMobileMenu}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ {t('nav.shareTrip')}</span>
                </Link>
              </div>

              {/* Section 3: Preferences (Language & Currency) */}
              <div className="pt-3 border-t border-white/10 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                  Preferences / পছন্দসমূহ
                </span>

                {/* Language Controls */}
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
                    <Globe className="w-3.5 h-3.5 text-brand-300" />
                    <span>Language</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 bg-black/40 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        language === 'en'
                          ? 'bg-brand-500 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🇬🇧 English
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage('bn')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        language === 'bn'
                          ? 'bg-brand-500 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🇧🇩 বাংলা
                    </button>
                  </div>
                </div>

                {/* Currency Controls */}
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
                    <DollarSign className="w-3.5 h-3.5 text-brand-300" />
                    <span>Currency</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 bg-black/40 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setCurrency('BDT')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        currency === 'BDT'
                          ? 'bg-brand-500 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🇧🇩 BDT (৳)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrency('USD')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        currency === 'USD'
                          ? 'bg-brand-500 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🇺🇸 USD ($)
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 4: Authentication Actions */}
              <div className="pt-3 border-t border-white/10 space-y-1.5 pb-6">
                {currentUser ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={closeMobileMenu}
                      className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl hover:bg-white/5 text-slate-200 text-sm font-medium transition-all"
                    >
                      <Compass className="w-4 h-4 text-brand-300" />
                      <span>{t('nav.dashboard')}</span>
                    </Link>
                    <Link
                      href={`/profile/${currentUser.id}`}
                      onClick={closeMobileMenu}
                      className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl hover:bg-white/5 text-slate-200 text-sm font-medium transition-all"
                    >
                      <User className="w-4 h-4 text-brand-300" />
                      <span>{t('nav.profile')}</span>
                    </Link>

                    {currentUser.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={closeMobileMenu}
                        className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-300 text-sm font-bold transition-all"
                      >
                        <ShieldCheck className="w-4 h-4 text-brand-400" />
                        <span>{t('nav.admin')}</span>
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 text-sm font-semibold transition-all mt-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span>{t('nav.logOut')}</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-2 pt-2">
                    <Link
                      href="/auth/login"
                      onClick={closeMobileMenu}
                      className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-all"
                    >
                      <User className="w-4 h-4" />
                      <span>{t('nav.logIn')}</span>
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={closeMobileMenu}
                      className="w-full flex items-center justify-center py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 rounded-xl transition-all"
                    >
                      <span>{t('nav.signUp')}</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}


