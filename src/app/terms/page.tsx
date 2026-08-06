'use client';

import React from 'react';

export default function TermsPage() {
  return (
    <div className="w-full pt-28 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <h1 className="font-display text-4xl font-extrabold uppercase text-slate-900">Terms of Service & Guidelines</h1>
          <p className="text-xs text-slate-500 font-light">Last updated: February 2026</p>

          <div className="space-y-4 text-xs text-slate-700 font-light leading-relaxed">
            <h3 className="font-display text-lg font-bold text-slate-900 uppercase">1. User Generated Content Policy</h3>
            <p>Users must submit authentic travel experiences. Fake pricing, spam, or copyrighted image re-uploads without permission will be removed by moderators.</p>

            <h3 className="font-display text-lg font-bold text-slate-900 uppercase">2. Verification Proof Documents</h3>
            <p>Any proof documents (hotel receipts, train/flight tickets) submitted for Verified Trip badges are strictly confidential and only accessible by platform administrators.</p>

            <h3 className="font-display text-lg font-bold text-slate-900 uppercase">3. Community Safety & Respect</h3>
            <p>Zero tolerance for hate speech, harassment, or unsafe travel recommendations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
