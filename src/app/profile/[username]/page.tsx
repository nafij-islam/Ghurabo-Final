'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import TripCard from '@/components/cards/TripCard';
import EditProfileModal from '@/components/profile/EditProfileModal';
import { ITrip, IUser, IGalleryItem } from '@/types';
import { MapPin, Award, Users, Compass, ThumbsUp, Heart, Edit3 } from 'lucide-react';

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [userProfile, setUserProfile] = useState<IUser | null>(null);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [userTrips, setUserTrips] = useState<ITrip[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check logged in user
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      });

    // Fetch target user profile from MongoDB Atlas / API
    fetch(`/api/users/profile?id=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUserProfile(data.user);
        }
      });

    // Fetch author's published trips
    fetch('/api/trips')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const allTrips = (data.trips || []) as ITrip[];
          const authorTrips = allTrips.filter(
            (t) =>
              t.userId === username ||
              t.userName.toLowerCase().replace(/\s+/g, '-') === username.toLowerCase() ||
              t.userName.toLowerCase() === username.toLowerCase()
          );
          setUserTrips(authorTrips);
        }
        setLoading(false);
      });
  }, [username]);

  const activeUser = userProfile || currentUser;
  const isSelf =
    currentUser &&
    activeUser &&
    (currentUser.id === activeUser.id || currentUser.email.toLowerCase() === activeUser.email?.toLowerCase());

  if (loading && !activeUser) {
    return (
      <div className="w-full min-h-screen pt-32 pb-20 bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Loading Traveller Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pt-20 pb-20 bg-slate-50 min-h-screen">
      {/* Profile Cover Image Banner */}
      <div className="relative h-64 sm:h-80 w-full bg-darkslate-900 overflow-hidden">
        <img
          src={
            activeUser?.coverImage ||
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1600'
          }
          alt="Profile Cover"
          className="w-full h-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-20">
        {/* Profile Details Card */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
            <img
              src={activeUser?.avatar || 'https://i.pravatar.cc/150'}
              alt={activeUser?.name || 'Traveller Profile'}
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl -mt-14 md:-mt-16 bg-slate-100"
            />
            <div>
              <div className="flex items-center space-x-3 justify-center md:justify-start">
                <h1 className="font-display text-3xl font-bold uppercase text-slate-900">
                  {activeUser?.name || 'Explorer'}
                </h1>
                <span className="px-3 py-0.5 bg-brand-500 text-white text-[10px] font-bold rounded-full uppercase">
                  {activeUser?.badges?.[0] || activeUser?.preferredStyle || 'Explorer'}
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-1 font-light max-w-md leading-relaxed">
                {activeUser?.bio || 'Passionate traveller & community story author.'}
              </p>

              <div className="flex flex-wrap items-center space-x-4 text-xs font-semibold text-slate-600 mt-3 justify-center md:justify-start gap-y-1">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-500" />
                  <span>{activeUser?.location || 'Dhaka, Bangladesh'}</span>
                </span>
                <span>•</span>
                <span>{(activeUser?.followersCount || 3420).toLocaleString()} Followers</span>
                <span>•</span>
                <span>{(activeUser?.totalHelpfulVotes || 489).toLocaleString()} Helpful Votes</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isSelf ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-full text-xs font-bold uppercase shadow transition-all flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-7 py-3 rounded-full text-xs font-bold uppercase shadow transition-all ${
                  isFollowing ? 'bg-slate-800 text-white' : 'bg-brand-500 hover:bg-brand-600 text-white'
                }`}
              >
                {isFollowing ? 'Following' : '+ Follow Traveller'}
              </button>
            )}
          </div>
        </div>

        {/* Author Published Trips */}
        <h2 className="font-display text-3xl font-bold text-slate-900 uppercase mb-6">
          Published Trips ({userTrips.length})
        </h2>

        {userTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 text-slate-500 text-xs font-medium space-y-3">
            <Compass className="w-10 h-10 text-slate-300 mx-auto" />
            <p>No published trip stories found for this traveller yet.</p>
            {isSelf && (
              <Link
                href="/trips/share"
                className="inline-block px-5 py-2.5 bg-brand-500 text-white font-bold rounded-full uppercase shadow hover:bg-brand-600 transition-all text-xs"
              >
                + Share Your First Trip
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && activeUser && (
        <EditProfileModal
          user={activeUser}
          onClose={() => setShowEditModal(false)}
          onSuccess={(updated) => {
            setUserProfile(updated);
            setCurrentUser(updated);
          }}
        />
      )}
    </div>
  );
}
