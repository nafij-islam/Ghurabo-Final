'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle, XCircle, Clock, Compass, AlertTriangle, UserCheck, ShieldAlert, Star, MapPin } from 'lucide-react';
import { ITrip, IUser, IDestination } from '@/types';

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [pendingTrips, setPendingTrips] = useState<ITrip[]>([]);
  const [publishedTrips, setPublishedTrips] = useState<ITrip[]>([]);
  const [destinations, setDestinations] = useState<IDestination[]>([]);
  const [stats, setStats] = useState({
    totalTrips: 0,
    pendingApprovals: 0,
    totalUsers: 4,
    totalDestinations: 6,
    totalGalleryImages: 6,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check logged in user from /api/auth/me (MongoDB Atlas real-time check)
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
          if (data.user.role === 'admin') {
            fetchAdminData();
          }
        }
        setCheckingAuth(false);
      })
      .catch(() => setCheckingAuth(false));
  }, []);

  const fetchAdminData = () => {
    setLoading(true);
    fetch('/api/admin/trips')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPendingTrips(data.pendingTrips || []);
          setPublishedTrips(data.publishedTrips || []);
          if (data.stats) setStats(data.stats);
        }
        setLoading(false);
      });

    fetch('/api/admin/destinations')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDestinations(data.destinations || []);
        }
      });
  };

  const handleAction = async (tripId: string, action: 'approve' | 'reject' | 'verify' | 'togglePopular') => {
    try {
      const res = await fetch('/api/admin/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId, action }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      }
    } catch (err) {}
  };

  const togglePopularDestination = async (destinationId: string, currentPopular: boolean) => {
    try {
      const res = await fetch('/api/admin/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationId, isPopular: !currentPopular }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      }
    } catch (err) {}
  };

  if (checkingAuth) {
    return (
      <div className="w-full min-h-screen pt-32 pb-20 bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Verifying Admin Role in MongoDB Atlas...</p>
        </div>
      </div>
    );
  }

  // Case 1: User Not Logged In
  if (!currentUser) {
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
              Please sign in to your account first to access the Admin Moderation Desk.
            </p>
          </div>

          <Link
            href="/auth/login"
            className="inline-block w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg transition-all"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  // Case 2: Logged in user does not have role: 'admin'
  if (currentUser.role !== 'admin') {
    return (
      <div className="w-full min-h-screen pt-32 pb-20 bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-purple-950/40 opacity-70 pointer-events-none" />
        <div className="max-w-lg w-full bg-slate-900/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-rose-500/30 text-white relative z-10 space-y-6 text-center">
          <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-2xl mx-auto flex items-center justify-center border border-rose-500/30">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-white">Access Denied</h1>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              Logged in as <span className="font-bold text-brand-400">{currentUser.email}</span> (Role: <span className="font-bold uppercase text-amber-400">{currentUser.role || 'traveller'}</span>).
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-left text-xs space-y-2 text-slate-300">
            <div className="font-bold uppercase text-amber-400 flex items-center space-x-1.5">
              <span>💡 How to get Admin Access:</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              In your <b>MongoDB Atlas Database</b>, go to the <code>users</code> collection, find your user account (<code>{currentUser.email}</code>), and change the <code>role</code> field value from <code>"traveller"</code> to <code>"admin"</code>. Refresh this page to get instant full Admin access!
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/dashboard"
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all"
            >
              Go to Dashboard
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-lg"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Logged in user has role === 'admin'
  return (
    <div className="w-full pt-28 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <div className="bg-darkslate-900 text-white p-8 rounded-3xl shadow-xl mb-10 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold uppercase text-white">Admin Moderation Desk</h1>
              <p className="text-xs text-slate-300 font-light mt-1">Review community trip submissions, mark Popular Destinations for homepage, and verify badges.</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-full border border-slate-700 flex items-center space-x-2">
              <UserCheck className="w-3.5 h-3.5 text-brand-400" />
              <span>{currentUser.name} ({currentUser.email})</span>
            </div>

            <span className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full uppercase">
              Role: Admin
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Pending Approvals</span>
            <span className="font-display text-4xl font-extrabold text-amber-600">{pendingTrips.length}</span>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Published Trips</span>
            <span className="font-display text-4xl font-extrabold text-brand-600">{publishedTrips.length}</span>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Total Explorers</span>
            <span className="font-display text-4xl font-extrabold text-slate-900">{stats.totalUsers}</span>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Destinations</span>
            <span className="font-display text-4xl font-extrabold text-slate-900">{stats.totalDestinations}</span>
          </div>
        </div>

        {/* Popular Destinations Controls for Homepage */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 uppercase flex items-center space-x-2">
                <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                <span>Homepage Popular Destinations Controls</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select destinations to feature under "POPULAR DESTINATIONS" section on the Homepage.
              </p>
            </div>
            <span className="px-3.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase">
              {destinations.filter((d) => d.isPopular).length} Popular Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {destinations.map((dest) => (
              <div
                key={dest.id || (dest as any)._id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  dest.isPopular
                    ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/40'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-12 h-12 rounded-xl object-cover border border-white shadow-sm flex-shrink-0"
                  />
                  <div className="truncate">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{dest.name}</h4>
                    <span className="text-[10px] text-slate-500">{dest.country}</span>
                  </div>
                </div>

                <button
                  onClick={() => togglePopularDestination(dest.id || (dest as any)._id, Boolean(dest.isPopular))}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition-all flex items-center space-x-1 flex-shrink-0 cursor-pointer ${
                    dest.isPopular
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                      : 'bg-white hover:bg-amber-100 text-slate-700 border border-slate-300'
                  }`}
                >
                  <Star className={`w-3 h-3 ${dest.isPopular ? 'fill-white' : ''}`} />
                  <span>{dest.isPopular ? 'Popular' : 'Mark Popular'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals Queue */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-10">
          <h2 className="font-display text-2xl font-bold text-slate-900 uppercase mb-6 flex items-center space-x-2">
            <Clock className="w-6 h-6 text-amber-500" />
            <span>Pending Approvals Queue ({pendingTrips.length})</span>
          </h2>

          {pendingTrips.length > 0 ? (
            <div className="space-y-6">
              {pendingTrips.map((trip) => (
                <div key={trip.id || (trip as any)._id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="px-2.5 py-0.5 bg-brand-500 text-white font-bold rounded-full uppercase">
                        {trip.travelType}
                      </span>
                      <span className="text-slate-500">• Submitted by {trip.userName}</span>
                      <span className="text-slate-400">({new Date(trip.createdAt).toLocaleDateString()})</span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-slate-900">{trip.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 font-light">{trip.summary}</p>
                    <div className="text-xs font-semibold text-brand-600">
                      Destination: {trip.destinationName} | Per Person Cost: ${trip.costBreakdown?.perPersonCost || 120}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
                    <button
                      onClick={() => handleAction(trip.id || (trip as any)._id, 'approve')}
                      className="flex items-center space-x-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase rounded-full shadow transition-all cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>

                    <button
                      onClick={() => handleAction(trip.id || (trip as any)._id, 'reject')}
                      className="flex items-center space-x-1.5 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase rounded-full shadow transition-all cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs font-medium">
              ✓ No pending trip submissions requiring review right now.
            </div>
          )}
        </div>

        {/* Published Trips Directory */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="font-display text-2xl font-bold text-slate-900 uppercase mb-6 flex items-center space-x-2">
            <Compass className="w-6 h-6 text-brand-500" />
            <span>Published Trips Directory ({publishedTrips.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedTrips.map((trip) => (
              <div key={trip.id || (trip as any)._id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-brand-600">{trip.destinationName}</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded-full">Approved</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{trip.title}</h4>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-500">
                  <span>{trip.userName}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAction(trip.id || (trip as any)._id, 'verify')}
                      className={`px-3 py-1 text-[11px] font-bold rounded-full cursor-pointer ${
                        trip.isVerified ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700 hover:bg-amber-100'
                      }`}
                    >
                      {trip.isVerified ? '✓ Verified' : '+ Verify'}
                    </button>

                    <button
                      onClick={() => handleAction(trip.id || (trip as any)._id, 'togglePopular')}
                      className={`px-3 py-1 text-[11px] font-bold rounded-full cursor-pointer ${
                        trip.isPopular ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-purple-100'
                      }`}
                    >
                      {trip.isPopular ? '★ Popular' : '+ Popular'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
