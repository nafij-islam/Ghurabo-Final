import { Metadata } from 'next';
import { Suspense } from 'react';
import AllTripsDirectory from '@/components/trips/AllTripsDirectory';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Bangladesh Trip Guides, Tours & Travel Stories | Ghurabo',
  description:
    'Discover real Bangladesh trip guides, travel stories, budgets, itineraries and tips shared by the Ghurabo travel community.',
  alternates: {
    canonical: '/trips',
  },
  openGraph: {
    title: 'Bangladesh Trip Guides, Tours & Travel Stories | Ghurabo',
    description:
      'Discover real Bangladesh trip guides, travel stories, budgets, itineraries and tips shared by the Ghurabo travel community.',
    url: `${siteConfig.siteUrl}/trips`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bangladesh Trip Guides, Tours & Travel Stories | Ghurabo',
    description:
      'Discover real Bangladesh trip guides, travel stories, budgets, itineraries and tips shared by the Ghurabo travel community.',
  },
};

export default function AllTripsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full pt-36 pb-20 bg-slate-50 min-h-screen flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Loading Trips...</p>
          </div>
        </div>
      }
    >
      <AllTripsDirectory />
    </Suspense>
  );
}
