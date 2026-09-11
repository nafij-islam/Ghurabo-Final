'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Compass,
  Search,
  RefreshCw,
  Ban,
  RotateCcw,
  Trash2,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  DollarSign,
  User,
  MapPin,
  X,
  Clock,
  ShieldCheck,
  AlertOctagon,
} from 'lucide-react';
import { ITrip } from '@/types';
import { adminApi } from '@/lib/api/admin.api';
import { adaptBackendTripToITrip } from '@/lib/api/adapters';
import { TripStats } from '@/lib/api/api.types';

interface AllTripsManagerProps {
  onDataChanged?: () => void;
}

type FilterStatus = 'ALL' | 'APPROVED' | 'PENDING' | 'SUSPENDED' | 'REJECTED';
type SortOption = 'newest' | 'oldest' | 'popular' | 'highest-cost' | 'lowest-cost';

export default function AllTripsManager({ onDataChanged }: AllTripsManagerProps) {
  const [trips, setTrips] = useState<ITrip[]>([]);
  const [stats, setStats] = useState<TripStats>({
    total: 0,
    approved: 0,
    pending: 0,
    suspended: 0,
    rejected: 0,
    draft: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filters and Pagination
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const limit = 12;

  // Modals state
  const [tripToDelete, setTripToDelete] = useState<ITrip | null>(null);
  const [tripToSuspend, setTripToSuspend] = useState<ITrip | null>(null);
  const [suspendReason, setSuspendReason] = useState<string>('');

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllTrips({
        page: currentPage,
        limit,
        status: selectedStatus,
        search: searchQuery.trim() || undefined,
        sort: sortOption,
      });

      if (res && res.data) {
        setTrips(res.data.map(adaptBackendTripToITrip));
        setTotalCount(res.meta?.total || 0);
        setTotalPages(res.meta?.totalPages || 1);
      }

      if (res && res.stats) {
        setStats(res.stats);
      } else {
        const globalStats = await adminApi.getTripStats();
        if (globalStats) setStats(globalStats);
      }
    } catch (err) {
      console.error('Failed to load trips for admin:', err);
      setFeedback({ type: 'error', message: 'Failed to load trips from server' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, selectedStatus, searchQuery, sortOption]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // Clear notification after 4s
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Handle Suspend / Unsuspend
  const handleConfirmSuspend = async () => {
    if (!tripToSuspend) return;
    setActionLoading(tripToSuspend.id);
    try {
      await adminApi.toggleTripSuspend(tripToSuspend.id, true, suspendReason.trim() || 'Suspended by Administrator');
      setFeedback({
        type: 'success',
        message: `Trip "${tripToSuspend.title}" has been suspended. It is now hidden from public users.`,
      });
      setTripToSuspend(null);
      setSuspendReason('');
      await fetchTrips();
      onDataChanged?.();
    } catch (err) {
      console.error('Failed to suspend trip:', err);
      setFeedback({ type: 'error', message: 'Failed to suspend trip. Please try again.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnsuspend = async (trip: ITrip) => {
    setActionLoading(trip.id);
    try {
      await adminApi.toggleTripSuspend(trip.id, false);
      setFeedback({
        type: 'success',
        message: `Trip "${trip.title}" has been reactivated and is now visible.`,
      });
      await fetchTrips();
      onDataChanged?.();
    } catch (err) {
      console.error('Failed to unsuspend trip:', err);
      setFeedback({ type: 'error', message: 'Failed to reactivate trip' });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!tripToDelete) return;
    setActionLoading(tripToDelete.id);
    try {
      await adminApi.deleteTrip(tripToDelete.id);
      setFeedback({
        type: 'success',
        message: `Trip "${tripToDelete.title}" has been permanently deleted.`,
      });
      setTripToDelete(null);
      await fetchTrips();
      onDataChanged?.();
    } catch (err) {
      console.error('Failed to delete trip:', err);
      setFeedback({ type: 'error', message: 'Failed to delete trip' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 mb-10">
      {/* Header section with Stats Overview */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center space-x-2 text-brand-600 text-xs font-bold uppercase tracking-widest mb-1.5">
            <Compass className="w-4 h-4" />
            <span>COMMUNITY TRIP REGISTRY</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase">
            All Trips Management
          </h2>
          <p className="text-xs text-slate-500 font-normal mt-1">
            Complete overview of all community trips. You can filter, search, suspend, or delete any trip.
          </p>
        </div>

        {/* Global Stats Summary Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Trips</span>
            <span className="font-display text-xl font-extrabold">{stats.total}</span>
          </div>
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-2 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block tracking-wider">Approved</span>
            <span className="font-display text-xl font-extrabold">{stats.approved}</span>
          </div>
          <div className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-2 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-amber-600 block tracking-wider">Pending</span>
            <span className="font-display text-xl font-extrabold">{stats.pending}</span>
          </div>
          <div className="bg-rose-50 text-rose-800 border border-rose-200 px-3 py-2 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-rose-600 block tracking-wider">Suspended</span>
            <span className="font-display text-xl font-extrabold">{stats.suspended}</span>
          </div>
          <div className="bg-slate-100 text-slate-700 px-3 py-2 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Rejected</span>
            <span className="font-display text-xl font-extrabold">{stats.rejected}</span>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`mt-6 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 p-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Controls Bar: Filter Tabs, Search & Sort */}
      <div className="mt-6 space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {(
            [
              { key: 'ALL', label: 'All Trips', count: stats.total },
              { key: 'APPROVED', label: 'Approved', count: stats.approved },
              { key: 'PENDING', label: 'Pending', count: stats.pending },
              { key: 'SUSPENDED', label: 'Suspended', count: stats.suspended },
              { key: 'REJECTED', label: 'Rejected', count: stats.rejected },
            ] as const
          ).map((tab) => {
            const isActive = selectedStatus === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setSelectedStatus(tab.key);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, location or author..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Sort Dropdown */}
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value as SortOption);
                setCurrentPage(1);
              }}
              className="py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
              <option value="highest-cost">Highest Budget</option>
              <option value="lowest-cost">Lowest Budget</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={() => fetchTrips()}
              disabled={loading}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="Refresh Registry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Trips Content */}
      <div className="mt-6">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Loading community trips...
            </p>
          </div>
        ) : trips.length === 0 ? (
          <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 space-y-2">
            <Compass className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-display text-sm font-bold text-slate-700 uppercase">No Trips Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No community trips matched your current filter criteria. Try adjusting the search query or selecting another status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Trip Details</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Destination</th>
                  <th className="py-3.5 px-4">Cost</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trips.map((trip) => {
                  const isSuspended = trip.status === 'suspended';
                  const isApproved = trip.status === 'approved';
                  const isPending = trip.status === 'pending';
                  const isRejected = trip.status === 'rejected';

                  return (
                    <tr
                      key={trip.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSuspended ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* Trip Details */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="flex items-start space-x-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                            {trip.coverImage ? (
                              <img
                                src={trip.coverImage}
                                alt={trip.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Compass className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="space-y-1 min-w-0">
                            <Link
                              href={`/trips/${trip.slug}`}
                              target="_blank"
                              className="font-bold text-slate-900 hover:text-brand-600 line-clamp-1 flex items-center space-x-1 group"
                            >
                              <span>{trip.title}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                              <span className="inline-flex items-center text-brand-600 font-semibold uppercase text-[10px]">
                                {trip.travelType}
                              </span>
                              <span>•</span>
                              <span>{trip.durationDays} Days</span>
                              {trip.isVerified && (
                                <span className="text-amber-600 font-bold flex items-center space-x-0.5">
                                  <span>✓</span>
                                  <span>Verified</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {trip.userAvatar ? (
                            <img
                              src={trip.userAvatar}
                              alt={trip.userName}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                              <User className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <span className="font-semibold text-slate-800">{trip.userName}</span>
                        </div>
                      </td>

                      {/* Destination */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1 text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="font-medium">{trip.destinationName}</span>
                        </div>
                      </td>

                      {/* Cost */}
                      <td className="py-4 px-4 whitespace-nowrap font-semibold text-slate-900">
                        ৳{trip.costBreakdown?.totalCost?.toLocaleString() || '0'}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isSuspended ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full font-bold text-[10px] uppercase">
                            <AlertOctagon className="w-3 h-3" />
                            <span>Suspended</span>
                          </span>
                        ) : isApproved ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-bold text-[10px] uppercase">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approved</span>
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full font-bold text-[10px] uppercase">
                            <Clock className="w-3 h-3" />
                            <span>Pending</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-full font-bold text-[10px] uppercase">
                            <X className="w-3 h-3" />
                            <span>{trip.status}</span>
                          </span>
                        )}
                      </td>

                      {/* Admin Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center space-x-2">
                          {/* Suspend / Unsuspend Button */}
                          {isSuspended ? (
                            <button
                              onClick={() => handleUnsuspend(trip)}
                              disabled={actionLoading === trip.id}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl font-bold text-[11px] transition-all cursor-pointer disabled:opacity-50"
                              title="Reactivate and make public"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Unsuspend</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setTripToSuspend(trip);
                                setSuspendReason('');
                              }}
                              disabled={actionLoading === trip.id}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl font-bold text-[11px] transition-all cursor-pointer disabled:opacity-50"
                              title="Suspend trip from community view"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Suspend</span>
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={() => setTripToDelete(trip)}
                            disabled={actionLoading === trip.id}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-[11px] transition-all cursor-pointer disabled:opacity-50"
                            title="Permanently remove trip"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>

                          {/* View Link */}
                          <Link
                            href={`/trips/${trip.slug}`}
                            target="_blank"
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Open trip in new tab"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">
              Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalCount)} of {totalCount} trips
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl disabled:opacity-40 transition-all cursor-pointer"
              >
                Previous
              </button>
              <span className="font-bold text-slate-700 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl disabled:opacity-40 transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Suspend Confirmation Modal */}
      {tripToSuspend && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center">
              <Ban className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display text-xl font-bold text-slate-900 uppercase">Suspend Community Trip</h3>
              <p className="text-xs text-slate-500">
                Suspending this trip will immediately hide it from public search, explorer feeds, and destination pages.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Trip</span>
              <span className="font-bold text-slate-800 line-clamp-1">{tripToSuspend.title}</span>
              <span className="text-slate-500 block text-[11px] mt-0.5">Author: {tripToSuspend.userName}</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Reason for Suspension (Optional)
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g., Community guideline violation, inappropriate image, inaccurate budget info..."
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setTripToSuspend(null);
                  setSuspendReason('');
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSuspend}
                disabled={actionLoading === tripToSuspend.id}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
              >
                {actionLoading === tripToSuspend.id ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Suspending...</span>
                  </>
                ) : (
                  <>
                    <Ban className="w-4 h-4" />
                    <span>Confirm Suspend</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {tripToDelete && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display text-xl font-bold text-slate-900 uppercase">Permanently Delete Trip</h3>
              <p className="text-xs text-rose-600 font-semibold">
                Warning: This action cannot be reversed!
              </p>
              <p className="text-xs text-slate-500">
                The trip and all its associated comments, bookmark interactions, and photos will be permanently removed.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Trip to be deleted</span>
              <span className="font-bold text-slate-800 line-clamp-1">{tripToDelete.title}</span>
              <span className="text-slate-500 block text-[11px] mt-0.5">Submitted by: {tripToDelete.userName}</span>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setTripToDelete(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoading === tripToDelete.id}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
              >
                {actionLoading === tripToDelete.id ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
