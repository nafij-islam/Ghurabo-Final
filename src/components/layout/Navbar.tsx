'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, PlusCircle } from 'lucide-react';
import { usePreferences } from '@/context/PreferencesContext';
import { useAuth } from '@/hooks/useAuth';
import PreferencesDropdown from './PreferencesDropdown';
import UserNavDropdown from './UserNavDropdown';
import MobileNavDrawer from './MobileNavDrawer';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuAnimate, setMobileMenuAnimate] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { t } = usePreferences();
  const { user, logout } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      document.body.style.touchAction = 'none';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeMobileMenu();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
  }, [mobileMenuOpen]);

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
        {/* Brand Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center group">
            <img
              src="/logo-ghurabo.png"
              alt="Ghurabo Logo"
              className="h-10 sm:h-14 md:h-16 w-auto object-contain group-hover:scale-105 transition-transform filter drop-shadow-md"
            />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
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

        {/* Right Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Preferences (Language & Currency) */}
          <PreferencesDropdown />

          {/* Desktop Share a Trip CTA */}
          <Link
            href="/trips/share"
            className="hidden md:flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 px-3.5 py-2 rounded-full transition-all"
          >
            <PlusCircle className="w-4 h-4 text-brand-300" />
            <span>{t('nav.shareTrip')}</span>
          </Link>

          {/* User Profile or Log In */}
          <UserNavDropdown user={user} onLogout={logout} />

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => (mobileMenuOpen ? closeMobileMenu() : openMobileMenu())}
            className="md:hidden p-2 text-white hover:text-brand-300 focus:outline-none cursor-pointer rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all ml-1"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-brand-300" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Portal Mounted) */}
      {mounted && (
        <MobileNavDrawer
          isOpen={mobileMenuOpen}
          isAnimate={mobileMenuAnimate}
          onClose={closeMobileMenu}
          user={user}
          onLogout={logout}
          pathname={pathname}
        />
      )}
    </header>
  );
}
