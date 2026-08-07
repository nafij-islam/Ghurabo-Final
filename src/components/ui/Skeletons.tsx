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

export function TripDetailsSkeleton() {
  return (
    <div className="w-full bg-slate-50 min-h-screen pt-20 pb-20 animate-pulse">
      {/* Hero Cover Skeleton */}
      <div className="relative h-[480px] w-full bg-slate-300 overflow-hidden">
        <div className="absolute bottom-10 left-0 right-0 max-w-5xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="h-6 bg-slate-400 rounded-full w-32" />
          <div className="h-12 bg-slate-400 rounded-2xl w-3/4" />
          <div className="flex space-x-4">
            <div className="h-4 bg-slate-400 rounded w-24" />
            <div className="h-4 bg-slate-400 rounded w-20" />
            <div className="h-4 bg-slate-400 rounded w-28" />
          </div>
        </div>
      </div>

      {/* Main Body Skeleton */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        {/* Author Bar Skeleton */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-slate-200 rounded-full" />
            <div className="space-y-2">
              <div className="h-5 bg-slate-200 rounded w-36" />
              <div className="h-3 bg-slate-200 rounded w-24" />
            </div>
          </div>
          <div className="flex space-x-2">
            <div className="h-8 bg-slate-200 rounded-full w-20" />
            <div className="h-8 bg-slate-200 rounded-full w-20" />
          </div>
        </div>

        {/* Cost Summary Box Skeleton */}
        <div className="h-28 bg-slate-300 rounded-3xl w-full" />

        {/* Story Box Skeleton */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 space-y-4">
          <div className="h-7 bg-slate-200 rounded w-48" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
          <div className="h-4 bg-slate-200 rounded w-4/5" />
          <div className="h-4 bg-slate-200 rounded w-full" />
        </div>
      </div>
    </div>
  );
}
