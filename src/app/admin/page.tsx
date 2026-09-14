'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  ShieldAlert,
  Compass,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Mail,
  Coins,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Server,
  Layers,
} from 'lucide-react';
import { ITrip } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { adminApi } from '@/lib/api/admin.api';
import { tripsApi } from '@/lib/api/trips.api';
import { TripStats } from '@/lib/api/api.types';
import { adaptBackendTripToITrip } from '@/lib/api/adapters';
import { AdminLayout, AdminPageHeader, AdminTab } from '@/components/admin/layout';

const AdminPanelSkeleton = () => (
  <div className="w-full h-80 rounded-2xl bg-white border border-slate-200/80 animate-pulse flex flex-col items-center justify-center p-8 space-y-3">
    <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Loading Panel Content...</p>
  </div>
);

const CurrencyControlCard = dynamic(() => import('@/components/admin/CurrencyControlCard'), {
  loading: AdminPanelSkeleton,
});
const PendingTripsQueue = dynamic(() => import('@/components/admin/PendingTripsQueue'), {
  loading: AdminPanelSkeleton,
});
const PublishedTripsDirectory = dynamic(() => import('@/components/admin/PublishedTripsDirectory'), {
  loading: AdminPanelSkeleton,
});
const AllTripsManager = dynamic(() => import('@/components/admin/AllTripsManager'), {
  loading: AdminPanelSkeleton,
});
const AllUsersManager = dynamic(() => import('@/components/admin/AllUsersManager'), {
  loading: AdminPanelSkeleton,
});
const NewsletterSubscribersManager = dynamic(() => import('@/components/admin/NewsletterSubscribersManager'), {
  loading: AdminPanelSkeleton,
});

