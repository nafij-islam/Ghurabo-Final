'use client';

import React, { useState } from 'react';
import { X, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ITrip, TravelType } from '@/types';
import { tripsApi } from '@/lib/api/trips.api';
import { adaptBackendTripToITrip, toBackendTravelType } from '@/lib/api/adapters';

interface EditTripModalProps {
  trip: ITrip;
  onClose: () => void;
  onSuccess: (updatedTrip: ITrip) => void;
}

export default function EditTripModal({ trip, onClose, onSuccess }: EditTripModalProps) {
  const [title, setTitle] = useState(trip.title || '');
  const [summary, setSummary] = useState(trip.summary || '');
  const [story, setStory] = useState(trip.story || '');
  const [travelType, setTravelType] = useState<TravelType>(trip.travelType || 'Solo');
  const [durationDays, setDurationDays] = useState(trip.durationDays || 3);

  // Costs
  const [transport, setTransport] = useState(trip.costBreakdown?.transport || 0);
  const [hotel, setHotel] = useState(trip.costBreakdown?.hotel || 0);
  const [food, setFood] = useState(trip.costBreakdown?.food || 0);
  const [localTransport, setLocalTransport] = useState(trip.costBreakdown?.localTransport || 0);
  const [tickets, setTickets] = useState(trip.costBreakdown?.tickets || 0);
  const [shopping, setShopping] = useState(trip.costBreakdown?.shopping || 0);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters.');
      return;
    }
    if (summary.trim().length === 0) {
      setError('Please provide a trip summary.');
      return;
    }
    if (story.trim().length === 0) {
      setError('Please provide your travel story.');
      return;
    }

    setSaving(true);
    try {
      const updated = await tripsApi.updateTrip(trip.id, {
        title: title.trim(),
        summary: summary.trim(),
        story: story.trim(),
        travelType: toBackendTravelType(travelType),
        days: durationDays,
        nights: Math.max(1, durationDays - 1),
        costs: {
          transport,
          lodging: hotel,
          food,
          sightseeing: localTransport,
          activities: tickets,
          miscellaneous: shopping,
        },
      });

      const adapted = adaptBackendTripToITrip(updated);
      onSuccess(adapted);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save changes. Please check inputs.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 uppercase">
              Edit Trip Itinerary
            </h2>
            <p className="text-xs text-slate-500">Update your shared travel experience details</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Trip Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="e.g., 3 Days Backpacking in Sajek Valley"
            />
          </div>

          {/* Travel Type & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Travel Style
              </label>
              <select
                value={travelType}
                onChange={(e) => setTravelType(e.target.value as TravelType)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Solo">Solo Explorer</option>
                <option value="Couple">Couple Journey</option>
                <option value="Family">Family Holiday</option>
                <option value="Group">Friends Group Tour</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Duration (Days)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Quick Summary (Teaser)
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Short description highlighting the best parts of this adventure..."
            />
          </div>

          {/* Complete Story */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Complete Travel Story
            </label>
            <textarea
              rows={5}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
              placeholder="Tell other travelers about your routes, stays, and authentic experiences..."
            />
          </div>

          {/* Estimated Expenses (BDT) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Expense Breakdown (BDT)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Transport</label>
                <input
                  type="number"
                  min={0}
                  value={transport}
                  onChange={(e) => setTransport(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Hotel / Stay</label>
                <input
                  type="number"
                  min={0}
                  value={hotel}
                  onChange={(e) => setHotel(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Food & Meals</label>
                <input
                  type="number"
                  min={0}
                  value={food}
                  onChange={(e) => setFood(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Local Rides</label>
                <input
                  type="number"
                  min={0}
                  value={localTransport}
                  onChange={(e) => setLocalTransport(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Entry Tickets</label>
                <input
                  type="number"
                  min={0}
                  value={tickets}
                  onChange={(e) => setTickets(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Shopping / Misc</label>
                <input
                  type="number"
                  min={0}
                  value={shopping}
                  onChange={(e) => setShopping(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-bold uppercase text-slate-600 hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-full text-xs font-bold uppercase shadow transition-all flex items-center space-x-2 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
