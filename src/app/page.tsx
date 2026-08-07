'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SplitHero from '@/components/hero/SplitHero';
import DestinationCard from '@/components/cards/DestinationCard';
import TripCard from '@/components/cards/TripCard';
import { IDestination, ITrip, IGalleryItem } from '@/types';
import { Compass, Camera, DollarSign, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [destinations, setDestinations] = useState<IDestination[]>([]);
  const [popularTrips, setPopularTrips] = useState<ITrip[]>([]);
  const [trips, setTrips] = useState<ITrip[]>([]);
  const [galleryItems, setGalleryItems] = useState<IGalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [maxBudget, setMaxBudget] = useState<number>(500);

  useEffect(() => {
    // Load initial data
    fetch('/api/destinations')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDestinations(data.destinations || []);
      });

    // Fetch Admin-Selected Popular Approved Trips
    fetch('/api/trips?popular=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPopularTrips(data.trips || []);
      });

    fetch('/api/trips')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTrips(data.trips || []);
      });

    fetch('/api/gallery')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setGalleryItems(data.gallery || []);
      });
  }, []);

  const filteredTrips = trips.filter((t) => {
    const matchesCategory = activeCategory === 'All' || t.travelType === activeCategory;
    const matchesBudget = (t.costBreakdown?.perPersonCost || 0) <= maxBudget;
    return matchesCategory && matchesBudget;
  });

  return (
    <div className="w-full bg-slate-50">
      {/* Hero Section */}
      <SplitHero />

      {/* Popular Destinations / Popular Trips Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center space-x-2 text-brand-600 text-xs font-bold uppercase tracking-widest mb-2">
              <Compass className="w-4 h-4" />
              <span>EXPLORE THE UNTOUCHED</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 uppercase">
              Popular Destinations
            </h2>
          </div>
          <Link
            href="/destinations"
            className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-sm font-bold text-brand-600 hover:text-brand-800 transition-colors"
          >
            <span>View All Destinations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {popularTrips.length > 0
            ? popularTrips.slice(0, 6).map((trip) => <TripCard key={trip.id || (trip as any)._id} trip={trip} />)
            : destinations
                .filter((d) => d.isPopular)
                .concat(destinations.filter((d) => !d.isPopular))
                .slice(0, 6)
                .map((dest) => <DestinationCard key={dest.id || (dest as any)._id} destination={dest} />)}
        </div>
      </section>

      {/* Organic Edge Section Divider */}
      <div className="relative w-full h-16 bg-brand-500 overflow-hidden">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full text-slate-50 fill-current"
        >
          <path d="M0,0 C150,90 350,-40 500,65 C650,155 900,-20 1200,40 L1200,0 L0,0 Z" />
        </svg>
      </div>

      {/* Travel Categories & Community Trips Section */}
      <section className="py-20 bg-brand-500 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="px-4 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest text-cyan-200">
              COMMUNITY SUBMISSIONS
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold uppercase mt-3 mb-4">
              Recently Shared Trips
            </h2>
            <p className="text-white/80 text-sm font-light">
              Browse real journeys uploaded by verified backpackers, couples, families, and tour groups.
            </p>

            {/* Travel Category Tabs */}
            <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
              {['All', 'Solo', 'Couple', 'Family', 'Group'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-white text-brand-700 shadow-lg scale-105'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {cat === 'All' ? 'All Travel Types' : `${cat} Tours`}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Filter Slider Bar */}
          <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 mb-12 flex items-center space-x-4">
            <DollarSign className="w-5 h-5 text-cyan-300" />
            <div className="flex-1">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Filter by Max Budget / Person</span>
                <span className="text-cyan-300 font-bold">${maxBudget}</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="25"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full accent-cyan-300 cursor-pointer"
              />
            </div>
          </div>

          {/* Trips Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTrips.slice(0, 6).map((trip) => (
              <TripCard key={trip.id || (trip as any)._id} trip={trip} />
            ))}
          </div>

          {filteredTrips.length === 0 && (
            <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-white/80">No trips found matching budget under ${maxBudget}.</p>
              <button
                onClick={() => setMaxBudget(1000)}
                className="mt-3 px-4 py-2 bg-white text-brand-700 text-xs font-bold rounded-full uppercase cursor-pointer"
              >
                Reset Budget Filter
              </button>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/trips"
              className="inline-flex items-center space-x-2 bg-white text-brand-700 hover:bg-cyan-50 font-bold px-8 py-3.5 rounded-full shadow-xl transition-all uppercase text-sm"
            >
              <span>Explore All Community Trips</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Organic Edge Divider Bottom */}
      <div className="relative w-full h-16 bg-brand-500 overflow-hidden">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full text-slate-50 fill-current"
        >
          <path d="M0,120 C150,30 350,160 500,55 C650,-35 900,140 1200,80 L1200,120 L0,120 Z" />
        </svg>
      </div>

      {/* Dynamic Community Photo Gallery Spotlight */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 text-brand-600 text-xs font-bold uppercase tracking-widest mb-2">
            <Camera className="w-4 h-4" />
            <span>AUTO-SYNCED PHOTO FEED</span>
          </div>
          <h2 className="font-display text-4xl font-extrabold text-slate-900 uppercase">
            Community Gallery Spotlight
          </h2>
          <p className="text-slate-600 text-sm font-light mt-2">
            Every photo uploaded inside an approved trip automatically appears in our public gallery.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {galleryItems.slice(0, 6).map((item) => (
            <Link
              key={item.id || (item as any)._id}
              href={`/trips/${item.tripSlug || item.tripId}`}
              className="group relative h-48 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
            >
              <img
                src={item.url}
                alt={item.caption || item.destinationName}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white">
                <p className="text-[11px] font-bold truncate">{item.photographerName}</p>
                <p className="text-[10px] text-cyan-300 font-semibold truncate">{item.tripTitle}</p>
                <p className="text-[9px] text-white/70 truncate">{item.destinationName} • {item.travelType}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Community Stats Section */}
      <section className="py-16 bg-darkslate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
            <div className="font-display text-4xl sm:text-5xl font-extrabold text-cyan-300 mb-2">1,420+</div>
            <div className="text-xs uppercase tracking-wider text-slate-300 font-medium">Shared Trips</div>
          </div>
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
            <div className="font-display text-4xl sm:text-5xl font-extrabold text-cyan-300 mb-2">8,950+</div>
            <div className="text-xs uppercase tracking-wider text-slate-300 font-medium">Active Explorers</div>
          </div>
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
            <div className="font-display text-4xl sm:text-5xl font-extrabold text-cyan-300 mb-2">4,300+</div>
            <div className="text-xs uppercase tracking-wider text-slate-300 font-medium">Helpful Votes</div>
          </div>
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
            <div className="font-display text-4xl sm:text-5xl font-extrabold text-cyan-300 mb-2">34+</div>
            <div className="text-xs uppercase tracking-wider text-slate-300 font-medium">Countries Covered</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-500 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="font-display text-4xl sm:text-6xl font-extrabold uppercase mb-4">
            Ready to Share Your Latest Adventure?
          </h2>
          <p className="text-white/90 text-sm sm:text-base font-light max-w-2xl mx-auto mb-8 leading-relaxed">
            Join thousands of travelers documenting budget itineraries, safety tips, and travel photos.
          </p>
          <Link
            href="/trips/share"
            className="inline-flex items-center space-x-2 bg-white text-brand-700 hover:bg-cyan-50 font-bold px-8 py-4 rounded-full shadow-2xl transition-all uppercase text-sm tracking-wider"
          >
            <span>Start Sharing Trip</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
