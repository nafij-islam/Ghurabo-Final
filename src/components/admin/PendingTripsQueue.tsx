'use client';

import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { ITrip } from '@/types';

interface PendingTripsQueueProps {
  pendingTrips: ITrip[];
  onAction: (tripId: string, action: 'approve' | 'reject') => void;
}

export default function PendingTripsQueue({ pendingTrips, onAction }: PendingTripsQueueProps) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-10">
      <h2 className="font-display text-2xl font-bold text-slate-900 uppercase mb-6 flex items-center space-x-2">
        <Clock className="w-6 h-6 text-amber-500" />
        <span>Pending Approvals Queue ({pendingTrips.length})</span>
      </h2>

      {pendingTrips.length > 0 ? (
        <div className="space-y-6">
          {pendingTrips.map((trip) => (
            <div
              key={trip.id}
              className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="px-2.5 py-0.5 bg-brand-500 text-white font-bold rounded-full uppercase">
                    {trip.travelType}
                  </span>
                  <span className="text-slate-500">• Submitted by {trip.userName}</span>
                  <span className="text-slate-400">({new Date(trip.createdAt).toLocaleDateString()})</span>
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900">{trip.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 font-light">{trip.summary}</p>
                <div className="text-xs font-semibold text-brand-600">
                  Destination: {trip.destinationName} | Per Person Cost: ৳{trip.costBreakdown?.perPersonCost || 0}
                </div>
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
                <button
                  onClick={() => onAction(trip.id, 'approve')}
                  className="flex items-center space-x-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase rounded-full shadow transition-all cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve</span>
                </button>

                <button
                  onClick={() => onAction(trip.id, 'reject')}
                  className="flex items-center space-x-1.5 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase rounded-full shadow transition-all cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 text-xs font-medium">
          ✓ No pending trip submissions requiring review right now.
        </div>
      )}
    </div>
  );
}
