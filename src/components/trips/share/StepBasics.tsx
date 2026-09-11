'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { TravelType } from '@/types';

export const POPULAR_DESTINATIONS = [
  { name: "Cox's Bazar Beach", lat: 21.4272, lng: 92.0058, placeId: 'ChIJjT0bX66SVDcRLB2a89Ww30s' },
  { name: 'Sajek Valley', lat: 23.3820, lng: 92.2938, placeId: 'ChIJV4rQ52oVUzcR-sM-vjG-y00' },
  { name: 'Saint Martin Coral Island', lat: 20.6268, lng: 92.3225, placeId: 'ChIJY-xM58WTVDcROZ7r-jX-x22' },
  { name: 'Sreemangal Tea Gardens', lat: 24.3065, lng: 91.7296, placeId: 'ChIJm7_k3--cVTcR3bW8x_Y-x33' },
  { name: 'Bandarban Nilgiri', lat: 21.9213, lng: 92.3551, placeId: 'ChIJ3-yN68-TVDcR6W7r-jX-x44' },
  { name: 'Sylhet Ratargul Swamp Forest', lat: 25.0069, lng: 91.9351, placeId: 'ChIJZ-xM68-TVDcR7W7r-jX-x55' },
  { name: 'Sundarbans Mangrove Forest', lat: 21.9497, lng: 89.1833, placeId: 'ChIJ1-xM68-TVDcR8W7r-jX-x66' },
];

interface StepBasicsProps {
  title: string;
  setTitle: (val: string) => void;
  destinationName: string;
  onDestinationSelect: (name: string) => void;
  travelDate: string;
  setTravelDate: (val: string) => void;
  travelType: TravelType;
  setTravelType: (val: TravelType) => void;
  durationDays: number;
  setDurationDays: (val: number) => void;
  travellersCount: number;
  setTravellersCount: (val: number) => void;
  summary: string;
  setSummary: (val: string) => void;
  onNext: () => void;
}

export default function StepBasics({
  title,
  setTitle,
  destinationName,
  onDestinationSelect,
  travelDate,
  setTravelDate,
  travelType,
  setTravelType,
  durationDays,
  setDurationDays,
  travellersCount,
  setTravellersCount,
  summary,
  setSummary,
  onNext,
}: StepBasicsProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <span className="text-[10px] font-bold text-brand-300 uppercase tracking-widest block mb-1">
          Step 1 of 3
        </span>
        <h2 className="font-display text-2xl font-bold text-white uppercase">Trip Basics</h2>
        <p className="text-xs text-slate-400">Core destination & trip parameters</p>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
          Trip Title *
        </label>
        <input
          type="text"
          required
          placeholder="e.g. 3 Days Magical Coastal Getaway in Cox's Bazar"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Destination */}
      <div>
        <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
          Destination Name *
        </label>
        <input
          type="text"
          required
          placeholder="Type destination name or choose below..."
          value={destinationName}
          onChange={(e) => onDestinationSelect(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 mb-2"
        />
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold self-center mr-1">Popular:</span>
          {POPULAR_DESTINATIONS.map((d) => (
            <button
              key={d.name}
              type="button"
              onClick={() => onDestinationSelect(d.name)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                destinationName.toLowerCase() === d.name.toLowerCase()
                  ? 'bg-brand-500 text-white border-brand-400 font-bold'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Travel Date & Travel Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
            Travel Date *
          </label>
          <input
            type="date"
            required
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
            Travel Type *
          </label>
          <select
            value={travelType}
            onChange={(e) => setTravelType(e.target.value as TravelType)}
            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="Solo">Solo Explorer</option>
            <option value="Couple">Couple Escapes</option>
            <option value="Family">Family Holiday</option>
            <option value="Group">Group Adventure</option>
          </select>
        </div>
      </div>

      {/* Duration & Travellers Count */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
            Duration (Days) *
          </label>
          <input
            type="number"
            min={1}
            max={60}
            value={durationDays}
            onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
            Number of Travellers *
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={travellersCount}
            onChange={(e) => setTravellersCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Summary Overview */}
      <div>
        <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
          Trip Summary (Brief Teaser)
        </label>
        <textarea
          rows={2}
          placeholder="A short 1-2 sentence highlight of what made this trip special..."
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Step 1 Actions */}
      <div className="pt-4 border-t border-white/10 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
        >
          <span>Next: Cost & Experience</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
