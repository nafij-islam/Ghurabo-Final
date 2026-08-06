'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import TripCard from '@/components/cards/TripCard';
import { IDestination, ITrip } from '@/types';
import { MapPin, Calendar, Compass, ShieldAlert, Bus, Star, DollarSign, Users, ArrowRight } from 'lucide-react';

export default function DestinationDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [destination, setDestination] = useState<IDestination | null>(null);
  const [trips, setTrips] = useState<ITrip[]>([]);
  const [costStats, setCostStats] = useState<{ Solo: number; Couple: number; Family: number; Group: number }>({
    Solo: 120,
    Couple: 250,
    Family: 450,
    Group: 600,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetch(`/api/destinations/${slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setDestination(data.destination);
            setTrips(data.trips || []);
            if (data.dynamicCostStats) {
              setCostStats(data.dynamicCostStats);
            }
          }
          setLoading(false);
        });
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 text-center text-slate-500 font-medium">
        Loading destination details...
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="pt-32 pb-20 text-center">
        <h2 className="font-display text-3xl font-bold text-slate-900 uppercase">Destination Not Found</h2>
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
        <img
          src={destination.heroImage || destination.image}
          alt={destination.name}
          className="w-full h-full object-cover opacity-80"
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
              <h2 className="font-display text-3xl font-bold text-slate-900 uppercase mb-6">
                Community Trip Reports ({trips.length})
              </h2>

              {trips.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {trips.map((trip) => (
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
                Community Cost Benchmarks
              </h3>
              <p className="text-white/60 text-xs mb-6 font-light">
                Calculated automatically from real approved user trip expenses.
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-brand-300" />
                    <span className="text-xs font-semibold">Solo Backpacker</span>
                  </div>
                  <span className="font-extrabold text-cyan-300 text-sm">${costStats.Solo} / person</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-brand-300" />
                    <span className="text-xs font-semibold">Couple Escape</span>
                  </div>
                  <span className="font-extrabold text-cyan-300 text-sm">${costStats.Couple} / person</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-brand-300" />
                    <span className="text-xs font-semibold">Family Tour</span>
                  </div>
                  <span className="font-extrabold text-cyan-300 text-sm">${costStats.Family} / person</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-brand-300" />
                    <span className="text-xs font-semibold">Group & Friends</span>
                  </div>
                  <span className="font-extrabold text-cyan-300 text-sm">${costStats.Group} / person</span>
                </div>
              </div>

              <Link
                href={`/trips/share?destination=${destination.id}`}
                className="mt-6 w-full flex items-center justify-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider transition-all"
              >
                <span>Add Your Trip Expense</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
