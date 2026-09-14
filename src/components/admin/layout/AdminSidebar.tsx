'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Compass,
  MapPin,
  Users,
  Mail,
  Coins,
  ExternalLink,
  LogOut,
  Shield,
  Sparkles,
} from 'lucide-react';
import AdminNavItem from './AdminNavItem';
import { IUser } from '@/types';

export type AdminTab = 'overview' | 'trips' | 'destinations' | 'users' | 'newsletter' | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingTripsCount?: number;
  user?: IUser | null;
  onLogout?: () => void;
}

export default function AdminSidebar({
  activeTab,
  onSelectTab,
  pendingTripsCount = 0,
  user,
  onLogout,
}: AdminSidebarProps) {
  const displayName = user?.name || (user as any)?.fullName || (user as any)?.username || user?.email?.split('@')[0] || 'Admin';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col h-full select-none shrink-0 text-slate-300">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 shrink-0">
        <Link href="/admin" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
            <span className="font-display text-white font-extrabold text-base tracking-wider">G</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-display text-base font-black tracking-wider text-white">GHURABO</span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">Workspace Admin</span>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 custom-scrollbar">
        {/* Main Section */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Main
          </div>
          <div className="space-y-0.5">
            <AdminNavItem
              icon={LayoutDashboard}
              label="Overview"
              active={activeTab === 'overview'}
              onClick={() => onSelectTab('overview')}
            />
          </div>
        </div>

        {/* Content Section */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Content & Moderation
          </div>
          <div className="space-y-0.5">
            <AdminNavItem
              icon={Compass}
              label="Trips Directory"
              active={activeTab === 'trips'}
              badge={pendingTripsCount > 0 ? pendingTripsCount : undefined}
              badgeColor="amber"
              onClick={() => onSelectTab('trips')}
            />
            <AdminNavItem
              icon={MapPin}
              label="Destinations"
              active={activeTab === 'destinations'}
              onClick={() => onSelectTab('destinations')}
            />
          </div>
        </div>

        {/* Community Section */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Community & Growth
          </div>
          <div className="space-y-0.5">
            <AdminNavItem
              icon={Users}
              label="Users Directory"
              active={activeTab === 'users'}
              onClick={() => onSelectTab('users')}
            />
            <AdminNavItem
              icon={Mail}
              label="Newsletter"
              active={activeTab === 'newsletter'}
              onClick={() => onSelectTab('newsletter')}
            />
          </div>
        </div>

        {/* System Section */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            System & Settings
          </div>
          <div className="space-y-0.5">
            <AdminNavItem
              icon={Coins}
              label="Currency & Settings"
              active={activeTab === 'settings'}
              onClick={() => onSelectTab('settings')}
            />
          </div>
        </div>
      </div>

      {/* Footer / User Profile & Shortcuts */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/50 space-y-2 shrink-0">
        {/* Quick External Link */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center space-x-2.5 truncate">
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">View Public Website</span>
          </div>
          <span className="text-[10px] text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded font-mono">
            live
          </span>
        </Link>

        {/* User Profile Card */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-inner">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
                <span>{displayName}</span>
                <Shield className="w-3 h-3 text-brand-400 shrink-0" />
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {user?.email || 'admin@ghurabo.com'}
              </div>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
