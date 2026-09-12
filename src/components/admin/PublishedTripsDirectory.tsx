'use client';

import React from 'react';
import { Compass } from 'lucide-react';
import { ITrip } from '@/types';

interface PublishedTripsDirectoryProps {
  publishedTrips: ITrip[];
  onAction: (tripId: string, action: 'verify' | 'togglePopular') => void;
}

export default function PublishedTripsDirectory({
  publishedTrips,
  onAction,
}: PublishedTripsDirectoryProps) {
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  const handleAction = async (tripId: string, action: 'verify' | 'togglePopular') => {
    setProcessingId(tripId + action);
    try {
      await onAction(tripId, action);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
      <h2 className="font-display text-2xl font-bold text-slate-900 uppercase mb-6 flex items-center space-x-2">
        <Compass className="w-6 h-6 text-brand-500" />
        <span>Published Trips Directory ({publishedTrips.length})</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publishedTrips.map((trip) => (
          <div key={trip.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-brand-600">{trip.destinationName}</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded-full">
                Approved
              </span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{trip.title}</h4>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-500">
              <span>{trip.userName}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleAction(trip.id, 'verify')}
                  disabled={processingId === trip.id + 'verify'}
                  className={`px-3 py-1 text-[11px] font-bold rounded-full cursor-pointer disabled:opacity-50 transition-all ${
                    trip.isVerified
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700 hover:bg-amber-100'
                  }`}
                >
                  {trip.isVerified ? '✓ Verified' : '+ Verify'}
                </button>

                <button
                  onClick={() => handleAction(trip.id, 'togglePopular')}
                  disabled={processingId === trip.id + 'togglePopular'}
                  className={`px-3 py-1 text-[11px] font-bold rounded-full cursor-pointer disabled:opacity-50 transition-all ${
                    trip.isPopular
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-200 text-slate-700 hover:bg-purple-100'
                  }`}
                >
                  {trip.isPopular ? '★ Popular' : 'Mark Popular'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
