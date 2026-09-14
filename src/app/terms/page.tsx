import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Terms of Service | Ghurabo',
  description:
    'Terms of Service and community guidelines for sharing trips, photographs, and reviews on Ghurabo.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Terms of Service | Ghurabo',
    description:
      'Terms of Service and community guidelines for sharing trips, photographs, and reviews on Ghurabo.',
    url: `${siteConfig.siteUrl}/terms`,
    type: 'website',
  },
};

export default function TermsPage() {
  return (
    <div className="w-full pt-28 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <h1 className="font-display text-4xl font-extrabold uppercase text-slate-900">Terms of Service & Guidelines</h1>
          <p className="text-xs text-slate-500 font-light">Last updated: February 2026</p>

          <div className="space-y-4 text-xs text-slate-700 font-light leading-relaxed">
            <h2 className="font-display text-lg font-bold text-slate-900 uppercase">1. User Generated Content Policy</h2>
            <p>Users must submit authentic travel experiences. Fake pricing, spam, or copyrighted image re-uploads without permission will be removed by moderators.</p>

            <h2 className="font-display text-lg font-bold text-slate-900 uppercase">2. Verification Proof Documents</h2>
            <p>Any proof documents (hotel receipts, train/flight tickets) submitted for Verified Trip badges are strictly confidential and only accessible by platform administrators.</p>

            <h2 className="font-display text-lg font-bold text-slate-900 uppercase">3. Community Safety & Respect</h2>
            <p>Zero tolerance for hate speech, harassment, or unsafe travel recommendations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
