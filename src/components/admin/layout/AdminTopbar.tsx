'use client';

import React from 'react';
import { Menu, Globe, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { IUser } from '@/types';
import { AdminTab } from './AdminSidebar';

interface AdminTopbarProps {
  activeTab: AdminTab;
  onOpenMobileMenu: () => void;
  user?: IUser | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const tabLabels: Record<AdminTab, { title: string; category: string }> = {
  overview: { title: 'Overview', category: 'Dashboard' },
  trips: { title: 'Trips Directory', category: 'Content' },
  users: { title: 'Users Directory', category: 'Community' },
  newsletter: { title: 'Newsletter Subscribers', category: 'Community' },
  settings: { title: 'Currency & Settings', category: 'System' },
};

export default function AdminTopbar({
  activeTab,
  onOpenMobileMenu,
  user,
  onRefresh,
  isRefreshing = false,
}: AdminTopbarProps) {
  const meta = tabLabels[activeTab] || { title: 'Workspace', category: 'Dashboard' };
  const displayName = user?.name || (user as any)?.fullName || user?.email?.split('@')[0] || 'Admin';

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0 select-none">
      {/* Left: Mobile hamburger & breadcrumbs */}
      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs truncate">
          <span className="text-slate-400 font-medium hidden sm:inline">{meta.category}</span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="font-semibold text-slate-800 text-sm truncate">{meta.title}</span>
        </div>
      </div>

      {/* Right: Actions & User Info */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Backend Connected Indicator */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>API Connected</span>
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh dashboard data"
            aria-label="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
          </button>
        )}

        {/* View Public Site Quick Link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span>View Site</span>
        </a>

        {/* Divider */}
        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        {/* Current Admin User Chip */}
        <div className="flex items-center space-x-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[130px]">
              {displayName}
            </span>
            <span className="text-[10px] text-brand-600 font-bold tracking-wider uppercase">
              Administrator
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
