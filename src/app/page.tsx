'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import SplitHero from '@/components/hero/SplitHero';
import TripCard from '@/components/cards/TripCard';
import { TripCardSkeleton } from '@/components/ui/Skeletons';
import { ITrip, IGalleryItem } from '@/types';
import { Compass, Camera, DollarSign, ArrowRight } from 'lucide-react';
import { destinationsApi, tripsApi, galleryApi } from '@/lib/api';
import {
  adaptBackendTripToITrip,
  adaptBackendGalleryToIGalleryItem,
} from '@/lib/api/adapters';
import CommunityGallerySpotlight from '@/components/home/CommunityGallerySpotlight';

export default function HomePage() {
  const [totalDestinations, setTotalDestinations] = useState<number>(0);
  const [popularTrips, setPopularTrips] = useState<ITrip[]>([]);
  const [trips, setTrips] = useState<ITrip[]>([]);
  const [galleryItems, setGalleryItems] = useState<IGalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [maxBudget, setMaxBudget] = useState<number>(50000);
  const [loadingPopularTrips, setLoadingPopularTrips] = useState(true);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingGallery, setLoadingGallery] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Fetch total destinations for stats
    destinationsApi
      .getDestinations({ limit: 1 })
      .then((res) => {
        if (mounted) {
          setTotalDestinations(res.meta?.total || (res.data ? res.data.length : 0));
        }
      })
      .catch(() => {});

    // Fetch popular trips (Admin-selected featured trips ONLY)
    tripsApi
      .getTrips({ featured: true, limit: 6 })
      .then((res) => {
        if (mounted) {
          const adapted = res.data.map(adaptBackendTripToITrip);
          setPopularTrips(adapted);
          setLoadingPopularTrips(false);
        }
      })
      .catch(() => {
        if (mounted) setLoadingPopularTrips(false);
      });

    // Fetch recent community trips
    tripsApi
      .getTrips({ limit: 20, sort: 'newest' })
      .then((res) => {
        if (mounted) {
          const adapted = res.data.map(adaptBackendTripToITrip);
          setTrips(adapted);
          setLoadingTrips(false);
        }
      })
      .catch(() => {
        if (mounted) setLoadingTrips(false);
      });

    // Fetch public community gallery photos
    galleryApi
      .getGallery({ limit: 6 })
      .then((res) => {
        if (mounted) {
          setGalleryItems(res.data.map(adaptBackendGalleryToIGalleryItem));
          setLoadingGallery(false);
        }
      })
      .catch(() => {
        if (mounted) setLoadingGallery(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalHelpful = trips.reduce((sum: number, t: ITrip) => sum + (t.helpfulVotesCount || 0), 0);
    return {
      totalDestinations: totalDestinations || 6,
      totalTrips: trips.length,
      totalHelpfulVotes: totalHelpful,
    };
  }, [totalDestinations, trips]);

  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const matchesCategory = activeCategory === 'All' || t.travelType.toLowerCase() === activeCategory.toLowerCase();
      const matchesBudget = (t.costBreakdown?.perPersonCost || 0) <= maxBudget;
      return matchesCategory && matchesBudget;
    });
  }, [trips, activeCategory, maxBudget]);

  return (
    <div className="w-full bg-slate-50">
      {/* Hero Section */}
      <SplitHero />

      {/* Popular Trips Section (Admin-selected) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center space-x-2 text-brand-600 text-xs font-bold uppercase tracking-widest mb-2">
              <Compass className="w-4 h-4" />
              <span>EXPLORE THE UNTOUCHED</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 uppercase">
              Popular Trips
            </h2>
          </div>
          <Link
            href="/trips"
            className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-sm font-bold text-brand-600 hover:text-brand-800 transition-colors"
          >
            <span>View All Trips</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingPopularTrips ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <TripCardSkeleton key={i} />
            ))}
          </div>
        ) : popularTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularTrips.slice(0, 6).map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
            <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-display text-base font-bold text-slate-700">No Popular Trips Yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Our editorial team is hand-curating the best itineraries. Check back soon!
            </p>
          </div>
        )}
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
                <span className="text-cyan-300 font-bold">৳{maxBudget.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="100000"
                step="2500"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full accent-cyan-300 cursor-pointer"
              />
            </div>
          </div>

          {/* Trips Grid */}
          {loadingTrips ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <TripCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTrips.slice(0, 6).map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-white/80 text-sm font-medium">No trips have been shared in this category yet.</p>
              <Link
                href="/trips/share"
                className="mt-4 inline-flex items-center space-x-2 px-6 py-2.5 bg-white text-brand-700 text-xs font-bold rounded-full uppercase cursor-pointer shadow-lg hover:bg-cyan-50 transition-all"
              >
                <span>+ Be the First to Share a Trip</span>
              </Link>
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
      <CommunityGallerySpotlight items={galleryItems} loading={loadingGallery} />

      {/* Real Live Database Community Stats Section */}
      <section className="py-16 bg-darkslate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
            <div className="font-display text-4xl sm:text-5xl font-extrabold text-cyan-300 mb-2">{stats.totalTrips}</div>
            <div className="text-xs uppercase tracking-wider text-slate-300 font-medium">Shared Trips</div>
          </div>
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
            <div className="font-display text-4xl sm:text-5xl font-extrabold text-cyan-300 mb-2">{stats.totalDestinations}</div>
            <div className="text-xs uppercase tracking-wider text-slate-300 font-medium">Destinations</div>
          </div>
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
            <div className="font-display text-4xl sm:text-5xl font-extrabold text-cyan-300 mb-2">{stats.totalHelpfulVotes}</div>
            <div className="text-xs uppercase tracking-wider text-slate-300 font-medium">Helpful Votes</div>
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
