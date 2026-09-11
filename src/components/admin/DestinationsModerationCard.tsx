'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { IDestination } from '@/types';

interface DestinationsModerationCardProps {
  destinations: IDestination[];
  onTogglePopular: (destinationId: string, currentPopular: boolean) => void;
}

export default function DestinationsModerationCard({
  destinations,
  onTogglePopular,
}: DestinationsModerationCardProps) {
  const popularCount = destinations.filter((d) => d.isPopular).length;

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 uppercase flex items-center space-x-2">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            <span>Homepage Popular Destinations Controls</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Select destinations to feature under &ldquo;POPULAR DESTINATIONS&rdquo; section on the Homepage.
          </p>
        </div>
        <span className="px-3.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase">
          {popularCount} Popular Selected
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {destinations.map((dest) => (
          <div
            key={dest.id}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
              dest.isPopular
                ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/40'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center space-x-3 truncate">
              <img
                src={dest.image}
                alt={dest.name}
                className="w-12 h-12 rounded-xl object-cover border border-white shadow-sm flex-shrink-0"
              />
              <div className="truncate">
                <h4 className="font-bold text-xs text-slate-900 truncate">{dest.name}</h4>
                <span className="text-[10px] text-slate-500">{dest.country}</span>
              </div>
            </div>

            <button
              onClick={() => onTogglePopular(dest.id, Boolean(dest.isPopular))}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition-all flex items-center space-x-1 flex-shrink-0 cursor-pointer ${
                dest.isPopular
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                  : 'bg-white hover:bg-amber-100 text-slate-700 border border-slate-300'
              }`}
            >
              <Star className={`w-3 h-3 ${dest.isPopular ? 'fill-white' : ''}`} />
              <span>{dest.isPopular ? 'Popular' : 'Mark Popular'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
