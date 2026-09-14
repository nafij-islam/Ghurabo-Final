import React from 'react';
import Link from 'next/link';
import { Compass, ArrowRight, Home } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found | Ghurabo',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center pt-28 pb-20 px-4 bg-slate-50">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-100">
        <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto text-brand-600">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">404 Error</span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 uppercase">
            Lost on the Trail?
          </h1>
          <p className="text-xs text-slate-500 font-light leading-relaxed">
            The page, trip story, or traveler profile you are looking for may have been moved, removed, or does not exist.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase rounded-full transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go Home</span>
          </Link>
          <Link
            href="/trips"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold uppercase rounded-full shadow transition-all"
          >
            <span>Explore Trips</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
