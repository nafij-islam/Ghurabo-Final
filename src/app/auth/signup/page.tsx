'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { notifyAuthChange } from '@/lib/auth/authEvent';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';

function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredStyle, setPreferredStyle] = useState('Solo');
  const [location, setLocation] = useState('Dhaka, Bangladesh');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTarget = searchParams.get('redirect') || '/dashboard';

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, preferredStyle, location }),
      });
      const data = await res.json().catch(() => ({ success: false, error: 'Server connection error' }));
      if (res.ok && data.success) {
        notifyAuthChange();
        router.refresh();
        router.push(redirectTarget);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred during signup');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100 space-y-6">
      <div className="text-center">
        <img
          src="/logo-ghurabo.png"
          alt="Ghurabo Logo"
          className="h-16 sm:h-20 w-auto object-contain mx-auto mb-3"
        />
        <h1 className="font-display text-3xl font-bold uppercase text-slate-900">Join Community</h1>
        <p className="text-xs text-slate-500 font-light mt-1">Create your Ghurabo explorer account</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-xs font-semibold text-center leading-relaxed">
          {error}
        </div>
      )}

      {/* Google Sign-In Provider */}
      <GoogleAuthButton redirectTarget={redirectTarget} onError={(err) => setError(err)} />

      {/* Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-slate-200 w-full" />
        <span className="bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 absolute">
          Or Register with Email
        </span>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Full Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Nafij Islam"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Email Address</label>
          <input
            type="email"
            required
            placeholder="yourname@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Password</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Travel Style</label>
            <select
              value={preferredStyle}
              onChange={(e) => setPreferredStyle(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="Solo">Solo</option>
              <option value="Couple">Couple</option>
              <option value="Family">Family</option>
              <option value="Group">Group</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Location</label>
            <input
              type="text"
              placeholder="City, Country"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg transition-all cursor-pointer"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          Already have an account?{' '}
          <Link
            href={`/auth/login?redirect=${encodeURIComponent(redirectTarget)}`}
            className="font-bold text-brand-600 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="w-full min-h-screen pt-28 pb-20 bg-slate-50 flex items-center justify-center px-4">
      <Suspense fallback={<div className="text-center text-xs text-slate-400 font-semibold animate-pulse">Loading signup form...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
