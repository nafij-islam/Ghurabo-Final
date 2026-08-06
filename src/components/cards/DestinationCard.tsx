'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Star, Compass, DollarSign, Calendar } from 'lucide-react';
import { IDestination } from '@/types';

interface DestinationCardProps {
  destination: IDestination;
}

export default function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group relative rounded-3xl overflow-hidden bg-slate-900 shadow-md hover:shadow-card-hover transition-all duration-500 flex flex-col justify-end min-h-[340px] transform hover:-translate-y-1"
    >
      {/* Background Image */}
      <img
        src={destination.image}
        alt={destination.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90"
      />

      {/* Gradient Mask Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

      {/* Top Badges */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <span className="px-3.5 py-1 bg-brand-500/90 backdrop-blur-md text-white text-xs font-bold rounded-full uppercase tracking-wider shadow">
          {destination.category}
        </span>
        <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-amber-300">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{destination.avgRating || 4.8}</span>
        </div>
      </div>

      {/* Bottom Content Area */}
      <div className="relative z-10 p-6 text-white">
        <div className="flex items-center space-x-1 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-1">
          <MapPin className="w-3.5 h-3.5" />
          <span>{destination.country} {destination.division ? `• ${destination.division}` : ''}</span>
        </div>

        <h3 className="font-display text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
          {destination.name}
        </h3>

        <p className="text-white/80 text-xs line-clamp-2 mb-4 font-light leading-relaxed">
          {destination.description}
        </p>

        {/* Dynamic Statistics Footer */}
        <div className="pt-3 border-t border-white/20 flex items-center justify-between text-xs">
          <div>
            <span className="text-white/60 text-[10px] uppercase tracking-wider block">Avg Solo Cost</span>
            <span className="font-extrabold text-cyan-300 text-sm">${destination.avgCostSolo}</span>
          </div>

          <div className="text-right">
            <span className="text-white/60 text-[10px] uppercase tracking-wider block">Community Trips</span>
            <div className="flex items-center space-x-1 font-bold text-white">
              <Compass className="w-3.5 h-3.5 text-brand-300" />
              <span>{destination.totalTrips} Trips</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
