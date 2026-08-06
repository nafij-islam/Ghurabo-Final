'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';

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
              <h3 className="font-display text-xl font-bold text-slate-900 mb-2 flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-brand-500" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-slate-600 text-xs font-light leading-relaxed pl-7">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
