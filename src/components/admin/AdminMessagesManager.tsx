'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  Mail,
  User,
  Calendar,
  Trash2,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Inbox,
  Eye,
  Check,
} from 'lucide-react';
import { contactApi } from '@/lib/api/contact.api';
import { ContactMessage, ContactMessageStatus } from '@/lib/api/api.types';

type FilterStatus = 'ALL' | 'UNREAD' | 'READ';

interface AdminMessagesManagerProps {
  onUnreadCountChange?: (count: number) => void;
}

export default function AdminMessagesManager({
  onUnreadCountChange,
}: AdminMessagesManagerProps) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Selected message for Detail Modal
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await contactApi.getMessages({
        page: currentPage,
        limit,
        search: debouncedSearch.trim() || undefined,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        sort: 'newest',
      });

      if (res && res.data) {
        setMessages(res.data);
        const total = res.meta?.total || 0;
        setTotalCount(total);
        setTotalPages(res.meta?.totalPages || 1);

        const unread = (res as any)?.stats?.unreadCount ?? 0;
        setUnreadCount(unread);
        if (onUnreadCountChange) {
          onUnreadCountChange(unread);
        }
      }
    } catch (err: any) {
      console.error('Failed to load contact messages:', err);
      setError(
        err?.response?.data?.message ||
          'Failed to load contact messages. Please try refreshing.'
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedStatus, onUnreadCountChange]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleStatusToggle = async (message: ContactMessage, targetStatus: ContactMessageStatus) => {
    const messageId = message.id || message._id;
    if (!messageId) return;

    setActionLoadingId(messageId);
    setFeedback(null);

    try {
      const updated = await contactApi.updateReadStatus(messageId, targetStatus);

      // Update local message list
      setMessages((prev) =>
        prev.map((m) => ((m.id || m._id) === messageId ? { ...m, status: targetStatus } : m))
      );

      // Update active detail modal message if open
      if (selectedMessage && (selectedMessage.id || selectedMessage._id) === messageId) {
        setSelectedMessage((prev) => (prev ? { ...prev, status: targetStatus } : null));
      }

      // Update unread count
      setUnreadCount((prev) => {
        const nextCount = targetStatus === 'READ' ? Math.max(0, prev - 1) : prev + 1;
        if (onUnreadCountChange) onUnreadCountChange(nextCount);
        return nextCount;
      });

      setFeedback({
        type: 'success',
        message: `Message marked as ${targetStatus === 'READ' ? 'Read' : 'Unread'}.`,
      });
    } catch (err: any) {
      console.error('Failed to update message status:', err);
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to update message status.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteMessage = async (message: ContactMessage) => {
    const messageId = message.id || message._id;
    if (!messageId) return;

    if (!window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }

    setActionLoadingId(messageId);
    setFeedback(null);

    try {
      await contactApi.deleteMessage(messageId);

      if (selectedMessage && (selectedMessage.id || selectedMessage._id) === messageId) {
        setSelectedMessage(null);
      }

      setFeedback({
        type: 'success',
        message: 'Message deleted successfully.',
      });

      // Refetch current list
      fetchMessages();
    } catch (err: any) {
      console.error('Failed to delete contact message:', err);
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to delete message.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenDetail = (message: ContactMessage) => {
    setSelectedMessage(message);
    setFeedback(null);

    // Auto mark as READ when opened if it is currently UNREAD
    if (message.status === 'UNREAD') {
      handleStatusToggle(message, 'READ');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Inquiries */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Inquiries
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            {totalCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">All incoming contact submissions</p>
        </div>

        {/* Unread Messages */}
        <div
          onClick={() => setSelectedStatus('UNREAD')}
          className={`p-5 rounded-2xl shadow-xs border transition-all cursor-pointer group ${
            selectedStatus === 'UNREAD'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20'
              : 'bg-white border-slate-200/80 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              Unread Messages
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl sm:text-3xl font-extrabold text-amber-600 flex items-center gap-2">
            <span>{unreadCount}</span>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-amber-500 text-white font-sans font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Needs Attention
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            {unreadCount > 0 ? 'Awaiting administrator review' : 'All messages have been reviewed'}
          </p>
        </div>

        {/* Read / Archived */}
        <div
          onClick={() => setSelectedStatus('READ')}
          className={`p-5 rounded-2xl shadow-xs border transition-all cursor-pointer group ${
            selectedStatus === 'READ'
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/20'
              : 'bg-white border-slate-200/80 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Reviewed Messages
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {Math.max(0, totalCount - unreadCount)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Marked as read & reviewed</p>
        </div>
      </div>

      {/* Action Alerts / Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center space-x-2 text-xs font-medium">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Bar: Search & Status Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by sender name, email, subject..."
            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filters & Refresh */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            {(['ALL', 'UNREAD', 'READ'] as FilterStatus[]).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => {
                  setSelectedStatus(status);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedStatus === status
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status === 'ALL' ? 'All' : status === 'UNREAD' ? 'Unread' : 'Read'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchMessages}
            disabled={loading}
            title="Refresh list"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Messages List Container */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
        {loading ? (
          /* Loading Skeletons */
          <div className="divide-y divide-slate-100 p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="py-4 animate-pulse flex flex-col md:flex-row gap-4 items-start justify-between">
                <div className="space-y-2 flex-1 w-full">
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="h-5 bg-slate-200 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                </div>
                <div className="h-7 w-20 bg-slate-200 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Failed to Load Messages</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">{error}</p>
            <button
              type="button"
              onClick={fetchMessages}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : messages.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">No Messages Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {debouncedSearch
                ? `No contact inquiries match "${debouncedSearch}".`
                : selectedStatus === 'UNREAD'
                ? 'Great job! You have no unread messages.'
                : 'No contact submissions found in this view.'}
            </p>
          </div>
        ) : (
          /* Message Items List */
          <div className="divide-y divide-slate-100">
            {messages.map((message) => {
              const messageId = message.id || message._id || '';
              const isUnread = message.status === 'UNREAD';
              const isBusy = actionLoadingId === messageId;

              return (
                <div
                  key={messageId}
                  onClick={() => handleOpenDetail(message)}
                  className={`p-4 sm:p-6 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group ${
                    isUnread
                      ? 'bg-amber-50/40 hover:bg-amber-50/70 border-l-4 border-l-amber-500'
                      : 'hover:bg-slate-50/80 border-l-4 border-l-transparent'
                  }`}
                >
                  {/* Left Column: Sender & Preview */}
                  <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                    {/* Header Row: Sender name, email, time */}
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
                      <span className={`font-bold ${isUnread ? 'text-slate-900 font-extrabold' : 'text-slate-700'}`}>
                        {message.name}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 truncate max-w-xs">{message.email}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400 flex items-center gap-1 shrink-0 text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formatDate(message.createdAt)}</span>
                      </span>
                    </div>

                    {/* Subject */}
                    <h4
                      className={`text-sm leading-snug line-clamp-1 ${
                        isUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                      }`}
                    >
                      {message.subject}
                    </h4>

                    {/* Message Preview */}
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {message.message}
                    </p>
                  </div>

                  {/* Right Column: Status Badge & Quick Actions */}
                  <div
                    className="flex items-center space-x-2.5 shrink-0 self-end md:self-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Status Pill */}
                    {isUnread ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>UNREAD</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>READ</span>
                      </span>
                    )}

                    {/* Quick Toggle Button */}
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleStatusToggle(message, isUnread ? 'READ' : 'UNREAD')}
                      title={isUnread ? 'Mark as Read' : 'Mark as Unread'}
                      className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isUnread
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {isBusy ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isUnread ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    {/* View Details Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(message)}
                      title="View Full Message"
                      className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Page {currentPage} of {totalPages} ({totalCount} total)
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                disabled={currentPage <= 1 || loading}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                disabled={currentPage >= totalPages || loading}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======================= DETAIL MODAL / DRAWER ======================= */}
      {selectedMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Message Details</h3>
                  <p className="text-[11px] text-slate-500">Contact Inquiry ID: {selectedMessage.id || selectedMessage._id}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Status indicator in modal */}
                {selectedMessage.status === 'UNREAD' ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
                    UNREAD
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                    READ
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Sender Info Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Sender Name
                  </span>
                  <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{selectedMessage.name}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Email Address
                  </span>
                  <div className="flex items-center space-x-2 font-semibold text-slate-800">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                      className="text-brand-600 hover:underline flex items-center gap-1 truncate"
                    >
                      <span>{selectedMessage.email}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Received Date & Time
                  </span>
                  <div className="flex items-center space-x-2 font-medium text-slate-700">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{formatDate(selectedMessage.createdAt)}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Current Status
                  </span>
                  <span className="font-semibold text-slate-700">{selectedMessage.status}</span>
                </div>
              </div>

              {/* Subject */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Subject Line
                </span>
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-sm">
                  {selectedMessage.subject}
                </div>
              </div>

              {/* Full Message Text */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Message Content
                </span>
                <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedMessage.message}
                </div>
              </div>
            </div>

            {/* Modal Footer / Actions */}
            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              {/* Delete Option */}
              <button
                type="button"
                disabled={actionLoadingId === (selectedMessage.id || selectedMessage._id)}
                onClick={() => handleDeleteMessage(selectedMessage)}
                className="inline-flex items-center space-x-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>

              {/* Status Actions */}
              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>

                {selectedMessage.status === 'UNREAD' ? (
                  <button
                    type="button"
                    disabled={actionLoadingId === (selectedMessage.id || selectedMessage._id)}
                    onClick={() => handleStatusToggle(selectedMessage, 'READ')}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {actionLoadingId === (selectedMessage.id || selectedMessage._id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>Mark as Read</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={actionLoadingId === (selectedMessage.id || selectedMessage._id)}
                    onClick={() => handleStatusToggle(selectedMessage, 'UNREAD')}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {actionLoadingId === (selectedMessage.id || selectedMessage._id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    <span>Mark as Unread</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
