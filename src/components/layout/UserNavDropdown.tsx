'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Compass, ShieldCheck, LogOut } from 'lucide-react';
import { IUser } from '@/types';
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary';
import { usePreferences } from '@/context/PreferencesContext';

interface UserNavDropdownProps {
  user: IUser | null;
  onLogout: () => void;
}

export default function UserNavDropdown({ user, onLogout }: UserNavDropdownProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = usePreferences();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <div className="hidden md:flex items-center space-x-2">
        <Link
          href="/auth/login"
          className="flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-full font-medium text-sm transition-all shadow-md transform hover:scale-105"
        >
          <User className="w-3.5 h-3.5" />
          <span>{t('nav.logIn')}</span>
        </Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Desktop Profile Pill */}
      <button
        onClick={() => setDropdownOpen((prev) => !prev)}
        aria-expanded={dropdownOpen}
        aria-label="User Account Menu"
        className="hidden md:flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white px-3.5 py-1.5 rounded-full font-medium text-sm transition-all shadow-md cursor-pointer"
      >
        <Image
          src={getOptimizedImageUrl(user.avatar || 'https://i.pravatar.cc/150', { width: 100, height: 100 })}
          alt={user.name || 'User avatar'}
          width={24}
          height={24}
          className="w-6 h-6 rounded-full object-cover border border-white"
        />
        <span className="max-w-[90px] truncate">{user.name}</span>
      </button>

      {/* Mobile Small Avatar Icon */}
      <Link
        href={`/profile/${user.id}`}
        className="md:hidden flex items-center justify-center p-0.5 rounded-full border border-brand-400/60 hover:border-brand-400 transition-all"
        aria-label="Profile"
      >
        <Image
          src={getOptimizedImageUrl(user.avatar || 'https://i.pravatar.cc/150', { width: 100, height: 100 })}
          alt={user.name || 'User avatar'}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full object-cover border border-white shadow-sm"
        />
      </Link>

      {/* Desktop Profile Dropdown */}
      {dropdownOpen && (
        <div className="hidden md:block absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl py-2 text-slate-800 border border-slate-100 z-50">
          <div className="px-4 py-2 border-b border-slate-100">
            <p className="text-xs text-slate-500">{t('nav.signedInAs')}</p>
            <p className="font-semibold text-sm truncate">{user.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-brand-100 text-brand-700 text-[10px] font-bold rounded-full uppercase">
              {user.role}
            </span>
          </div>

          <Link
            href={`/profile/${user.id}`}
            onClick={() => setDropdownOpen(false)}
            className="flex items-center space-x-2 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors"
          >
            <User className="w-4 h-4 text-slate-500" />
            <span>{t('nav.profile')}</span>
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center space-x-2 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors"
          >
            <Compass className="w-4 h-4 text-slate-500" />
            <span>{t('nav.dashboard')}</span>
          </Link>

          {user.role === 'admin' && (
            <Link
              href="/admin"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center space-x-2 px-4 py-2.5 text-sm hover:bg-brand-50 text-brand-700 font-medium transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              <span>{t('nav.admin')}</span>
            </Link>
          )}

          <button
            onClick={() => {
              setDropdownOpen(false);
              onLogout();
            }}
            className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100 mt-1 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('nav.logOut')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
