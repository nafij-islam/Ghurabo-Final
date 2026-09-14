'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bookmark, Star, ShieldCheck, MapPin, Clock, Heart } from 'lucide-react';
import { ITrip } from '@/types';
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary';
import { usePreferences } from '@/context/PreferencesContext';
import { useAuth } from '@/hooks/useAuth';
import { tripsApi } from '@/lib/api';

interface TripCardProps {
  trip: ITrip;
}

export default function TripCard({ trip }: TripCardProps) {
  const [liked, setLiked] = useState(() => trip.isLiked ?? trip.viewerState?.hasLiked ?? false);
  const [likesCount, setLikesCount] = useState(trip.likesCount || 0);
  const [saved, setSaved] = useState(() => trip.isSaved ?? trip.viewerState?.hasSaved ?? false);
  const [submittingLike, setSubmittingLike] = useState(false);
  const [submittingSave, setSubmittingSave] = useState(false);

  React.useEffect(() => {
    if (trip.viewerState) {
      setLiked(!!trip.viewerState.hasLiked);
      setSaved(!!trip.viewerState.hasSaved);
    } else if (typeof trip.isLiked === 'boolean') {
      setLiked(trip.isLiked);
    }
  }, [trip.viewerState, trip.isLiked, trip.isSaved]);
  const { formatCost, t } = usePreferences();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/trips/${trip.slug || trip.id}`)}`);
      return;
    }

    if (submittingLike) return;
    setSubmittingLike(true);

    const prevLiked = liked;
    const prevCount = likesCount;
    const nextLiked = !prevLiked;
    const nextCount = nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1);

    // Optimistic UI update
    setLiked(nextLiked);
    setLikesCount(nextCount);

    try {
      const res = await tripsApi.toggleLike(trip.id);
      setLiked(res.active);
      setLikesCount(res.count);
    } catch {
      // Rollback on error
      setLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setSubmittingLike(false);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/trips/${trip.slug || trip.id}`)}`);
      return;
    }

    if (submittingSave) return;
    setSubmittingSave(true);

    const prevSaved = saved;
    setSaved(!prevSaved);

    try {
      const res = await tripsApi.toggleSave(trip.id);
      setSaved(res.active);
    } catch {
      // Rollback
      setSaved(prevSaved);
    } finally {
      setSubmittingSave(false);
    }
  };

  const perPersonCostBDT = trip.costBreakdown?.perPersonCost || trip.costBreakdown?.totalCost || 0;

  const fallbackCover = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800';
  const [cardImg, setCardImg] = useState(() => getOptimizedImageUrl(trip.coverImage, { width: 600, height: 400 }));

  React.useEffect(() => {
    setCardImg(getOptimizedImageUrl(trip.coverImage, { width: 600, height: 400 }));
  }, [trip.coverImage]);

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-card-hover border border-slate-100 transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1">
      {/* Top Image Section */}
      <div className="relative h-60 w-full overflow-hidden bg-slate-100">
        <Image
          src={cardImg}
          alt={trip.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setCardImg(fallbackCover)}
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
                <span>{t('trip.verified')}</span>
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
            <Link
              href={`/profile/${trip.authorUsername || trip.userName}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center space-x-2 group/author hover:opacity-80 transition-opacity"
            >
              <Image
                src={getOptimizedImageUrl(trip.userAvatar, { width: 100, height: 100 })}
                alt={trip.userName ? `${trip.userName}'s profile photo` : 'Author profile photo'}
                width={24}
                height={24}
                className="w-6 h-6 rounded-full object-cover border border-slate-200"
              />
              <span className="font-medium text-slate-700 truncate max-w-[120px] group-hover/author:text-brand-600 transition-colors">{trip.userName}</span>
            </Link>
            <div className="flex items-center space-x-1 font-medium text-slate-500">
              <Clock className="w-3.5 h-3.5 text-brand-500" />
              <span>{trip.durationDays} {t('trip.days')}</span>
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
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">{t('trip.perPerson')}</span>
            <div className="flex items-baseline text-slate-900 font-bold">
              <span className="text-lg text-brand-600 font-extrabold">{formatCost(perPersonCostBDT)}</span>
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
              {t('trip.viewDetails')} &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
