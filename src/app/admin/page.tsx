'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { ITrip, IDestination } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { adminApi } from '@/lib/api/admin.api';
import { tripsApi } from '@/lib/api/trips.api';
import { destinationsApi } from '@/lib/api/destinations.api';
import { adaptBackendTripToITrip, adaptBackendDestinationToIDestination } from '@/lib/api/adapters';
import CurrencyControlCard from '@/components/admin/CurrencyControlCard';
import DestinationsModerationCard from '@/components/admin/DestinationsModerationCard';
import PendingTripsQueue from '@/components/admin/PendingTripsQueue';
import PublishedTripsDirectory from '@/components/admin/PublishedTripsDirectory';

export default function AdminPage() {
  const { user, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [pendingTrips, setPendingTrips] = useState<ITrip[]>([]);
  const [publishedTrips, setPublishedTrips] = useState<ITrip[]>([]);
  const [destinations, setDestinations] = useState<IDestination[]>([]);

  const fetchAdminData = async () => {
    try {
      const [pendingRes, publishedRes, destRes] = await Promise.allSettled([
        adminApi.getPendingTrips({ limit: 50 }),
        tripsApi.getTrips({ limit: 50 }),
        destinationsApi.getDestinations({ limit: 50 }),
      ]);

      if (pendingRes.status === 'fulfilled' && pendingRes.value?.data) {
        setPendingTrips(pendingRes.value.data.map(adaptBackendTripToITrip));
      }
      if (publishedRes.status === 'fulfilled' && publishedRes.value?.data) {
        setPublishedTrips(publishedRes.value.data.map(adaptBackendTripToITrip));
      }
      if (destRes.status === 'fulfilled' && destRes.value?.data) {
        setDestinations(destRes.value.data.map(adaptBackendDestinationToIDestination));
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const handleAction = async (tripId: string, action: 'approve' | 'reject' | 'verify' | 'togglePopular') => {
    try {
      if (action === 'approve') {
        await adminApi.updateTripStatus(tripId, 'APPROVED');
      } else if (action === 'reject') {
        await adminApi.updateTripStatus(tripId, 'REJECTED');
      } else if (action === 'verify') {
        const trip = publishedTrips.find((t) => t.id === tripId);
        await adminApi.toggleTripVerified(tripId, !trip?.isVerified);
      } else if (action === 'togglePopular') {
        const trip = publishedTrips.find((t) => t.id === tripId);
        await adminApi.toggleTripFeatured(tripId, !trip?.isPopular);
      }
      await fetchAdminData();
    } catch (err) {
      console.error(`Admin action ${action} failed:`, err);
    }
  };

  const handleTogglePopularDestination = async (destinationId: string) => {
    try {
      const dest = destinations.find((d) => d.id === destinationId);
      await adminApi.toggleDestinationFeatured(destinationId, !dest?.isPopular);
      await fetchAdminData();
    } catch (err) {
      console.error('Failed to toggle destination popularity:', err);
    }
  };

  if (authLoading) {
    return (
      <div className="w-full min-h-screen pt-32 pb-20 bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Verifying Admin Role...</p>
        </div>
      </div>
    );
  }

  // Case 1: User Not Logged In
  if (!isAuthenticated || !user) {
    return (
      <div className="w-full min-h-screen pt-32 pb-20 bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-purple-950/40 opacity-70 pointer-events-none" />
        <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-indigo-500/30 text-white relative z-10 text-center space-y-6">
          <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl mx-auto flex items-center justify-center border border-amber-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-white">Authentication Required</h1>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              You must be logged in with an administrator account to access the Ghurabo moderation panel.
            </p>
          </div>
          <div className="pt-2 space-y-3">
            <Link
              href="/auth/login?redirect=/admin"
              className="w-full block py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
            >
              Sign In as Admin
            </Link>
            <Link
              href="/"
              className="w-full block py-3.5 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs uppercase rounded-xl border border-white/10 transition-all"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Logged In but Not Admin
  if (!isAdmin) {
    return (
      <div className="w-full min-h-screen pt-32 pb-20 bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-slate-950 to-slate-950 opacity-70 pointer-events-none" />
        <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-red-500/30 text-white relative z-10 text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-2xl mx-auto flex items-center justify-center border border-red-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-white">Access Denied</h1>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              Your account <span className="text-white font-semibold">({user.email})</span> has the role{' '}
              <span className="text-brand-300 font-semibold uppercase">{user.role}</span>. Administrator privileges are required to moderate community content.
            </p>
          </div>
          <div className="pt-2 space-y-3">
            <Link
              href="/dashboard"
              className="w-full block py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
            >
              Go to Traveller Dashboard
            </Link>
            <Link
              href="/"
              className="w-full block py-3.5 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs uppercase rounded-xl border border-white/10 transition-all"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pt-28 pb-20 bg-slate-50">
      {/* Admin Header */}
      <div className="bg-darkslate-900 text-white py-12 px-4 mb-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-brand-300 text-xs font-bold uppercase tracking-widest mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>COMMUNITY MANAGEMENT</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold uppercase">
              Admin Moderation Panel
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Logged in as <span className="text-white font-semibold">{user.email}</span> (Role: {user.role})
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Published Trips</span>
            <span className="font-display text-4xl font-extrabold text-brand-600">{publishedTrips.length}</span>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Pending Approvals</span>
            <span className="font-display text-4xl font-extrabold text-amber-500">{pendingTrips.length}</span>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Total Explorers</span>
            <span className="font-display text-4xl font-extrabold text-slate-900">3</span>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Destinations</span>
            <span className="font-display text-4xl font-extrabold text-slate-900">{destinations.length}</span>
          </div>
        </div>

        {/* Currency Exchange Rate Control Card */}
        <CurrencyControlCard />

        {/* Popular Destinations Controls for Homepage */}
        <DestinationsModerationCard
          destinations={destinations}
          onTogglePopular={handleTogglePopularDestination}
        />

        {/* Pending Approvals Queue */}
        <PendingTripsQueue
          pendingTrips={pendingTrips}
          onAction={handleAction}
        />

        {/* Published Trips Directory */}
        <PublishedTripsDirectory
          publishedTrips={publishedTrips}
          onAction={handleAction}
        />
      </div>
    </div>
  );
}
