import React from 'react';

export function TripCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm animate-pulse flex flex-col justify-between h-[450px]">
      <div className="h-60 bg-slate-200 w-full relative overflow-hidden" />
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-slate-200 rounded w-24" />
            <div className="h-4 bg-slate-200 rounded w-16" />
          </div>
          <div className="h-6 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-200 rounded w-full" />
          <div className="h-3 bg-slate-200 rounded w-2/3" />
        </div>
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          <div className="h-6 bg-slate-200 rounded w-20" />
          <div className="h-8 bg-slate-200 rounded-full w-24" />
        </div>
      </div>
    </div>
  );
}

export function DestinationCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm animate-pulse h-[380px]">
      <div className="h-56 bg-slate-200 w-full" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-slate-200 rounded w-1/2" />
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-4 bg-slate-200 rounded w-20" />
          <div className="h-4 bg-slate-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function GalleryCardSkeleton() {
  return (
    <div className="bg-slate-200 animate-pulse rounded-3xl h-72 w-full overflow-hidden" />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse max-w-7xl mx-auto px-4 py-12">
      <div className="h-44 bg-slate-200 rounded-3xl w-full" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-3xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <TripCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-8 animate-pulse max-w-7xl mx-auto px-4 py-12">
      <div className="h-64 bg-slate-200 rounded-3xl w-full" />
      <div className="h-32 bg-slate-200 rounded-3xl w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <TripCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
