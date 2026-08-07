'use client';

import React from 'react';

export function TripCardSkeleton() {
  return (
    <div className="w-full bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-xl animate-pulse flex flex-col h-[420px]">
      <div className="w-full h-48 bg-white/10 relative" />
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="w-24 h-4 bg-white/10 rounded-full" />
            <div className="w-16 h-4 bg-white/10 rounded-full" />
          </div>
          <div className="w-full h-6 bg-white/10 rounded-lg" />
          <div className="w-3/4 h-4 bg-white/10 rounded-lg" />
        </div>
        <div className="pt-3 border-t border-white/10 flex justify-between items-center">
          <div className="w-28 h-5 bg-white/10 rounded-md" />
          <div className="w-20 h-5 bg-white/10 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function DestinationCardSkeleton() {
  return (
    <div className="w-full bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-xl animate-pulse h-80 relative">
      <div className="w-full h-full bg-white/10" />
      <div className="absolute bottom-6 left-6 right-6 space-y-2">
        <div className="w-32 h-6 bg-white/20 rounded-lg" />
        <div className="w-48 h-4 bg-white/10 rounded-md" />
      </div>
    </div>
  );
}

export function TripDetailsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-28 space-y-8 animate-pulse">
      <div className="w-full h-[380px] bg-slate-900 border border-white/10 rounded-3xl" />
      <div className="space-y-4">
        <div className="w-1/3 h-6 bg-slate-900 rounded-full" />
        <div className="w-3/4 h-10 bg-slate-900 rounded-2xl" />
        <div className="w-1/2 h-5 bg-slate-900 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-32 bg-slate-900 rounded-2xl border border-white/10" />
        <div className="h-32 bg-slate-900 rounded-2xl border border-white/10" />
        <div className="h-32 bg-slate-900 rounded-2xl border border-white/10" />
      </div>
      <div className="w-full h-64 bg-slate-900 rounded-3xl border border-white/10" />
    </div>
  );
}

export function PopularTripsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <TripCardSkeleton />
      <TripCardSkeleton />
      <TripCardSkeleton />
    </div>
  );
}

export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="w-full h-48 bg-slate-900 border border-white/10 rounded-2xl" />
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-28 space-y-8 animate-pulse">
      <div className="w-full h-64 bg-slate-900 rounded-3xl" />
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-white/10" />
        <div className="space-y-2">
          <div className="w-40 h-6 bg-slate-900 rounded-lg" />
          <div className="w-60 h-4 bg-slate-900 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-28 space-y-6 animate-pulse">
      <div className="w-full h-40 bg-slate-900 rounded-3xl border border-white/10" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TripCardSkeleton />
        <TripCardSkeleton />
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-start space-x-3 p-4 bg-slate-900 border border-white/10 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-white/10 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="w-32 h-4 bg-white/10 rounded-md" />
            <div className="w-full h-4 bg-white/10 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
