'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Compass, Menu, X, User, PlusCircle, ShieldCheck, LogOut } from 'lucide-react';
import { SessionUser } from '@/lib/auth/session';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
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

  useEffect(() => {
    // Check logged in user
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/trips?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    setUserDropdownOpen(false);
    router.refresh();
  };

  const isHome = pathname === '/';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-darkslate-900/90 backdrop-blur-md py-3 shadow-xl border-b border-white/10'
          : isHome
          ? 'bg-transparent py-5'
          : 'bg-darkslate-900/80 backdrop-blur-md py-4 border-b border-white/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white hover:text-brand-300 lg:hidden focus:outline-none"
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
        <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium text-white/90">
          <Link
            href="/"
            className={`transition-colors hover:text-brand-300 ${
              pathname === '/' ? 'text-brand-300 font-semibold' : ''
            }`}
          >
            Home
          </Link>
          <Link
            href="/destinations"
            className={`transition-colors hover:text-brand-300 ${
              pathname.startsWith('/destinations') ? 'text-brand-300 font-semibold' : ''
            }`}
          >
            Destinations
          </Link>
          <Link
            href="/trips"
            className={`transition-colors hover:text-brand-300 ${
              pathname === '/trips' ? 'text-brand-300 font-semibold' : ''
            }`}
          >
            All Trips
          </Link>
          <Link
            href="/gallery"
            className={`transition-colors hover:text-brand-300 ${
              pathname === '/gallery' ? 'text-brand-300 font-semibold' : ''
            }`}
          >
            Gallery
          </Link>
          <Link
            href="/about"
            className={`transition-colors hover:text-brand-300 ${
              pathname === '/about' ? 'text-brand-300 font-semibold' : ''
            }`}
          >
            About Us
          </Link>
        </nav>

        {/* Right: Search Field & Auth Pill Button */}
        <div className="flex items-center space-x-4">
          {/* Pill Search Field matching reference image */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center bg-white rounded-full px-4 py-1.5 shadow-md w-52 lg:w-64 focus-within:ring-2 focus-within:ring-brand-400 transition-all"
          >
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-slate-800 text-sm focus:outline-none w-full placeholder-slate-400 pr-2"
            />
            <button type="submit" aria-label="Search" className="text-brand-500 hover:text-brand-700">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Share a Trip CTA */}
          <Link
            href="/trips/share"
            className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 px-3.5 py-2 rounded-full transition-all"
          >
            <PlusCircle className="w-4 h-4 text-brand-300" />
            <span>Share Trip</span>
          </Link>

          {/* User Profile or Cyan Log In Pill Button */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-1.5 rounded-full font-medium text-sm transition-all shadow-md"
              >
                <img
                  src={currentUser.avatar || 'https://i.pravatar.cc/150'}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-white"
                />
                <span className="max-w-[90px] truncate">{currentUser.name}</span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl py-2 text-slate-800 border border-slate-100 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500">Signed in as</p>
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
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors"
                  >
                    <Compass className="w-4 h-4 text-slate-500" />
                    <span>User Dashboard</span>
                  </Link>

                  {currentUser.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2.5 text-sm hover:bg-brand-50 text-brand-700 font-medium transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-brand-500" />
                      <span>Admin Moderation</span>
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100 mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-full font-medium text-sm transition-all shadow-md transform hover:scale-105"
            >
              <User className="w-4 h-4" />
              <span>Log In</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-darkslate-900/95 backdrop-blur-xl border-b border-white/10 px-6 py-6 space-y-4">
          <form onSubmit={handleSearch} className="flex items-center bg-white rounded-full px-4 py-2 mb-4">
            <input
              type="text"
              placeholder="Search destinations, trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-slate-800 text-sm focus:outline-none w-full pr-2"
            />
            <button type="submit" aria-label="Search" className="text-brand-500">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="flex flex-col space-y-3 font-medium text-white/90">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-300 py-1">
              Home
            </Link>
            <Link href="/destinations" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-300 py-1">
              Destinations
            </Link>
            <Link href="/trips" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-300 py-1">
              All Trips
            </Link>
            <Link href="/gallery" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-300 py-1">
              Community Gallery
            </Link>
            <Link href="/trips/share" onClick={() => setMobileMenuOpen(false)} className="text-brand-300 py-1 font-semibold">
              + Share a Trip
            </Link>
            {currentUser && (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-300 py-1">
                Dashboard
              </Link>
            )}
            {currentUser?.role === 'admin' && (
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="text-brand-400 py-1 font-semibold">
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
