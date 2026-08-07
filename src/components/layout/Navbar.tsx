'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Compass, Menu, X, User, PlusCircle, ShieldCheck, LogOut, Globe, DollarSign, ChevronDown } from 'lucide-react';
import { SessionUser } from '@/lib/auth/session';
import { AUTH_CHANGE_EVENT, notifyAuthChange } from '@/lib/auth/authEvent';
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary';
import { usePreferences } from '@/context/PreferencesContext';
import { CurrencyCode, LanguageCode } from '@/types';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  const { currency, language, setCurrency, setLanguage, t } = usePreferences();
  const router = useRouter();
  const pathname = usePathname();

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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between w-full">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white hover:text-brand-300 lg:hidden focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/" className="flex items-center group">
            <img
              src="/logo-ghurabo.png"
              alt="Ghurabo Logo"
              className="h-12 sm:h-16 w-auto object-contain group-hover:scale-105 transition-transform filter drop-shadow-md"
            />
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium text-white/90">
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

        {/* Right: Preferences, Auth & Share Trip CTA Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Language Selector Dropdown */}
          <div className="relative">
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

          {/* Currency Selector Dropdown */}
          <div className="relative">
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

          {/* Share a Trip CTA */}
          <Link
            href="/trips/share"
            className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 px-3.5 py-2 rounded-full transition-all"
          >
            <PlusCircle className="w-4 h-4 text-brand-300" />
            <span>{t('nav.shareTrip')}</span>
          </Link>

          {/* User Profile or Cyan Log In Pill Button */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setLangDropdownOpen(false);
                  setCurrencyDropdownOpen(false);
                }}
                className="flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white px-3.5 py-1.5 rounded-full font-medium text-sm transition-all shadow-md cursor-pointer"
              >
                <img
                  src={getOptimizedImageUrl(currentUser.avatar || 'https://i.pravatar.cc/150', { width: 100, height: 100 })}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-white"
                />
                <span className="max-w-[80px] sm:max-w-[90px] truncate">{currentUser.name}</span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl py-2 text-slate-800 border border-slate-100 z-50">
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
            <div className="flex items-center space-x-2">
              <Link
                href="/auth/login"
                className="flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white px-4 sm:px-5 py-2 rounded-full font-medium text-xs sm:text-sm transition-all shadow-md transform hover:scale-105"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t('nav.logIn')}</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-darkslate-900/95 backdrop-blur-xl border-b border-white/10 px-6 py-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {currentUser && (
            <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
              <img
                src={getOptimizedImageUrl(currentUser.avatar || 'https://i.pravatar.cc/150', { width: 100, height: 100 })}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover border border-white"
              />
              <div>
                <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                <p className="text-xs text-brand-300 capitalize">{currentUser.role}</p>
              </div>
            </div>
          )}

          {/* Preferences in Mobile Drawer */}
          <div className="flex items-center justify-between py-2 border-b border-white/10 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Language:</span>
              <button
                onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full border border-white/20"
              >
                {language === 'en' ? '🇬🇧 English' : '🇧🇩 বাংলা'}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Currency:</span>
              <button
                onClick={() => setCurrency(currency === 'BDT' ? 'USD' : 'BDT')}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full border border-white/20"
              >
                {currency === 'BDT' ? '🇧🇩 BDT (৳)' : '🇺🇸 USD ($)'}
              </button>
            </div>
          </div>

          <div className="flex flex-col space-y-3 font-medium text-white/90">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-300 py-1">
              {t('nav.home')}
            </Link>
            <Link href="/destinations" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-300 py-1">
              {t('nav.destinations')}
            </Link>
            <Link href="/trips" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-300 py-1">
              {t('nav.trips')}
            </Link>
            <Link href="/gallery" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-300 py-1">
              {t('nav.gallery')}
            </Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-300 py-1">
              {t('nav.about')}
            </Link>
            <Link href="/trips/share" onClick={() => setMobileMenuOpen(false)} className="text-brand-300 py-1 font-semibold">
              + {t('nav.shareTrip')}
            </Link>

            {currentUser ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-300 py-1">
                  {t('nav.dashboard')}
                </Link>
                <Link href={`/profile/${currentUser.id}`} onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-300 py-1">
                  {t('nav.profile')}
                </Link>
                {currentUser.role === 'admin' && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="text-brand-400 py-1 font-semibold">
                    {t('nav.admin')}
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 py-1 font-semibold text-left flex items-center space-x-2 pt-2 border-t border-white/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('nav.logOut')}</span>
                </button>
              </>
            ) : (
              <div className="pt-2 border-t border-white/10 flex flex-col space-y-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-full text-center text-sm shadow"
                >
                  {t('nav.logIn')}
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 rounded-full text-center text-sm border border-white/20"
                >
                  {t('nav.signUp')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
