'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { signInWithGoogle } from '@/lib/firebase/client';
import { normalizeApiErrorMessage } from '@/lib/api/apiError';

interface GoogleAuthButtonProps {
  redirectTarget?: string;
  onError?: (errorMessage: string) => void;
}

export default function GoogleAuthButton({ redirectTarget = '/dashboard', onError }: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { googleLogin } = useAuth();

  const handleGoogleSignIn = async () => {
    if (onError) onError('');
    setLoading(true);

    try {
      const idToken = await signInWithGoogle();
      if (idToken) {
        await googleLogin(idToken);
        router.push(redirectTarget);
      }
    } catch (err: any) {
      // Ignore user closing popup window
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        setLoading(false);
        return;
      }
      console.error('Firebase Google Sign-In Error:', err);
      const message = normalizeApiErrorMessage(err);
      if (onError) onError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-3 cursor-pointer disabled:opacity-60"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
    </button>
  );
}
