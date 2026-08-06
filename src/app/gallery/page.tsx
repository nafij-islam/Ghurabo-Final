'use client';

import React, { useState, useEffect } from 'react';
import LightboxModal from '@/components/gallery/LightboxModal';
import { IGalleryItem } from '@/types';
import { Camera, Search, Filter, MapPin, Eye } from 'lucide-react';

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
            Explore authentic high-resolution travel photography captured by our community members during their solo, couple, family, and group trips.
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
              placeholder="Search by caption, photographer..."
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
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${
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

        {/* Masonry Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((item, index) => (
              <div
                key={item.id}
                onClick={() => setSelectedIndex(index)}
                className="group relative rounded-2xl overflow-hidden bg-slate-900 shadow-sm hover:shadow-xl transition-all cursor-pointer h-72"
              >
                <img
                  src={item.url}
                  alt={item.caption || item.destinationName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between text-white">
                  <div className="flex justify-end">
                    <span className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white">
                      <Eye className="w-4 h-4" />
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider block">
                      {item.destinationName}
                    </span>
                    <p className="font-display text-base font-bold line-clamp-1">{item.caption}</p>
                    <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-white/20">
                      <img
                        src={item.photographerAvatar}
                        alt={item.photographerName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-xs text-white/90 truncate">{item.photographerName}</span>
                    </div>
                  </div>
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
