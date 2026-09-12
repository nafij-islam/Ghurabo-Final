'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Users,
  Calendar,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock,
  Send,
  Loader2,
} from 'lucide-react';
import { newsletterApi } from '@/lib/api/newsletter.api';
import {
  NewsletterSubscriber,
  NewsletterStats,
  NewsletterSubscriberStatus,
  NewsletterSource,
} from '@/lib/api/api.types';

type FilterStatus = 'ALL' | 'SUBSCRIBED' | 'UNSUBSCRIBED';
type FilterSource = 'ALL' | 'HOMEPAGE_POPUP' | 'FOOTER' | 'MANUAL_ADMIN' | 'OTHER';
type SortOption = 'newest' | 'oldest' | 'email';

export default function NewsletterSubscribersManager() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('ALL');
  const [selectedSource, setSelectedSource] = useState<FilterSource>('ALL');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const limit = 10;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await newsletterApi.getStats();
      if (res) {
        setStats(res);
      }
    } catch (err) {
      console.error('Failed to fetch newsletter stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await newsletterApi.getSubscribers({
        page: currentPage,
        limit,
        search: debouncedSearch.trim() || undefined,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        source: selectedSource === 'ALL' ? undefined : selectedSource,
        sort: sortOption,
      });

      if (res && res.data) {
        setSubscribers(res.data);
        setTotalCount(res.meta?.total || 0);
        setTotalPages(res.meta?.totalPages || 1);
      }
    } catch (err: any) {
      console.error('Failed to load newsletter subscribers:', err);
      setFeedback({
        type: 'error',
        message: 'Could not load newsletter subscribers. Please try refreshing.',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedStatus, selectedSource, sortOption]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const handleToggleStatus = async (subscriber: NewsletterSubscriber) => {
    const subscriberId = subscriber.id || subscriber._id;
    if (!subscriberId) return;

    const newStatus: NewsletterSubscriberStatus =
      subscriber.status === 'SUBSCRIBED' ? 'UNSUBSCRIBED' : 'SUBSCRIBED';

    setActionLoadingId(subscriberId);
    setFeedback(null);

    try {
      await newsletterApi.updateStatus(subscriberId, newStatus);
      setFeedback({
        type: 'success',
        message: `Subscriber ${subscriber.email} status updated to ${newStatus}.`,
      });
      // Refresh list & stats
      await Promise.all([fetchSubscribers(), fetchStats()]);
    } catch (err: any) {
      console.error('Failed to toggle subscriber status:', err);
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to update subscriber status.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status: NewsletterSubscriberStatus) => {
    if (status === 'SUBSCRIBED') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Active</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
        <XCircle className="w-3 h-3 text-slate-500" />
        <span>Unsubscribed</span>
      </span>
    );
  };

  const getSourceBadge = (source: NewsletterSource) => {
    switch (source) {
      case 'HOMEPAGE_POPUP':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            Homepage Popup
          </span>
        );
      case 'FOOTER':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Footer Form
          </span>
        );
      case 'MANUAL_ADMIN':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Manual Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            {source || 'Other'}
          </span>
        );
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 mb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-100">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold uppercase text-slate-900 tracking-wide">
              Newsletter Subscribers
            </h2>
            <p className="text-xs text-slate-500 font-light">
              Manage email subscriptions, view subscriber sources, and monitor campaign reach.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            fetchStats();
            fetchSubscribers();
          }}
          disabled={loading || statsLoading}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors disabled:opacity-50 self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading || statsLoading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Reach</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <span className="font-display text-3xl font-extrabold text-slate-900">
            {statsLoading ? '...' : stats?.totalSubscribers ?? totalCount}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">All time signups</span>
        </div>

        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="font-display text-3xl font-extrabold text-emerald-600">
            {statsLoading ? '...' : stats?.activeSubscribers ?? '0'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Currently subscribed</span>
        </div>

        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between text-brand-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Joined Today</span>
            <Sparkles className="w-4 h-4 text-brand-500" />
          </div>
          <span className="font-display text-3xl font-extrabold text-brand-600">
            {statsLoading ? '...' : stats?.subscribersToday ?? '0'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Past 24 hours</span>
        </div>

        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">This Month</span>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="font-display text-3xl font-extrabold text-indigo-600">
            {statsLoading ? '...' : stats?.subscribersThisMonth ?? '0'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Calendar month</span>
        </div>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl mb-6 text-xs font-medium flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search email address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as FilterStatus);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBSCRIBED">Subscribed (Active)</option>
            <option value="UNSUBSCRIBED">Unsubscribed</option>
          </select>
        </div>

        {/* Source Filter */}
        <div>
          <select
            value={selectedSource}
            onChange={(e) => {
              setSelectedSource(e.target.value as FilterSource);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="ALL">All Sources</option>
            <option value="HOMEPAGE_POPUP">Homepage Popup</option>
            <option value="FOOTER">Footer Form</option>
            <option value="MANUAL_ADMIN">Manual Admin</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value as SortOption);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="email">Sort: Email A-Z</option>
          </select>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">Email Address</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Source</th>
              <th className="py-3.5 px-4">Subscribed Date</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              /* Loading Skeletons */
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3.5 px-4">
                    <div className="h-4 bg-slate-200 rounded w-48 mb-1" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-4 bg-slate-200 rounded-full w-16" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-4 bg-slate-200 rounded w-24" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-4 bg-slate-200 rounded w-20" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="h-7 bg-slate-200 rounded-lg w-20 ml-auto" />
                  </td>
                </tr>
              ))
            ) : subscribers.length === 0 ? (
              /* Empty State */
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <Mail className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-slate-600">No newsletter subscribers yet.</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {debouncedSearch
                      ? 'No subscribers match your search filter.'
                      : 'When visitors subscribe via popup or footer, they will appear here.'}
                  </p>
                </td>
              </tr>
            ) : (
              /* Subscriber Rows */
              subscribers.map((subscriber) => {
                const subId = subscriber.id || subscriber._id || '';
                const isActing = actionLoadingId === subId;

                return (
                  <tr key={subId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono text-xs">{subscriber.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(subscriber.status)}
                    </td>
                    <td className="py-3.5 px-4">
                      {getSourceBadge(subscriber.source)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {formatDate(subscriber.subscribedAt || subscriber.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(subscriber)}
                        disabled={isActing}
                        className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all disabled:opacity-50 cursor-pointer ${
                          subscriber.status === 'SUBSCRIBED'
                            ? 'border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-600'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        {isActing ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : subscriber.status === 'SUBSCRIBED' ? (
                          <span>Unsubscribe</span>
                        ) : (
                          <span>Reactivate</span>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-5 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">{subscribers.length}</span> of{' '}
            <span className="font-semibold text-slate-800">{totalCount}</span> subscribers
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="px-3 py-1.5 font-medium text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
