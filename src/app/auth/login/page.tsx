'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock } from 'lucide-react';
import { notifyAuthChange } from '@/lib/auth/authEvent';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTarget = searchParams.get('redirect') || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({ success: false, error: 'Server response error' }));
      if (res.ok && data.success) {
        notifyAuthChange();
        router.refresh();
        router.push(redirectTarget);
      } else {
        setError(data.error || 'Invalid email or password');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error during sign in');
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
        <h1 className="font-display text-3xl font-bold uppercase text-slate-900">Welcome Back</h1>
        <p className="text-xs text-slate-500 font-light mt-1">Sign in to your Ghurabo traveller account</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-xs font-semibold text-center leading-relaxed">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="sahariannafis70@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg transition-all cursor-pointer"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <Link
            href={`/auth/signup?redirect=${encodeURIComponent(redirectTarget)}`}
            className="font-bold text-brand-600 hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="w-full min-h-screen pt-28 pb-20 bg-slate-50 flex items-center justify-center px-4">
      <Suspense fallback={<div className="text-center text-xs text-slate-400 font-semibold animate-pulse">Loading login form...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
