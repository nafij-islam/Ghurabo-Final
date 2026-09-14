'use client';

import React from 'react';
import Link from 'next/link';

interface AdminNavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  badge?: string | number;
  badgeColor?: 'brand' | 'amber' | 'emerald' | 'purple' | 'slate';
  onClick?: () => void;
  href?: string;
  external?: boolean;
}

export default function AdminNavItem({
  icon: Icon,
  label,
  active = false,
  badge,
  badgeColor = 'brand',
  onClick,
  href,
  external = false,
}: AdminNavItemProps) {
  const badgeClasses = {
    brand: 'bg-brand-500 text-white',
    amber: 'bg-amber-500 text-white font-bold',
    emerald: 'bg-emerald-500 text-white',
    purple: 'bg-purple-600 text-white',
    slate: 'bg-slate-700 text-slate-300',
  }[badgeColor];

  const content = (
    <div
      className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer select-none ${
        active
          ? 'bg-brand-500/15 text-white font-semibold shadow-sm'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {/* Active Indicator Bar */}
      {active && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-brand-400 rounded-r-full" />
      )}

      <div className="flex items-center space-x-3 min-w-0">
        <Icon
          className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
            active ? 'text-brand-400' : 'text-slate-400 group-hover:text-slate-200'
          }`}
        />
        <span className="truncate">{label}</span>
      </div>

      {badge !== undefined && badge !== null && badge !== '' && (
        <span
          className={`ml-2 px-2 py-0.5 text-[10px] rounded-full shrink-0 ${badgeClasses}`}
        >
          {badge}
        </span>
      )}
    </div>
  );

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          className="block outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-xl"
        >
          {content}
        </a>
      );
    }
    return (
      <Link
        href={href}
        onClick={onClick}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-xl"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-xl block"
    >
      {content}
    </button>
  );
}