type TripsSubTab = 'all' | 'pending' | 'published';

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as AdminTab) || 'overview';

  const { user, isAuthenticated, isAdmin, loading: authLoading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [tripsSubTab, setTripsSubTab] = useState<TripsSubTab>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [pendingTrips, setPendingTrips] = useState<ITrip[]>([]);
  const [publishedTrips, setPublishedTrips] = useState<ITrip[]>([]);
  const [tripStats, setTripStats] = useState<TripStats>({
    total: 0,
    approved: 0,
    pending: 0,
    suspended: 0,
    rejected: 0,
    draft: 0,
  });

  // Sync tab with URL query parameter without full reload
  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url.toString());
  };

  const fetchAdminData = async () => {
    setIsRefreshing(true);
    try {
      const [pendingRes, publishedRes, statsRes] = await Promise.allSettled([
        adminApi.getPendingTrips({ limit: 50 }),
        tripsApi.getTrips({ limit: 50 }),
        adminApi.getTripStats(),
      ]);

      if (pendingRes.status === 'fulfilled' && pendingRes.value?.data) {
        setPendingTrips(pendingRes.value.data.map(adaptBackendTripToITrip));
      }
      if (publishedRes.status === 'fulfilled' && publishedRes.value?.data) {
        setPublishedTrips(publishedRes.value.data.map(adaptBackendTripToITrip));
      }
      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setTripStats(statsRes.value);
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setIsRefreshing(false);
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

  // State 1: Verifying authentication
  if (authLoading) {
    return (
      <div className="w-full min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-300 font-semibold uppercase tracking-widest">
            Verifying Admin Privileges...
          </p>
        </div>
      </div>
    );
  }

  // State 2: User Not Logged In
  if (!isAuthenticated || !user) {
    return (
      <div className="w-full min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-purple-950/40 opacity-70 pointer-events-none" />
        <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-indigo-500/30 text-white relative z-10 text-center space-y-6">
          <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl mx-auto flex items-center justify-center border border-amber-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-white">
              Authentication Required
            </h1>
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

  // State 3: Logged In but Not Admin
  if (!isAdmin) {
    return (
      <div className="w-full min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-slate-950 to-slate-950 opacity-70 pointer-events-none" />
        <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-red-500/30 text-white relative z-10 text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-2xl mx-auto flex items-center justify-center border border-red-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-white">
              Access Denied
            </h1>
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

  const pendingCount = tripStats.pending || pendingTrips.length;
  const approvedCount = tripStats.approved || publishedTrips.length;
  const totalTripsCount = tripStats.total || (publishedTrips.length + pendingTrips.length);

  return (
    <AdminLayout
      activeTab={activeTab}
      onSelectTab={handleTabChange}
      pendingTripsCount={pendingCount}
      user={user}
      onLogout={logout}
      onRefresh={fetchAdminData}
      isRefreshing={isRefreshing}
    >
      {/* ======================= TAB: OVERVIEW ======================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          <AdminPageHeader
            title="Dashboard Overview"
            subtitle="Real-time monitor of community itineraries, review queues, user accounts, and platform parameters."
            badge="LIVE WORKSPACE"
            badgeColor="emerald"
            actions={
              <button
                type="button"
                onClick={() => handleTabChange('trips')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
              >
                <span>Manage Trips</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          />

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Trips */}
            <div
              onClick={() => handleTabChange('trips')}
              className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 hover:border-brand-500/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Total Trips
                </span>
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                  <Compass className="w-4 h-4" />
                </div>
              </div>
              <div className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">
                {totalTripsCount}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Submitted itineraries
              </p>
            </div>

            {/* Approved Trips */}
            <div
              onClick={() => {
                handleTabChange('trips');
                setTripsSubTab('published');
              }}
              className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 hover:border-emerald-500/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Approved
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="font-display text-3xl font-extrabold text-emerald-600 tracking-tight">
                {approvedCount}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Live on public website
              </p>
            </div>

            {/* Pending Review */}
            <div
              onClick={() => {
                handleTabChange('trips');
                setTripsSubTab('pending');
              }}
              className={`p-5 rounded-2xl shadow-xs border transition-all cursor-pointer group ${
                pendingCount > 0
                  ? 'bg-amber-50/60 border-amber-300 hover:border-amber-400'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Pending Review
                </span>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    pendingCount > 0
                      ? 'bg-amber-500 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="font-display text-3xl font-extrabold text-amber-600 tracking-tight flex items-center gap-2">
                <span>{pendingCount}</span>
                {pendingCount > 0 && (
                  <span className="text-[10px] bg-amber-500 text-white font-sans font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Action
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                {pendingCount > 0 ? 'Awaiting moderator action' : 'Queue is all clear'}
              </p>
            </div>

            {/* Suspended */}
            <div
              onClick={() => handleTabChange('trips')}
              className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 hover:border-rose-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Suspended
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="font-display text-3xl font-extrabold text-rose-600 tracking-tight">
                {tripStats.suspended || 0}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Moderated / suspended
              </p>
            </div>
          </div>

          {/* Pending Submissions Queue Preview */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span>Pending Trip Review Queue</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                    {pendingTrips.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Itineraries submitted by travellers awaiting moderator approval before appearing publicly.
                </p>
              </div>

              {pendingTrips.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    handleTabChange('trips');
                    setTripsSubTab('pending');
                  }}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>View All in Queue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {pendingTrips.length > 0 ? (
              <div className="space-y-4">
                {pendingTrips.slice(0, 4).map((trip) => (
                  <div
                    key={trip.id}
                    className="p-5 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors"
                  >
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="px-2 py-0.5 bg-brand-500 text-white font-bold rounded-full uppercase text-[10px]">
                          {trip.travelType}
                        </span>
                        <span className="text-slate-500">• Submitted by <span className="font-semibold text-slate-700">{trip.userName}</span></span>
                        <span className="text-slate-400">({new Date(trip.createdAt).toLocaleDateString()})</span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900 leading-snug">{trip.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2">{trip.summary}</p>
                      <div className="text-xs font-semibold text-brand-600">
                        Destination: {trip.destinationName} | Per Person Cost: ৳{trip.costBreakdown?.perPersonCost || 0}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2.5 w-full md:w-auto justify-end shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAction(trip.id, 'approve')}
                        className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAction(trip.id, 'reject')}
                        className="flex items-center space-x-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">All caught up!</p>
                <p className="text-xs text-slate-400 mt-0.5">No pending trip submissions requiring review right now.</p>
              </div>
            )}
          </div>

          {/* Currency Controls Quick Panel */}
          <CurrencyControlCard />
        </div>
      )}

      {/* ======================= TAB: TRIPS ======================= */}
      {activeTab === 'trips' && (
        <div className="space-y-6 animate-fadeIn">
          <AdminPageHeader
            title="Trips Directory & Moderation"
            subtitle="Search, moderate, verify, feature, or convert community travel itineraries."
            badge="CONTENT MODERATION"
            badgeColor="brand"
          />

          {/* Subtabs Pill Switcher */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-200/60 rounded-2xl w-fit">
            <button
              type="button"
              onClick={() => setTripsSubTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                tripsSubTab === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Trips Directory
            </button>
            <button
              type="button"
              onClick={() => setTripsSubTab('pending')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                tripsSubTab === 'pending'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Pending Queue</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] bg-amber-500 text-white rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setTripsSubTab('published')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                tripsSubTab === 'published'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Published Directory ({publishedTrips.length})
            </button>
          </div>

          {tripsSubTab === 'all' && (
            <AllTripsManager onDataChanged={fetchAdminData} />
          )}

          {tripsSubTab === 'pending' && (
            <PendingTripsQueue
              pendingTrips={pendingTrips}
              onAction={handleAction}
            />
          )}

          {tripsSubTab === 'published' && (
            <PublishedTripsDirectory
              publishedTrips={publishedTrips}
              onAction={handleAction}
            />
          )}
        </div>
      )}

      {/* ======================= TAB: USERS ======================= */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fadeIn">
          <AdminPageHeader
            title="Community & User Directory"
            subtitle="Search traveller accounts, assign administrator roles, verify badges, and moderate members."
            badge="USER DIRECTORY"
            badgeColor="purple"
          />

          <AllUsersManager />
        </div>
      )}

      {/* ======================= TAB: NEWSLETTER ======================= */}
      {activeTab === 'newsletter' && (
        <div className="space-y-6 animate-fadeIn">
          <AdminPageHeader
            title="Newsletter Subscribers"
            subtitle="Manage email subscription list, filter subscribers, and export contacts."
            badge="GROWTH & EMAIL"
            badgeColor="brand"
          />

          <NewsletterSubscribersManager />
        </div>
      )}

      {/* ======================= TAB: SETTINGS ======================= */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-fadeIn">
          <AdminPageHeader
            title="System & Currency Settings"
            subtitle="Configure USD / BDT conversion rates, inspect backend connections, and view environment configurations."
            badge="SYSTEM CONFIG"
            badgeColor="slate"
          />

          <CurrencyControlCard />

          {/* System Environment Information Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200/80">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Server className="w-4 h-4 text-brand-500" />
              <span>System & Environment Diagnostics</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Frontend Version
                </span>
                <span className="text-sm font-bold text-slate-800">Ghurabo Production v2.0</span>
                <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">Next.js 14 App Router</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Backend API Target
                </span>
                <span className="text-sm font-mono font-bold text-slate-800 truncate block">
                  {process.env.NEXT_PUBLIC_API_URL || 'api.ghurabo.com'}
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">REST API Connected</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Current Session
                </span>
                <span className="text-sm font-bold text-slate-800 truncate block">
                  {user.email}
                </span>
                <span className="text-[10px] text-brand-600 font-bold uppercase tracking-wider block mt-0.5">
                  ROLE: {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminPanelSkeleton />}>
      <AdminDashboardContent />
    </Suspense>
  );
}
