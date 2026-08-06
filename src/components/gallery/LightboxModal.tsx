'use client';

import React from 'react';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, Heart, MapPin, ExternalLink, Camera } from 'lucide-react';
import { IGalleryItem } from '@/types';

interface LightboxModalProps {
  items: IGalleryItem[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function LightboxModal({
  items,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: LightboxModalProps) {
  const item = items[currentIndex];
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 sm:p-6 lg:p-8 animate-fadeIn">
      {/* Close Button */}
      <button
        onClick={onClose}
        aria-label="Close Lightbox"
        className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev Arrow */}
      {items.length > 1 && (
        <button
          onClick={onPrev}
          aria-label="Previous Image"
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next Arrow */}
      {items.length > 1 && (
        <button
          onClick={onNext}
          aria-label="Next Image"
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Main Content Box */}
      <div className="relative max-w-5xl w-full max-h-[85vh] flex flex-col md:flex-row bg-darkslate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        {/* Left/Top: Image Container */}
        <div className="flex-1 bg-black flex items-center justify-center relative min-h-[300px] md:min-h-[500px]">
          <img
            src={item.url}
            alt={item.caption || item.destinationName}
            className="max-h-[75vh] w-auto max-w-full object-contain"
          />
        </div>

        {/* Right/Bottom: Info Sidebar */}
        <div className="w-full md:w-80 bg-darkslate-900 p-6 flex flex-col justify-between text-white border-t md:border-t-0 md:border-l border-white/10">
          <div>
            {/* Destination Tag */}
            <div className="flex items-center space-x-1 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>{item.destinationName}</span>
            </div>

            {/* Caption */}
            <h3 className="font-display text-xl font-bold text-white mb-4 leading-snug">
              {item.caption || 'Community Trip Photo'}
            </h3>

            {/* Photographer Badge */}
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-2xl border border-white/10 mb-6">
              <img
                src={item.photographerAvatar}
                alt={item.photographerName}
                className="w-10 h-10 rounded-full object-cover border border-cyan-400"
              />
              <div>
                <p className="text-xs text-white/60">Captured by</p>
                <p className="font-semibold text-sm text-white truncate max-w-[140px]">
                  {item.photographerName}
                </p>
              </div>
            </div>

            {/* Travel Type Badge */}
            <div className="flex items-center justify-between text-xs text-white/80 mb-4">
              <span>Travel Category</span>
              <span className="px-2.5 py-0.5 bg-brand-500 text-white font-bold rounded-full uppercase">
                {item.travelType}
              </span>
            </div>
          </div>

          {/* Link to Trip & Actions */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <Link
              href={`/trips/${item.tripSlug || item.tripId}`}
              onClick={onClose}
              className="w-full flex items-center justify-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Full Trip Story</span>
            </Link>

            <div className="flex items-center justify-between text-xs text-white/60 pt-2">
              <span>{currentIndex + 1} of {items.length} images</span>
              <div className="flex items-center space-x-1 text-rose-400">
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>{item.likesCount || 12} Likes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
