'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

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
      const data = await res.json();
      if (data.success) {
        router.push(redirectTarget);
        router.refresh();
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during signup');
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
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-xs font-semibold text-center">
          {error}
        </div>
      )}

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
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
            >
              <option value="Solo">Solo</option>
              <option value="Couple">Couple</option>
              <option value="Family">Family</option>
              <option value="Group">Group</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Home City</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
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

      <div className="text-center text-xs text-slate-500 pt-2">
        Already have an account?{' '}
        <Link href={`/auth/login?redirect=${encodeURIComponent(redirectTarget)}`} className="text-brand-600 font-bold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="w-full min-h-screen pt-32 pb-20 bg-slate-50 flex items-center justify-center px-4">
      <Suspense fallback={<div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
