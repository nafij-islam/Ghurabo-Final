'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Eye,
  Edit3,
  Trash2,
  MapPin,
  Clock,
  Heart,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  FileText,
  Bookmark,
} from 'lucide-react';
import { ITrip } from '@/types';
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary';
import { usePreferences } from '@/context/PreferencesContext';

interface DashboardTripCardProps {
  trip: ITrip;
  onEdit: (trip: ITrip) => void;
  onDelete: (trip: ITrip) => void;
}

export default function DashboardTripCard({ trip, onEdit, onDelete }: DashboardTripCardProps) {
  const { formatCost } = usePreferences();
  const fallbackCover =
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800';
  const [cardImg, setCardImg] = useState(() =>
    getOptimizedImageUrl(trip.coverImage, { width: 600, height: 400 })
  );

  const statusBadge = () => {
    switch (trip.status) {
      case 'approved':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow">
            <CheckCircle2 className="w-3 h-3" />
            <span>Published</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow">
            <Clock className="w-3 h-3" />
            <span>Under Review</span>
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-700/90 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow">
            <FileText className="w-3 h-3" />
            <span>Draft</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-rose-500/90 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow">
            <AlertCircle className="w-3 h-3" />
            <span>{trip.status || 'Archived'}</span>
          </span>
        );
    }
  };

  const perPersonCost = trip.costBreakdown?.perPersonCost || trip.costBreakdown?.totalCost || 0;

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
      {/* Cover Image & Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
        <Image
          src={cardImg || fallbackCover}
          alt={trip.title || 'Trip cover'}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onError={() => setCardImg(fallbackCover)}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
          <div>{statusBadge()}</div>
          <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
            {trip.travelType || 'Solo'}
          </span>
        </div>

        {/* Bottom Destination & Cost */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between text-white">
          <div className="flex items-center space-x-1.5 text-xs text-white/90 font-medium">
            <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span className="truncate max-w-[170px]">{trip.destinationName || 'Bangladesh'}</span>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-white/70 uppercase font-semibold">Est. Cost</div>
            <div className="text-sm font-extrabold text-white">
              {formatCost(perPersonCost)}
            </div>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 text-[11px] text-slate-400 mb-2">
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{trip.durationDays || 1} Days</span>
            </span>
            <span>•</span>
            <span>{trip.travelDate || 'Recent'}</span>
          </div>

          <h3 className="font-display font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {trip.title}
          </h3>

          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {trip.summary}
          </p>
        </div>

        {/* Stats Row */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-slate-600">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span className="font-semibold">{trip.likesCount || 0}</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-600">
              <MessageCircle className="w-3.5 h-3.5 text-cyan-600" />
              <span className="font-semibold">{trip.commentsCount || 0}</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-600">
              <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold">{trip.savesCount || 0}</span>
            </span>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="pt-4 mt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
          <Link
            href={`/trips/${trip.slug || trip.id}`}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs rounded-xl transition-all"
            title="View Public Trip Page"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View</span>
          </Link>

          <button
            type="button"
            onClick={() => onEdit(trip)}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-xl transition-all"
            title="Edit Trip Details"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(trip)}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 font-bold text-xs rounded-xl transition-all"
            title="Delete Trip"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
