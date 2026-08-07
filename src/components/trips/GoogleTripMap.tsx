'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Map as MapIcon } from 'lucide-react';

interface GoogleTripMapProps {
  destinationName: string;
  latitude?: number;
  longitude?: number;
  googlePlaceId?: string;
}

export default function GoogleTripMap({
  destinationName,
  latitude = 21.4272,
  longitude = 92.0058,
  googlePlaceId,
}: GoogleTripMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    destinationName
  )}${latitude && longitude ? `&query_place_id=${googlePlaceId || ''}` : ''}`;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    destinationName
  )}`;

  const embedUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(
        destinationName
      )}`
    : `https://maps.google.com/maps?q=${encodeURIComponent(
        destinationName
      )}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="w-full bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 my-8">
      {/* Map Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[10px] font-bold rounded-full uppercase tracking-wider mb-1">
            <MapIcon className="w-3 h-3" />
            <span>Interactive Google Map Location</span>
          </div>
          <h3 className="font-display text-2xl font-bold text-white uppercase flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-brand-400" />
            <span>{destinationName}</span>
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Coordinates: {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-all"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Get Directions</span>
          </a>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 rounded-xl transition-all"
          >
            <span>Open in Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Lazy Loaded Interactive Map Container */}
      <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-950 border border-white/10">
        {!mapLoaded && (
          <div className="absolute inset-0 bg-slate-900 animate-pulse flex flex-col items-center justify-center space-y-3 z-10">
            <MapPin className="w-8 h-8 text-brand-400 animate-bounce" />
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Loading Interactive Map...</p>
          </div>
        )}

        <iframe
          title={`Google Map for ${destinationName}`}
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          onLoad={() => setMapLoaded(true)}
          className="w-full h-full filter contrast-[1.05] brightness-[0.95]"
        />
      </div>
    </div>
  );
}
