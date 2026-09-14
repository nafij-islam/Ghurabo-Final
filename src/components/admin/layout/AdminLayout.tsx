'use client';

import React, { useState } from 'react';
import AdminSidebar, { AdminTab } from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import AdminMobileSidebar from './AdminMobileSidebar';
import { IUser } from '@/types';

interface AdminLayoutProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingTripsCount?: number;
  user?: IUser | null;
  onLogout?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  children: React.ReactNode;
}

export default function AdminLayout({
  activeTab,
  onSelectTab,
  pendingTripsCount = 0,
  user,
  onLogout,
  onRefresh,
  isRefreshing = false,
  children,
}: AdminLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100/70 flex text-slate-900 antialiased font-sans">
      {/* Desktop Fixed Left Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 z-30 shadow-xl shadow-slate-950/5">
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          pendingTripsCount={pendingTripsCount}
          user={user}
          onLogout={onLogout}
        />
      </div>

      {/* Mobile Drawer */}
      <AdminMobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        pendingTripsCount={pendingTripsCount}
        user={user}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Topbar */}
        <AdminTopbar
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          user={user}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Workspace Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
