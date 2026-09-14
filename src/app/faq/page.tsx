import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Ghurabo Travel Community FAQ',
  description:
    'Find answers about Ghurabo trips, travel sharing, accounts, community features and using the platform.',
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: 'Ghurabo Travel Community FAQ',
    description:
      'Find answers about Ghurabo trips, travel sharing, accounts, community features and using the platform.',
    url: `${siteConfig.siteUrl}/faq`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ghurabo Travel Community FAQ',
    description:
      'Find answers about Ghurabo trips, travel sharing, accounts, community features and using the platform.',
  },
};

export default function FAQPage() {
  const faqs = [
    {
      q: 'How does Ghurabo verify community trips?',
      a: 'Travellers can optionally upload booking confirmation receipts, train/flight tickets, or hotel vouchers during submission. Our admin team reviews these documents privately and awards the Verified Trip badge.',
    },
    {
      q: 'Do photos auto-sync to the Community Gallery?',
      a: 'Yes! Whenever you upload images inside an approved trip, every photo automatically appears in the public Community Gallery with your photographer credit and a direct link to your trip story.',
    },
    {
      q: 'How are average destination costs calculated?',
      a: 'Ghurabo automatically calculates dynamic cost benchmarks for Solo, Couple, Family, and Group tours directly from approved user trip expense reports whenever enough community data exists.',
    },
    {
      q: 'Is Ghurabo free to use?',
      a: 'Ghurabo is 100% free for all travellers to read, search, filter, share trips, and download itineraries.',
    },
  ];

  return (
    <div className="w-full pt-28 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-darkslate-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl border border-white/10 mb-10 text-center">
          <span className="px-3.5 py-1 bg-brand-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold uppercase mt-3 mb-3">
            Community Help & FAQ
          </h1>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="font-display text-lg font-bold text-slate-900 uppercase mb-2">
                {faq.q}
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm font-light leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
