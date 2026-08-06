'use client';

import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="w-full pt-28 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <h1 className="font-display text-4xl font-extrabold uppercase text-slate-900">Privacy Policy</h1>
          <p className="text-xs text-slate-500 font-light">Last updated: February 2026</p>

          <div className="space-y-4 text-xs text-slate-700 font-light leading-relaxed">
            <h3 className="font-display text-lg font-bold text-slate-900 uppercase">1. Information We Collect</h3>
            <p>We collect account email, profile name, uploaded trip stories, photographs, and optional verification documents.</p>

            <h3 className="font-display text-lg font-bold text-slate-900 uppercase">2. Use of Cookies</h3>
            <p>We use HTTP-Only session cookies solely to maintain secure authentication and remember your preferences.</p>

            <h3 className="font-display text-lg font-bold text-slate-900 uppercase">3. Data Protection</h3>
            <p>Your data is stored securely and never sold to third-party advertisers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
