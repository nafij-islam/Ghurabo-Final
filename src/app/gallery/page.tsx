'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { IGalleryItem } from '@/types';
import { Camera, Search, Eye, User, ArrowUpRight, X, AlertCircle, Compass, MapPin } from 'lucide-react';
import { useGallery } from '@/lib/swr/hooks';
import { adaptBackendGalleryToIGalleryItem } from '@/lib/api/adapters';

const LightboxModal = dynamic(() => import('@/components/gallery/LightboxModal'), {
  ssr: false,
});

const TRAVEL_CATEGORIES = ['All', 'Solo', 'Couple', 'Family', 'Group'] as const;

export default function GalleryPage() {
  const [travelType, setTravelType] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const backendTravelType = travelType !== 'All' ? travelType.toUpperCase() : undefined;
  const { items, isLoading, error, mutate } = useGallery({
    travelType: backendTravelType,
    search: search.trim() || undefined,
    limit: 60,
  });

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        travelType === 'All' || item.travelType.toLowerCase() === travelType.toLowerCase();
      const s = search.toLowerCase().trim();
      const matchesSearch =
        !s ||
        item.destinationName.toLowerCase().includes(s) ||
        item.photographerName.toLowerCase().includes(s) ||
        (item.tripTitle && item.tripTitle.toLowerCase().includes(s)) ||
        (item.caption && item.caption.toLowerCase().includes(s));
      return matchesCategory && matchesSearch;
    });
  }, [items, travelType, search]);

  const clearFilters = () => {
    setSearch('');
    setTravelType('All');
  };

  return (
    <div className="w-full pt-28 pb-20 bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <div className="bg-darkslate-900 text-white py-16 px-4 mb-12 border-b border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-3">
            <Camera className="w-4 h-4" />
            <span>AUTO-SYNCED COMMUNITY PHOTO STREAM</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold uppercase mb-4 tracking-tight">
            Community Gallery
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto font-light leading-relaxed">
            Explore authentic travel photography captured by real travelers during verified solo, couple, family, and group trips across Bangladesh.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Modern Search & Filter Hub */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/80 p-4 sm:p-6 mb-8 sm:mb-10 transition-all">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input with Icon and Clear Button */}
            <div className="relative flex-1 max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4 text-brand-500" />
              </div>
              <input
                type="text"
                placeholder="Search trip, destination, photographer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-brand-500 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15 transition-all shadow-inner"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  title="Clear search"
                >
                  <span className="p-1 rounded-full hover:bg-slate-200">
                    <X className="w-3.5 h-3.5" />
                  </span>
                </button>
              )}
            </div>

            {/* Photo Counter & Reset Button */}
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 self-start md:self-center shrink-0">
              <span className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100/90 text-slate-700 rounded-xl font-medium border border-slate-200/60">
                <Camera className="w-3.5 h-3.5 text-brand-500" />
                <span>
                  {filtered.length} {filtered.length === 1 ? 'Photo' : 'Photos'}
                </span>
              </span>
              {(search || travelType !== 'All') && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-bold text-xs transition-colors cursor-pointer border border-rose-200/60"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Chips Row */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <Compass className="w-3.5 h-3.5 text-brand-500" />
              <span>Category Filter:</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {TRAVEL_CATEGORIES.map((cat) => {
                const isActive = travelType === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setTravelType(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex-shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 ring-2 ring-brand-500/20'
                        : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 border border-slate-200/60'
                    }`}
                  >
                    {cat === 'All' ? '🌟 All Photos' : cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-3 mb-10 max-w-md mx-auto">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-xs text-rose-700 font-medium">{error?.message || 'Failed to load community photos.'}</p>
            <button
              onClick={() => mutate()}
              className="px-4 py-2 bg-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm hover:bg-rose-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content: Loading Skeleton, Grid, or Empty State */}
        {isLoading ? (
          /* Responsive Loading Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm animate-pulse flex flex-col"
              >
                <div className="h-72 bg-slate-200/90 w-full" />
                <div className="p-4 space-y-2">
                  <div className="h-3.5 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          /* Redesigned Gallery Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((item, index) => (
              <div
                key={item.id}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200/80 hover:border-brand-500/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                {/* Image Container with Hover Overlay */}
                <div
                  onClick={() => setSelectedIndex(index)}
                  className="relative h-72 w-full overflow-hidden bg-slate-900 cursor-pointer"
                >
                  <Image
                    src={item.url}
                    alt={item.caption || item.destinationName}
                    fill
                    priority={index < 4}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 320px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 motion-reduce:transform-none"
                  />

                  {/* Gradient Overlay for Desktop Hover & Touch Interaction */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 p-5 flex flex-col justify-between text-white z-10">
                    <div className="flex justify-between items-start">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-bold text-cyan-300 uppercase tracking-wider border border-white/10">
                        <Compass className="w-3 h-3" />
                        <span>{item.travelType}</span>
                      </span>
                      <span className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all">
                        <Eye className="w-4 h-4" />
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <Link
                        href={`/profile/${item.photographerId || item.photographerName}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-300 hover:underline truncate"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>{item.photographerName}</span>
                      </Link>

                      <Link
                        href={`/trips/${item.tripSlug || item.tripId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="block font-display text-base font-bold text-white hover:text-cyan-300 transition-colors line-clamp-1 leading-tight"
                      >
                        {item.tripTitle || item.caption || item.destinationName || 'Community Photo'}
                      </Link>

                      <p className="text-[11px] text-cyan-200/90 font-medium truncate flex items-center space-x-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>{item.destinationName}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Permanent Bottom Info Card */}
                <div className="p-4 bg-white flex items-center justify-between border-t border-slate-100">
                  <div className="truncate pr-2">
                    <Link
                      href={`/profile/${item.photographerId || item.photographerName}`}
                      className="text-xs font-bold text-slate-800 hover:text-brand-600 block truncate"
                    >
                      {item.photographerName}
                    </Link>
                    <span className="text-[11px] text-slate-500 block truncate font-light">
                      {item.destinationName} • {item.travelType}
                    </span>
                  </div>

                  <Link
                    href={`/trips/${item.tripSlug || item.tripId}`}
                    className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-brand-500 hover:text-white transition-all flex-shrink-0 group-hover:bg-brand-500 group-hover:text-white"
                    title="View Full Trip Story"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-lg mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="font-display text-2xl font-bold text-slate-800 uppercase">
              No Photos Match Filters
            </h3>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed max-w-xs mx-auto">
              {search || travelType !== 'All'
                ? 'We could not find any community photos matching your current search or category filter.'
                : 'No community photos have been uploaded yet. Photos from approved trips will appear here automatically.'}
            </p>
            {(search || travelType !== 'All') && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md transition-all cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <LightboxModal
          items={filtered}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onPrev={() =>
            setSelectedIndex((prev) =>
              prev !== null && prev > 0 ? prev - 1 : filtered.length - 1
            )
          }
          onNext={() =>
            setSelectedIndex((prev) =>
              prev !== null && prev < filtered.length - 1 ? prev + 1 : 0
            )
          }
        />
      )}
    </div>
  );
}
