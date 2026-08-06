'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import TripCard from '@/components/cards/TripCard';
import { ITrip, IUser, IGalleryItem } from '@/types';
import { MapPin, Award, Users, Compass, ThumbsUp, Heart } from 'lucide-react';

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [user, setUser] = useState<IUser | null>(null);
  const [userTrips, setUserTrips] = useState<ITrip[]>([]);
  const [userPhotos, setUserPhotos] = useState<IGalleryItem[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trips')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const allTrips = (data.trips || []) as ITrip[];
          const authorTrips = allTrips.filter((t) => t.userId === username || t.userName.toLowerCase().replace(/\s+/g, '-') === username);
          setUserTrips(authorTrips);
        }
      });

    fetch('/api/gallery')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const allGallery = (data.gallery || []) as IGalleryItem[];
          setUserPhotos(allGallery.filter((g) => g.photographerId === username));
        }
        setLoading(false);
      });
  }, [username]);

  return (
    <div className="w-full pt-20 pb-20 bg-slate-50 min-h-screen">
      {/* Profile Cover Image */}
      <div className="relative h-64 sm:h-80 w-full bg-darkslate-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1600"
          alt="Cover"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-20">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl -mt-14 md:-mt-16"
            />
            <div>
              <div className="flex items-center space-x-3 justify-center md:justify-start">
                <h1 className="font-display text-3xl font-bold uppercase text-slate-900">Aria Montgomery</h1>
                <span className="px-3 py-0.5 bg-brand-500 text-white text-[10px] font-bold rounded-full uppercase">
                  Top Backpacker
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-light max-w-md">
                Full-time solo backpacker & landscape photographer. 34 countries and counting!
              </p>
              <div className="flex items-center space-x-4 text-xs font-semibold text-slate-600 mt-3 justify-center md:justify-start">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-500" />
                  <span>Dhaka, Bangladesh</span>
                </span>
                <span>•</span>
                <span>3,420 Followers</span>
                <span>•</span>
                <span>489 Helpful Votes</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`px-7 py-3 rounded-full text-xs font-bold uppercase shadow transition-all ${
              isFollowing ? 'bg-slate-800 text-white' : 'bg-brand-500 hover:bg-brand-600 text-white'
            }`}
          >
            {isFollowing ? 'Following' : '+ Follow Traveller'}
          </button>
        </div>

        {/* User Published Trips */}
        <h2 className="font-display text-3xl font-bold text-slate-900 uppercase mb-6">
          Published Trips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {userTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </div>
    </div>
  );
}
