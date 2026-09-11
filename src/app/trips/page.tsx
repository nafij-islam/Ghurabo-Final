'use client';

import React, { useState, useEffect, useRef } from 'react';
import TripCard from '@/components/cards/TripCard';
import { TripCardSkeleton } from '@/components/ui/Skeletons';
import { ITrip, TravelType } from '@/types';
import { Search, Compass, SlidersHorizontal } from 'lucide-react';
import { tripsApi } from '@/lib/api';
import { adaptBackendTripToITrip, toBackendTravelType } from '@/lib/api/adapters';

export type TripSortOption = 'newest' | 'popular' | 'lowest_cost' | 'highest_rating';

export default function AllTripsPage() {
  const [trips, setTrips] = useState<ITrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [travelType, setTravelType] = useState<TravelType | 'All'>('All');
  const [maxBudget, setMaxBudget] = useState<number>(100000);
  const [sortBy, setSortBy] = useState<TripSortOption>('newest');
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);

      const backendSort =
        sortBy === 'popular'
          ? 'popular'
          : sortBy === 'lowest_cost'
          ? 'lowest-cost'
          : 'newest';

      const backendType = travelType === 'All' ? undefined : toBackendTravelType(travelType);

      tripsApi
        .getTrips(
          {
            search: searchQuery.trim() || undefined,
            travelType: backendType,
            maxBudget: maxBudget < 100000 ? maxBudget : undefined,
            sort: backendSort,
            limit: 50,
          },
          controller.signal
        )
        .then((res) => {
          setTrips(res.data.map(adaptBackendTripToITrip));
          setLoading(false);
        })
        .catch((err) => {
          if (err?.name !== 'AbortError') {
            setLoading(false);
          }
        });
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery, travelType, maxBudget, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="w-full pt-28 pb-20 bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <div className="bg-darkslate-900 text-white py-16 px-4 mb-12 border-b border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-3">
            <Compass className="w-4 h-4" />
            <span>COMMUNITY TRAVEL KNOWLEDGE BASE</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold uppercase mb-4">
            All Community Trips
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto font-light leading-relaxed">
            Filter authentic trip reports by budget, travel category, rating, and duration shared by real travellers.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Multi-Filter Bar */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-10 space-y-6">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search trip title, summary, or destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button
              type="submit"
              className="px-7 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm uppercase rounded-full shadow-md transition-all cursor-pointer"
            >
              Search Trips
            </button>
          </form>

          {/* Filter Controls Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            {/* Travel Type */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Travel Category
              </label>
              <select
                value={travelType}
                onChange={(e) => setTravelType(e.target.value as TravelType | 'All')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Solo">Solo Backpacking</option>
                <option value="Couple">Couple Escape</option>
                <option value="Family">Family Tour</option>
                <option value="Group">Group & Friends</option>
              </select>
            </div>

            {/* Sorting */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as TripSortOption)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="newest">Newest Published</option>
                <option value="popular">Most Liked / Popular</option>
                <option value="lowest_cost">Lowest Cost</option>
                <option value="highest_rating">Highest Rated</option>
              </select>
            </div>

            {/* Max Budget Slider */}
            <div className="sm:col-span-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Max Budget Per Person</span>
                <span className="text-brand-600 font-extrabold">৳{maxBudget.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="100000"
                step="2500"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Trips Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <TripCardSkeleton key={i} />
            ))}
          </div>
        ) : trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
            <SlidersHorizontal className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-display text-2xl font-bold text-slate-800 uppercase">No Trips Match Filters</h3>
            <p className="text-slate-500 text-xs mt-1">Try resetting budget limits or category selection.</p>
          </div>
        )}
      </div>
    </div>
  );
}
