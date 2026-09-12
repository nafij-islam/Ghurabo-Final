'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Search,
  RefreshCw,
  User,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Compass,
  Mail,
  MapPin,
  ExternalLink,
  X,
  Clock,
  Eye,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin.api';
import { AdminUserItem } from '@/lib/api/api.types';
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary';

type FilterRole = 'ALL' | 'USER' | 'ADMIN';
type FilterStatus = 'ALL' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
type SortOption = 'newest' | 'oldest' | 'name';

export default function AllUsersManager() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<FilterRole>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('ALL');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const limit = 10;

  // Detail Modal State
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({
        page: currentPage,
        limit,
        search: searchQuery.trim() || undefined,
        role: selectedRole === 'ALL' ? undefined : selectedRole,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        sort: sortOption,
      });

      if (res && res.data) {
        setUsers(res.data);
        setTotalCount(res.meta?.total || 0);
        setTotalPages(res.meta?.totalPages || 1);
      }
    } catch (err: any) {
      console.error('Failed to load users for admin:', err);
      setFeedback({ type: 'error', message: err?.message || 'Failed to load user directory.' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchQuery, selectedRole, selectedStatus, sortOption]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset page when filters change
  const handleFilterChange = (setter: (val: any) => void, val: any) => {
    setter(val);
    setCurrentPage(1);
  };

  const getRoleBadge = (role: string) => {
    if (role === 'ADMIN') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wide">
          <ShieldCheck className="w-3 h-3 text-purple-600" />
          <span>Admin</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
        <User className="w-3 h-3 text-slate-500" />
        <span>Traveller</span>
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
            <span>Active</span>
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase">
            <ShieldAlert className="w-2.5 h-2.5 text-rose-600" />
            <span>Suspended</span>
          </span>
        );
      case 'DELETED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300 uppercase">
            <span>Deleted</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 mb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold uppercase text-slate-900">
              User Directory & Moderation
            </h2>
            <p className="text-xs text-slate-400">
              Manage community accounts, check activity, and inspect user profiles ({totalCount} total)
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchUsers()}
          disabled={loading}
          className="self-start md:self-auto flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Users</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
            placeholder="Search username, name, email..."
            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => handleFilterChange(setSearchQuery, '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Filter */}
        <div>
          <select
            value={selectedRole}
            onChange={(e) => handleFilterChange(setSelectedRole, e.target.value as FilterRole)}
            className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          >
            <option value="ALL">All Roles</option>
            <option value="USER">Travellers (USER)</option>
            <option value="ADMIN">Administrators (ADMIN)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) =>
              handleFilterChange(setSelectedStatus, e.target.value as FilterStatus)
            }
            className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          >
            <option value="ALL">All Account Statuses</option>
            <option value="ACTIVE">Active Accounts</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="DELETED">Deleted</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <select
            value={sortOption}
            onChange={(e) => handleFilterChange(setSortOption, e.target.value as SortOption)}
            className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Users Table / List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 bg-slate-100 rounded-2xl border border-slate-200 flex items-center px-4"
            />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <p className="font-display text-base font-bold text-slate-800">No Users Found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            No accounts match the current search query or filter selection.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 px-3">User</th>
                <th className="pb-3 px-3">Email</th>
                <th className="pb-3 px-3">Role</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-center">Trips</th>
                <th className="pb-3 px-3">Joined</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {users.map((u) => {
                const avatarSrc = typeof u.avatar === 'string' ? u.avatar : u.avatar?.url;
                const userAvatar =
                  getOptimizedImageUrl(avatarSrc, { width: 80, height: 80 }) ||
                  'https://i.pravatar.cc/150';

                return (
                  <tr key={u._id || u.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* User info */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center space-x-3">
                        <Image
                          src={userAvatar}
                          alt={u.fullName || u.username || 'User avatar'}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <Link
                            href={`/profile/${u.username}`}
                            className="font-bold text-slate-900 hover:text-brand-600 transition-colors truncate block"
                          >
                            {u.fullName || u.username}
                          </Link>
                          <span className="text-[11px] text-slate-400">@{u.username}</span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-3 text-slate-600 font-mono text-[11px]">
                      {u.email}
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-3">{getRoleBadge(u.role)}</td>

                    {/* Status */}
                    <td className="py-3.5 px-3">{getStatusBadge(u.accountStatus)}</td>

                    {/* Trips Count */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[11px] font-bold">
                        <Compass className="w-3 h-3 text-brand-500" />
                        <span>{u.tripsCount || 0}</span>
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="py-3.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(u)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/profile/${u.username}`}
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors"
                          title="View Public Profile"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {(currentPage - 1) * limit + 1} to{' '}
            {Math.min(currentPage * limit, totalCount)} of {totalCount} users
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold disabled:opacity-40 transition-all"
            >
              Previous
            </button>
            <span className="font-semibold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold disabled:opacity-40 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* User Detail View Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Image
                  src={
                    getOptimizedImageUrl(
                      typeof selectedUser.avatar === 'string'
                        ? selectedUser.avatar
                        : selectedUser.avatar?.url,
                      { width: 120, height: 120 }
                    ) || 'https://i.pravatar.cc/150'
                  }
                  alt={selectedUser.fullName || selectedUser.username || 'User avatar'}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover border-2 border-brand-500 bg-slate-100 shadow"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-display text-xl font-bold text-slate-900">
                      {selectedUser.fullName || selectedUser.username}
                    </h3>
                    {getRoleBadge(selectedUser.role)}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">@{selectedUser.username}</p>
                  <div className="mt-1">{getStatusBadge(selectedUser.accountStatus)}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Info Details */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div className="flex items-center space-x-2 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-mono">{selectedUser.email}</span>
              </div>

              {selectedUser.location && (
                <div className="flex items-center space-x-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{selectedUser.location}</span>
                </div>
              )}

              <div className="flex items-center space-x-2 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Joined{' '}
                  {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {selectedUser.bio && (
                <div className="pt-2 border-t border-slate-200/60 text-slate-600 leading-relaxed font-light">
                  <span className="font-semibold text-slate-700 block mb-0.5">Bio:</span>
                  {selectedUser.bio}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Shared Trips
                </span>
                <span className="font-display text-2xl font-bold text-slate-900">
                  {selectedUser.tripsCount || 0}
                </span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Followers
                </span>
                <span className="font-display text-2xl font-bold text-slate-900">
                  {selectedUser.followersCount || 0}
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400 font-mono">
                ID: {selectedUser._id || selectedUser.id}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                >
                  Close
                </button>
                <Link
                  href={`/profile/${selectedUser.username}`}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow transition-all"
                >
                  <span>Public Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
