'use client';

import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import {
  X,
  User,
  PlusCircle,
  ShieldCheck,
  LogOut,
  Globe,
  DollarSign,
  Compass,
} from 'lucide-react';
import { IUser } from '@/types';
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary';
import { usePreferences } from '@/context/PreferencesContext';

interface MobileNavDrawerProps {
  isOpen: boolean;
  isAnimate: boolean;
  onClose: () => void;
  user: IUser | null;
  onLogout: () => void;
  pathname: string;
}

export default function MobileNavDrawer({
  isOpen,
  isAnimate,
  onClose,
  user,
  onLogout,
  pathname,
}: MobileNavDrawerProps) {
  const touchStartRef = useRef<number>(0);
  const { currency, language, setCurrency, setLanguage, t } = usePreferences();

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const currentX = e.touches[0].clientX;
    const diffX = touchStartRef.current - currentX;
    if (diffX > 50) {
      touchStartRef.current = 0;
      onClose();
    }
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="md:hidden fixed inset-0 z-[9998] overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-[#030a19]/60 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
          isAnimate ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Left-Sliding Mobile Drawer Panel */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className={`fixed top-0 left-0 bottom-0 h-[100dvh] w-[min(88vw,360px)] z-[9999] bg-darkslate-950 text-white shadow-[20px_0_50px_rgba(0,0,0,0.4)] border-r border-white/10 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] transform ${
          isAnimate ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-darkslate-900/80 shrink-0">
          <Link href="/" onClick={onClose} className="flex items-center">
            <Image
              src="/logo-ghurabo.png"
              alt="Ghurabo Logo"
              width={843}
              height={276}
              className="h-9 w-auto object-contain"
            />
          </Link>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-5 space-y-5">
          {/* Authenticated User Header Card */}
          {user && (
            <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <Image
                src={getOptimizedImageUrl(user.avatar || 'https://i.pravatar.cc/150', { width: 100, height: 100 })}
                alt={user.name || 'User avatar'}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border-2 border-brand-400 shadow-sm shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate mb-1">{user.email}</p>
                <span className="inline-block px-2 py-0.5 bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[10px] font-bold rounded-full uppercase">
                  {user.role}
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
              onClick={onClose}
              className={`min-h-[44px] flex items-center space-x-3 px-3.5 py-3 rounded-xl transition-all text-sm font-medium ${
                pathname === '/' ? 'bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30' : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>{t('nav.home')}</span>
            </Link>
            <Link
              href="/trips"
              onClick={onClose}
              className={`min-h-[44px] flex items-center space-x-3 px-3.5 py-3 rounded-xl transition-all text-sm font-medium ${
                pathname === '/trips' ? 'bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30' : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>{t('nav.trips')}</span>
            </Link>
            <Link
              href="/gallery"
              onClick={onClose}
              className={`min-h-[44px] flex items-center space-x-3 px-3.5 py-3 rounded-xl transition-all text-sm font-medium ${
                pathname === '/gallery' ? 'bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30' : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>{t('nav.gallery')}</span>
            </Link>
            <Link
              href="/about"
              onClick={onClose}
              className={`min-h-[44px] flex items-center space-x-3 px-3.5 py-3 rounded-xl transition-all text-sm font-medium ${
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
              onClick={onClose}
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
                    language === 'en' ? 'bg-brand-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🇬🇧 English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('bn')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    language === 'bn' ? 'bg-brand-500 text-white shadow' : 'text-slate-400 hover:text-white'
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
                    currency === 'BDT' ? 'bg-brand-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🇧🇩 BDT (৳)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    currency === 'USD' ? 'bg-brand-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🇺🇸 USD ($)
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Authentication Actions */}
          <div className="pt-3 border-t border-white/10 space-y-1.5 pb-6">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl hover:bg-white/5 text-slate-200 text-sm font-medium transition-all"
                >
                  <Compass className="w-4 h-4 text-brand-300" />
                  <span>{t('nav.dashboard')}</span>
                </Link>
                <Link
                  href={`/profile/${user.id}`}
                  onClick={onClose}
                  className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl hover:bg-white/5 text-slate-200 text-sm font-medium transition-all"
                >
                  <User className="w-4 h-4 text-brand-300" />
                  <span>{t('nav.profile')}</span>
                </Link>

                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={onClose}
                    className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-300 text-sm font-bold transition-all"
                  >
                    <ShieldCheck className="w-4 h-4 text-brand-400" />
                    <span>{t('nav.admin')}</span>
                  </Link>
                )}

                <button
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
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
                  onClick={onClose}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-all"
                >
                  <User className="w-4 h-4" />
                  <span>{t('nav.logIn')}</span>
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={onClose}
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
  );
}
