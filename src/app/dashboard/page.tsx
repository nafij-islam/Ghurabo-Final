'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TripCard from '@/components/cards/TripCard';
import EditProfileModal from '@/components/profile/EditProfileModal';
import { ITrip, IUser } from '@/types';
import { Compass, User, Clock, FileText, Bookmark, Heart, ShieldCheck, PlusCircle, Edit3 } from 'lucide-react';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [publishedTrips, setPublishedTrips] = useState<ITrip[]>([]);
  const [pendingTrips, setPendingTrips] = useState<ITrip[]>([]);
  const [drafts, setDrafts] = useState<ITrip[]>([]);
  const [savedTrips, setSavedTrips] = useState<ITrip[]>([]);
  const [activeTab, setActiveTab] = useState<'published' | 'pending' | 'saved' | 'drafts'>('published');
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          const user = data.user as IUser;
          setCurrentUser(user);

          // Fetch user's own trips
          fetch(`/api/trips?status=all&userId=${encodeURIComponent(user.id)}`)
            .then((res) => res.json())
            .then((tripData) => {
              if (tripData.success) {
                const all = (tripData.trips || []) as ITrip[];
                const myTrips = all.filter(
                  (t) =>
                    t.userId === user.id ||
                    t.userName.toLowerCase() === user.name.toLowerCase() ||
                    t.userName.toLowerCase() === user.email.toLowerCase()
                );

                setPublishedTrips(myTrips.filter((t) => t.status === 'approved'));
                setPendingTrips(myTrips.filter((t) => t.status === 'pending'));
                setDrafts(myTrips.filter((t) => t.status === 'draft'));
              }
            });

          // Fetch user's saved trips from MongoDB Atlas
          fetch('/api/users/saved-trips')
            .then((res) => res.json())
            .then((savedData) => {
              if (savedData.success && Array.isArray(savedData.savedTrips)) {
                setSavedTrips(savedData.savedTrips);
              }
              setLoading(false);
            })
            .catch(() => setLoading(false));
        } else {
          setLoading(false);
        }
      });
  }, []);

  return (
    <div className="w-full pt-28 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Profile Header Card */}
        <div className="bg-darkslate-900 text-white p-8 rounded-3xl shadow-xl mb-10 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-6">
            <img
              src={currentUser?.avatar || 'https://i.pravatar.cc/150'}
              alt={currentUser?.name || 'User'}
              className="w-20 h-20 rounded-full object-cover border-4 border-brand-500 shadow-lg bg-slate-800"
            />
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="font-display text-3xl font-bold uppercase text-white">{currentUser?.name || 'Traveller Account'}</h1>
                <span className="px-3 py-0.5 bg-brand-500 text-white text-[10px] font-bold rounded-full uppercase">
                  {currentUser?.role || 'Traveller'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 font-light">{currentUser?.bio || 'No bio added yet.'}</p>
              <div className="flex items-center space-x-4 text-xs text-cyan-300 mt-3 font-semibold">
                <span>{currentUser?.location || 'Location not specified'}</span>
                <span>•</span>
                <span>{(currentUser?.followersCount || 0).toLocaleString()} Followers</span>
                <span>•</span>
                <span>{(currentUser?.totalHelpfulVotes || 0).toLocaleString()} Helpful Votes</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {currentUser && (
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase px-5 py-3 rounded-full border border-slate-700 shadow transition-all"
              >
                <Edit3 className="w-4 h-4 text-brand-400" />
                <span>Edit Profile</span>
              </button>
            )}

            <Link
              href="/trips/share"
              className="flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase px-6 py-3 rounded-full shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Share New Trip</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Published Trips</span>
              <span className="font-display text-3xl font-extrabold text-slate-900">{publishedTrips.length}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Pending Approvals</span>
              <span className="font-display text-3xl font-extrabold text-amber-600">{pendingTrips.length}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Saved Drafts</span>
              <span className="font-display text-3xl font-extrabold text-slate-700">{drafts.length}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-3 mb-8 border-b border-slate-200 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('published')}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap ${
              activeTab === 'published' ? 'bg-brand-500 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Published Trips ({publishedTrips.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap ${
              activeTab === 'pending' ? 'bg-amber-500 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending Review ({pendingTrips.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap ${
              activeTab === 'saved' ? 'bg-emerald-600 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Saved Trips ({savedTrips.length})
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap ${
              activeTab === 'drafts' ? 'bg-slate-800 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Drafts ({drafts.length})
          </button>
        </div>

        {/* Content Tab Display */}
        {activeTab === 'published' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedTrips.map((t) => (
              <TripCard key={t.id} trip={t} />
            ))}
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingTrips.length > 0 ? (
              pendingTrips.map((t) => (
                <div key={t.id} className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase">
                      Under Admin Review
                    </span>
                    <span className="text-xs text-slate-400">{t.travelDate}</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900">{t.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 font-light">{t.summary}</p>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-12 text-center bg-white rounded-3xl border border-slate-100 text-slate-500 text-xs">
                No trips currently awaiting moderation approval.
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedTrips.length > 0 ? (
              savedTrips.map((t) => (
                <TripCard key={t.id} trip={t} />
              ))
            ) : (
              <div className="col-span-3 py-12 text-center bg-white rounded-3xl border border-slate-100 text-slate-500 text-xs font-medium">
                You haven&apos;t saved any trips yet. Browse trips and click &quot;Save&quot; to bookmark your favorite itineraries!
              </div>
            )}
          </div>
        )}

        {activeTab === 'drafts' && (
          <div className="py-12 text-center bg-white rounded-3xl border border-slate-100 text-slate-500 text-xs">
            No saved drafts found.
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && currentUser && (
        <EditProfileModal
          user={currentUser}
          onClose={() => setShowEditModal(false)}
          onSuccess={(updated) => {
            setCurrentUser(updated);
          }}
        />
      )}
    </div>
  );
}
