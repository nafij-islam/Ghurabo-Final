'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bookmark, Star, ShieldCheck, MapPin, Clock, Heart } from 'lucide-react';
import { ITrip } from '@/types';

interface TripCardProps {
  trip: ITrip;
}

export default function TripCard({ trip }: TripCardProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(trip.likesCount || 0);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const verifyAuth = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.user) return true;
    } catch (e) {}
    return false;
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isAuthed = await verifyAuth();
    if (!isAuthed) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/trips/${trip.slug || trip.id}`)}`);
      return;
    }

    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    try {
      await fetch(`/api/trips/${trip.id || (trip as any)._id}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'like' }),
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {}
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isAuthed = await verifyAuth();
    if (!isAuthed) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/trips/${trip.slug || trip.id}`)}`);
      return;
    }

    setSaved(!saved);
    try {
      await fetch(`/api/trips/${trip.id || (trip as any)._id}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'save' }),
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {}
  };

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-card-hover border border-slate-100 transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1">
      {/* Top Image Section */}
      <div className="relative h-60 w-full overflow-hidden bg-slate-100">
        <img
          src={trip.coverImage}
          alt={trip.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            {/* Travel Type Badge */}
            <span className="px-3 py-1 bg-brand-500/90 backdrop-blur-md text-white text-xs font-bold rounded-full uppercase tracking-wider shadow">
              {trip.travelType}
            </span>
            {/* Verified Badge */}
            {trip.isVerified && (
              <span className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-500/90 backdrop-blur-md text-white text-xs font-semibold rounded-full shadow">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified</span>
              </span>
            )}
          </div>

          {/* Save / Bookmark Button */}
          <button
            onClick={handleSave}
            aria-label="Save trip"
            className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
              saved
                ? 'bg-white text-amber-500 shadow-md'
                : 'bg-black/30 text-white hover:bg-white hover:text-slate-800'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Image Overlay Info */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white z-10">
          <div className="flex items-center space-x-2 text-xs font-medium text-white/90">
            <MapPin className="w-3.5 h-3.5 text-brand-300" />
            <span className="truncate max-w-[160px]">{trip.destinationName}</span>
          </div>
          <div className="flex items-center space-x-1 bg-black/40 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-xs font-bold text-amber-300">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{trip.ratings?.overall || 4.9}</span>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Author info & Duration */}
          <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <img
                src={trip.userAvatar}
                alt={trip.userName}
                className="w-6 h-6 rounded-full object-cover border border-slate-200"
              />
              <span className="font-medium text-slate-700 truncate max-w-[120px]">{trip.userName}</span>
            </div>
            <div className="flex items-center space-x-1 font-medium text-slate-500">
              <Clock className="w-3.5 h-3.5 text-brand-500" />
              <span>{trip.durationDays} Days</span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/trips/${trip.slug || trip.id}`}>
            <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-2 leading-snug">
              {trip.title}
            </h3>
          </Link>

          {/* Short summary snippet */}
          <p className="text-slate-600 text-xs line-clamp-2 mb-4 font-light leading-relaxed">
            {trip.summary}
          </p>
        </div>

        {/* Card Footer: Cost & Like */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Cost / Person</span>
            <div className="flex items-baseline text-slate-900 font-bold">
              <span className="text-xs text-brand-600 font-bold">$</span>
              <span className="text-lg text-brand-600 font-extrabold">{trip.costBreakdown?.perPersonCost || 120}</span>
              <span className="text-[11px] text-slate-400 font-normal ml-1">total</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                liked
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-600'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </button>

            <Link
              href={`/trips/${trip.slug || trip.id}`}
              className="text-xs font-bold text-brand-600 hover:text-brand-800 uppercase tracking-wider"
            >
              Details &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
