'use client';

import React from 'react';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'brand' | 'amber' | 'emerald' | 'purple' | 'slate';
  actions?: React.ReactNode;
}

export default function AdminPageHeader({
  title,
  subtitle,
  badge,
  badgeColor = 'brand',
  actions,
}: AdminPageHeaderProps) {
  const badgeClasses = {
    brand: 'bg-brand-50 text-brand-700 border-brand-200/60',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/60',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/60',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  }[badgeColor];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 mb-6">
      <div>
        {badge && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border mb-2 select-none shadow-2xs">
            <span className={`w-1.5 h-1.5 rounded-full ${
              badgeColor === 'emerald' ? 'bg-emerald-500' :
              badgeColor === 'amber' ? 'bg-amber-500' :
              badgeColor === 'purple' ? 'bg-purple-500' : 'bg-brand-500'
            }`} />
            <span className={badgeClasses}>{badge}</span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl font-normal leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
