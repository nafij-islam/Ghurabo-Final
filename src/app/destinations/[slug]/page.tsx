'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import TripCard from '@/components/cards/TripCard';
import { TripCardSkeleton } from '@/components/ui/Skeletons';
import { IDestination, ITrip } from '@/types';
import { MapPin, Calendar, Compass, ShieldAlert, Bus, Star, DollarSign, Users, ArrowRight } from 'lucide-react';
import { useDestination } from '@/lib/swr/hooks';

export default function DestinationDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { destination, associatedTrips: trips, isLoading, error, mutate } = useDestination(slug);

  const costStats = {
    Solo: 3500,
    Couple: 6000,
    Family: 10000,
    Group: 14000,
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen pt-36 pb-20 bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Loading Destination Details...</p>
        </div>
      </div>
    );
  }

  if (error && !destination) {
    return (
      <div className="pt-36 pb-20 text-center bg-slate-50 min-h-screen">
        <h2 className="font-display text-3xl font-bold text-slate-900 uppercase">Unable to Load Destination</h2>
        <p className="text-xs text-rose-600 mt-1">{error?.message || 'Network error occurred.'}</p>
        <button
          onClick={() => mutate()}
          className="mt-4 inline-block px-5 py-2.5 bg-brand-500 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-sm hover:bg-brand-600 transition-all cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="pt-36 pb-20 text-center bg-slate-50 min-h-screen">
        <h2 className="font-display text-3xl font-bold text-slate-900 uppercase">Destination Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested destination does not exist or has been removed.</p>
        <Link href="/destinations" className="mt-4 inline-block text-brand-600 font-bold text-sm">
          &larr; Back to Destinations
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen pt-20">
      {/* Hero Section */}
      <div className="relative h-[450px] w-full overflow-hidden bg-slate-950">
        <Image
          src={destination.heroImage || destination.image}
          alt={destination.name}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="absolute bottom-10 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white z-10">
          <div className="flex items-center space-x-2 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-2">
            <MapPin className="w-4 h-4" />
            <span>{destination.country} {destination.division ? `• ${destination.division}` : ''}</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-extrabold uppercase mb-3 text-shadow-hero">
            {destination.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <span className="px-3.5 py-1 bg-brand-500 text-white rounded-full uppercase">
              {destination.category}
            </span>
            <div className="flex items-center space-x-1 text-amber-300 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
              <Star className="w-4 h-4 fill-current" />
              <span>{destination.avgRating} Rating</span>
            </div>
            <div className="flex items-center space-x-1 text-white/90 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full">
              <Calendar className="w-4 h-4 text-cyan-300" />
              <span>Best Time: {destination.bestVisitingTime}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-10">
            {/* Overview */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="font-display text-2xl font-bold text-slate-900 uppercase mb-4">
                Destination Overview
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-light">
                {destination.description}
              </p>
            </div>

            {/* Transport & Safety */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center space-x-2 text-brand-600 font-bold uppercase text-sm mb-3">
                  <Bus className="w-5 h-5 text-brand-500" />
                  <span>Transport & Logistics</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {destination.transportInfo}
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center space-x-2 text-amber-600 font-bold uppercase text-sm mb-3">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                  <span>Safety Tips & Guidelines</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {destination.safetyTips}
                </p>
              </div>
            </div>

            {/* Shared Community Trips for this destination */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-3xl font-bold text-slate-900 uppercase">
                  Community Trip Reports ({trips.length})
                </h2>
                {trips.length > 0 && (
                  <Link
                    href={`/trips?destination=${destination.slug}`}
                    className="inline-flex items-center space-x-1.5 text-brand-600 hover:text-brand-700 text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    <span>View All Trips</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {trips.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {trips.map((trip: ITrip) => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-3xl text-center border border-slate-100">
                  <p className="text-slate-500 text-sm">Be the first traveller to publish a trip report for {destination.name}!</p>
                  <Link
                    href="/trips/share"
                    className="mt-4 inline-block px-6 py-2.5 bg-brand-500 text-white text-xs font-bold rounded-full uppercase shadow-md"
                  >
                    Share Trip Now
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Dynamic Cost Benchmarks */}
          <div className="space-y-6">
            <div className="bg-darkslate-900 text-white p-6 rounded-3xl shadow-xl border border-white/10">
              <h3 className="font-display text-xl font-bold uppercase tracking-wider mb-2 text-cyan-300">
                Estimated Daily Costs
              </h3>
              <p className="text-xs text-slate-400 font-light mb-6">
                Calculated from real traveler submissions in BDT (৳)
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center space-x-2.5 text-xs font-semibold">
                    <Users className="w-4 h-4 text-brand-400" />
                    <span>Solo Explorer</span>
                  </div>
                  <span className="font-display text-lg font-bold text-emerald-400">
                    ৳{costStats.Solo.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center space-x-2.5 text-xs font-semibold">
                    <Users className="w-4 h-4 text-brand-400" />
                    <span>Couple Escape</span>
                  </div>
                  <span className="font-display text-lg font-bold text-emerald-400">
                    ৳{costStats.Couple.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center space-x-2.5 text-xs font-semibold">
                    <Users className="w-4 h-4 text-brand-400" />
                    <span>Family Vacation</span>
                  </div>
                  <span className="font-display text-lg font-bold text-emerald-400">
                    ৳{costStats.Family.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center space-x-2.5 text-xs font-semibold">
                    <Users className="w-4 h-4 text-brand-400" />
                    <span>Group Adventure</span>
                  </div>
                  <span className="font-display text-lg font-bold text-emerald-400">
                    ৳{costStats.Group.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <Link
                  href="/trips/share"
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
                >
                  <span>Share Your Trip to {destination.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
