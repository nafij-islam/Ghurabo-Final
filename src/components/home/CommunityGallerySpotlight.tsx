'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Camera, ArrowRight, MapPin, User, Compass } from 'lucide-react';
import { IGalleryItem } from '@/types';

interface CommunityGallerySpotlightProps {
  items: IGalleryItem[];
  loading?: boolean;
}

export default function CommunityGallerySpotlight({
  items,
  loading = false,
}: CommunityGallerySpotlightProps) {
  const displayItems = items.slice(0, 5);

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-brand-600 text-xs font-bold uppercase tracking-widest mb-2">
            <Camera className="w-4 h-4" />
            <span>AUTO-SYNCED PHOTO FEED</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-slate-900 uppercase tracking-tight">
            Community Gallery Spotlight
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm font-light mt-1 max-w-xl">
            Every photo uploaded inside an approved trip automatically appears in our public gallery.
          </p>
        </div>

        {/* View Full Gallery CTA */}
        <Link
          href="/gallery"
          className="inline-flex items-center space-x-2 text-brand-600 hover:text-brand-700 font-bold text-xs uppercase tracking-wider group transition-colors self-start md:self-auto"
        >
          <span>VIEW FULL GALLERY</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Content Area */}
      {loading ? (
        /* Editorial Skeleton Layout */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[520px]">
          {/* Main Feature Skeleton */}
          <div className="md:col-span-6 h-64 md:h-full bg-slate-200/80 animate-pulse rounded-3xl" />
          {/* Supporting Grid Skeletons */}
          <div className="md:col-span-6 grid grid-cols-2 gap-4 h-full">
            <div className="bg-slate-200/80 animate-pulse rounded-2xl h-44 md:h-auto" />
            <div className="bg-slate-200/80 animate-pulse rounded-2xl h-44 md:h-auto" />
            <div className="bg-slate-200/80 animate-pulse rounded-2xl h-44 md:h-auto" />
            <div className="bg-slate-200/80 animate-pulse rounded-2xl h-44 md:h-auto" />
          </div>
        </div>
      ) : displayItems.length > 0 ? (
        /* Editorial Balanced Photo Grid */
        displayItems.length >= 4 ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 min-h-[500px]">
            {/* Feature Photo (Large on Left) */}
            <div className="md:col-span-6 lg:col-span-7">
              <Link
                href={`/trips/${displayItems[0].tripSlug || displayItems[0].tripId}`}
                className="group relative block w-full h-80 md:h-[520px] rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/80 hover:border-brand-500/40 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <Image
                  src={displayItems[0].url}
                  alt={displayItems[0].caption || displayItems[0].destinationName}
                  fill
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end text-white z-10">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand-500 text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider self-start mb-2 shadow-sm">
                    <Compass className="w-3 h-3" />
                    <span>{displayItems[0].travelType}</span>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold uppercase truncate text-white">
                    {displayItems[0].tripTitle || displayItems[0].caption || displayItems[0].destinationName}
                  </h3>
                  <div className="flex items-center space-x-3 text-xs text-slate-300 mt-1">
                    <span className="inline-flex items-center space-x-1">
                      <User className="w-3 h-3 text-amber-300" />
                      <span className="font-medium text-white">{displayItems[0].photographerName}</span>
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center space-x-1 text-cyan-300 font-semibold">
                      <MapPin className="w-3 h-3" />
                      <span>{displayItems[0].destinationName}</span>
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Supporting Photos (Grid of 4 on Right) */}
            <div className="md:col-span-6 lg:col-span-5 grid grid-cols-2 gap-4 sm:gap-5">
              {displayItems.slice(1, 5).map((item) => (
                <Link
                  key={item.id}
                  href={`/trips/${item.tripSlug || item.tripId}`}
                  className="group relative block w-full h-44 sm:h-52 md:h-[248px] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/80 hover:border-brand-500/40 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <Image
                    src={item.url}
                    alt={item.caption || item.destinationName}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-3.5 sm:p-4 flex flex-col justify-end text-white z-10">
                    <p className="text-[11px] font-bold text-white truncate">{item.photographerName}</p>
                    <p className="text-[10px] text-cyan-300 font-semibold truncate">
                      {item.destinationName} • {item.travelType}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          /* Flexible Grid if fewer than 4 photos available */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {displayItems.map((item) => (
              <Link
                key={item.id}
                href={`/trips/${item.tripSlug || item.tripId}`}
                className="group relative block w-full h-64 sm:h-72 rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/80 hover:border-brand-500/40 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <Image
                  src={item.url}
                  alt={item.caption || item.destinationName}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white z-10">
                  <p className="text-xs font-bold text-white truncate">{item.photographerName}</p>
                  <p className="text-[11px] text-cyan-300 font-semibold truncate">
                    {item.destinationName} • {item.travelType}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-6 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-lg mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="font-display text-xl font-bold uppercase text-slate-800">
            No Community Photos Yet
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed font-light">
            Every photo uploaded inside an approved community trip report will automatically appear here.
          </p>
          <div className="pt-2">
            <Link
              href="/trips/share"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md transition-all"
            >
              <span>Share Your Travel Photos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
