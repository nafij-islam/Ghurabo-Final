'use client';

import React, { useState, useEffect } from 'react';
import DestinationCard from '@/components/cards/DestinationCard';
import { DestinationCardSkeleton } from '@/components/ui/Skeletons';
import { IDestination } from '@/types';
import { Search, MapPin, Compass } from 'lucide-react';

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<IDestination[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/destinations')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDestinations(data.destinations || []);
        }
        setLoading(false);
      });
  }, []);

  const filtered = destinations.filter((dest) => {
    const matchesCategory = selectedCategory === 'All' || dest.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      dest.name.toLowerCase().includes(search.toLowerCase()) ||
      dest.country.toLowerCase().includes(search.toLowerCase()) ||
      dest.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full pt-28 pb-20 bg-slate-50 min-h-screen">
      {/* Banner */}
      <div className="bg-darkslate-900 text-white py-16 px-4 mb-12 border-b border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-3">
            <Compass className="w-4 h-4" />
            <span>WORLDWIDE DESTINATION DIRECTORY</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold uppercase mb-4">
            Explore Destinations
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto font-light leading-relaxed">
            Discover beach coastlines, cloud valleys, tropical coral islands, and historic heritage sites with real cost benchmarks derived from community trip reports.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search & Category Filter Bar */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-10 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by country, city, or destination..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {['All', 'Beach', 'Mountain', 'Island', 'Resort', 'Historical', 'City'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-brand-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Destination Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <DestinationCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((dest) => (
              <DestinationCard key={dest.id || (dest as any)._id} destination={dest} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-display text-2xl font-bold text-slate-800 uppercase">No Destinations Found</h3>
            <p className="text-slate-500 text-xs mt-1">Try adjusting your search criteria or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
