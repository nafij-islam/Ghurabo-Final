'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import AdminSidebar, { AdminTab } from './AdminSidebar';
import { IUser } from '@/types';

interface AdminMobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingTripsCount?: number;
  unreadMessagesCount?: number;
  user?: IUser | null;
  onLogout?: () => void;
}

export default function AdminMobileSidebar({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  pendingTripsCount = 0,
  unreadMessagesCount = 0,
  user,
  onLogout,
}: AdminMobileSidebarProps) {
  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer */}
      <div className="relative flex flex-col w-72 max-w-[85vw] h-full bg-slate-900 shadow-2xl z-10 transition-transform duration-300 transform">
        {/* Mobile close button */}
        <div className="absolute top-4 right-3 z-20">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Component inside Drawer */}
        <div className="h-full flex flex-col">
          <AdminSidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              onSelectTab(tab);
              onClose();
            }}
            pendingTripsCount={pendingTripsCount}
            unreadMessagesCount={unreadMessagesCount}
            user={user}
            onLogout={onLogout}
          />
        </div>
      </div>
    </div>
  );
}
