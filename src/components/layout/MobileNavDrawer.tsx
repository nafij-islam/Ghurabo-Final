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
  Compass,
} from 'lucide-react';
import { IUser } from '@/types';
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary';

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

  if (typeof document === 'undefined' || !isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
      className={`fixed inset-0 z-[9999] transition-opacity duration-300 ${
        isAnimate ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-darkslate-950/80 backdrop-blur-sm"
      />

      {/* Drawer Panel */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className={`absolute top-0 right-0 h-full w-[85%] max-w-[340px] bg-darkslate-900 border-l border-white/10 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out overflow-y-auto ${
          isAnimate ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <Link href="/" onClick={onClose} className="inline-block">
            <Image
              src="/logo-ghurabo.png"
              alt="Ghurabo Logo"
              width={843}
              height={276}
              priority
              className="h-9 w-auto object-contain"
            />
          </Link>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Card if Authenticated */}
        {user && (
          <div className="p-4 bg-white/5 border-b border-white/10 shrink-0">
            <div className="flex items-center space-x-3">
              <Image
                src={getOptimizedImageUrl(user.avatar || 'https://i.pravatar.cc/150', { width: 100, height: 100 })}
                alt={user.name || 'User avatar'}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border-2 border-brand-400 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
              <span className="px-2 py-0.5 bg-brand-500/20 text-brand-300 text-[10px] font-bold rounded-full uppercase border border-brand-500/30 shrink-0">
                {user.role}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Content */}
        <div className="p-4 space-y-5 flex-1">
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
              <span>Home</span>
            </Link>
            <Link
              href="/trips"
              onClick={onClose}
              className={`min-h-[44px] flex items-center space-x-3 px-3.5 py-3 rounded-xl transition-all text-sm font-medium ${
                pathname === '/trips' ? 'bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30' : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>All Trips</span>
            </Link>
            <Link
              href="/gallery"
              onClick={onClose}
              className={`min-h-[44px] flex items-center space-x-3 px-3.5 py-3 rounded-xl transition-all text-sm font-medium ${
                pathname === '/gallery' ? 'bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30' : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>Gallery</span>
            </Link>
            <Link
              href="/about"
              onClick={onClose}
              className={`min-h-[44px] flex items-center space-x-3 px-3.5 py-3 rounded-xl transition-all text-sm font-medium ${
                pathname === '/about' ? 'bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30' : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>About Us</span>
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
              <span>+ Share Trip</span>
            </Link>
          </div>

          {/* Section 3: Authentication Actions */}
          <div className="pt-3 border-t border-white/10 space-y-1.5 pb-6">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl hover:bg-white/5 text-slate-200 text-sm font-medium transition-all"
                >
                  <Compass className="w-4 h-4 text-brand-300" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href={`/profile/${user.id}`}
                  onClick={onClose}
                  className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl hover:bg-white/5 text-slate-200 text-sm font-medium transition-all"
                >
                  <User className="w-4 h-4 text-brand-300" />
                  <span>Profile</span>
                </Link>

                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={onClose}
                    className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-300 text-sm font-bold transition-all"
                  >
                    <ShieldCheck className="w-4 h-4 text-brand-400" />
                    <span>Admin</span>
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
                  <span>Log Out</span>
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
                  <span>Log In</span>
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={onClose}
                  className="w-full flex items-center justify-center py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 rounded-xl transition-all"
                >
                  <span>Create Account</span>
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
