'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle, XCircle, Clock, Users, Compass, Eye, AlertCircle } from 'lucide-react';
import { ITrip } from '@/types';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [pendingTrips, setPendingTrips] = useState<ITrip[]>([]);
  const [publishedTrips, setPublishedTrips] = useState<ITrip[]>([]);
  const [stats, setStats] = useState({
    totalTrips: 0,
    pendingApprovals: 0,
    totalUsers: 4,
    totalDestinations: 6,
    totalGalleryImages: 6,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('ghurabo_admin_auth');
    if (saved === 'true') {
      setIsAuthenticated(true);
      fetchAdminData();
    }
  }, []);

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validPasscodes = ['ghurabo2026', 'admin2026', '123456', 'admin'];
    if (validPasscodes.includes(passcode.trim())) {
      setIsAuthenticated(true);
      localStorage.setItem('ghurabo_admin_auth', 'true');
      setPasscodeError('');
      fetchAdminData();
    } else {
      setPasscodeError('Invalid Admin Passcode! Try: ghurabo2026 or 123456');
    }
  };

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
  };

  const handleAction = async (tripId: string, action: 'approve' | 'reject' | 'verify') => {
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

  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen pt-32 pb-20 bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-purple-950/40 opacity-70 pointer-events-none" />
        <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-indigo-500/30 text-white relative z-10 space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-gradient-to-tr from-brand-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg border border-brand-400/40">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-white">Admin Lock Screen</h1>
            <p className="text-xs text-slate-400 font-light">Enter system passcode to access Moderation Desk</p>
          </div>

          {passcodeError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-semibold text-center">
              {passcodeError}
            </div>
          )}

          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Enter Admin Passcode</label>
              <input
                type="password"
                required
                placeholder="Passcode (e.g. ghurabo2026)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full p-3.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg transition-all"
            >
              Unlock Admin Desk
            </button>
          </form>

          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50 text-[11px] text-slate-400 text-center">
            💡 Default Passcode: <span className="text-brand-400 font-bold">ghurabo2026</span> or <span className="text-brand-400 font-bold">123456</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pt-28 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <div className="bg-darkslate-900 text-white p-8 rounded-3xl shadow-xl mb-10 border border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold uppercase text-white">Admin Moderation Desk</h1>
              <p className="text-xs text-slate-300 font-light mt-1">Review community trip submissions, manage verification requests, and maintain platform standards.</p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full uppercase">
            System Admin Active
          </span>
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

        {/* Pending Approvals Queue */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-10">
          <h2 className="font-display text-2xl font-bold text-slate-900 uppercase mb-6 flex items-center space-x-2">
            <Clock className="w-6 h-6 text-amber-500" />
            <span>Pending Approvals Queue ({pendingTrips.length})</span>
          </h2>

          {pendingTrips.length > 0 ? (
            <div className="space-y-6">
              {pendingTrips.map((trip) => (
                <div key={trip.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
                      onClick={() => handleAction(trip.id, 'approve')}
                      className="flex items-center space-x-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase rounded-full shadow transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>

                    <button
                      onClick={() => handleAction(trip.id, 'reject')}
                      className="flex items-center space-x-1.5 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase rounded-full shadow transition-all"
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

        {/* Published Trips Management */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="font-display text-2xl font-bold text-slate-900 uppercase mb-6 flex items-center space-x-2">
            <Compass className="w-6 h-6 text-brand-500" />
            <span>Published Trips Directory ({publishedTrips.length})</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-900 uppercase font-bold text-[11px]">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Trip Title</th>
                  <th className="p-3.5">Author</th>
                  <th className="p-3.5">Destination</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {publishedTrips.map((t) => (
                  <tr key={t.id}>
                    <td className="p-3.5 font-bold text-slate-900">{t.title}</td>
                    <td className="p-3.5">{t.userName}</td>
                    <td className="p-3.5">{t.destinationName}</td>
                    <td className="p-3.5">
                      {t.isVerified ? (
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 font-medium rounded-full text-[10px]">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      {!t.isVerified && (
                        <button
                          onClick={() => handleAction(t.id, 'verify')}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-full text-[10px] font-bold uppercase"
                        >
                          Verify Badge
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
