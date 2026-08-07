'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import LightboxModal from '@/components/gallery/LightboxModal';
import { IGalleryItem } from '@/types';
import { Camera, Search, Compass, Eye, User, ArrowUpRight } from 'lucide-react';

export default function GalleryPage() {
  const [items, setItems] = useState<IGalleryItem[]>([]);
  const [travelType, setTravelType] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gallery')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setItems(data.gallery || []);
        }
        setLoading(false);
      });
  }, []);

  const filtered = items.filter((item) => {
    const matchesCategory = travelType === 'All' || item.travelType === travelType;
    const matchesSearch =
      item.destinationName.toLowerCase().includes(search.toLowerCase()) ||
      item.photographerName.toLowerCase().includes(search.toLowerCase()) ||
      (item.tripTitle && item.tripTitle.toLowerCase().includes(search.toLowerCase())) ||
      (item.caption && item.caption.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full pt-28 pb-20 bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <div className="bg-darkslate-900 text-white py-16 px-4 mb-12 border-b border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-3">
            <Camera className="w-4 h-4" />
            <span>AUTO-SYNCED COMMUNITY PHOTO STREAM</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold uppercase mb-4">
            Community Gallery
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto font-light leading-relaxed">
            Explore authentic travel photography captured by community members during verified solo, couple, family, and group trips.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by trip, traveller, destination..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Solo', 'Couple', 'Family', 'Group'].map((cat) => (
              <button
                key={cat}
                onClick={() => setTravelType(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all cursor-pointer ${
                  travelType === cat
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'All' ? 'All Photos' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-80 bg-slate-200 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((item, index) => (
              <div
                key={item.id || (item as any)._id}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Photo container with hover gradient */}
                <div
                  onClick={() => setSelectedIndex(index)}
                  className="relative h-72 w-full overflow-hidden bg-slate-900 cursor-pointer"
                >
                  <img
                    src={item.url}
                    alt={item.caption || item.destinationName}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Gradient Overlay for Desktop Hover & Mobile Touch */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-5 flex flex-col justify-between text-white">
                    <div className="flex justify-end">
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

                      <p className="text-[11px] text-cyan-200 font-medium truncate">
                        {item.destinationName} • {item.travelType} Trip
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile / Permanent Information Footer */}
                <div className="p-4 bg-white flex items-center justify-between border-t border-slate-100">
                  <div className="truncate pr-2">
                    <Link
                      href={`/profile/${item.photographerId || item.photographerName}`}
                      className="text-xs font-bold text-slate-800 hover:text-brand-600 block truncate"
                    >
                      {item.photographerName}
                    </Link>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {item.destinationName} • {item.travelType}
                    </span>
                  </div>

                  <Link
                    href={`/trips/${item.tripSlug || item.tripId}`}
                    className="p-2 rounded-full bg-slate-100 text-brand-600 hover:bg-brand-500 hover:text-white transition-all flex-shrink-0"
                    title="View Trip Details"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
            <Camera className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-display text-2xl font-bold text-slate-800 uppercase">No Gallery Photos</h3>
            <p className="text-slate-500 text-xs mt-1">Try adjusting search or travel type filters.</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <LightboxModal
          items={filtered}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onPrev={() => setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filtered.length - 1))}
          onNext={() => setSelectedIndex((prev) => (prev !== null && prev < filtered.length - 1 ? prev + 1 : 0))}
        />
      )}
    </div>
  );
}
