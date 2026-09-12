'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TripCard from '@/components/cards/TripCard';
import DashboardTripCard from '@/components/trips/DashboardTripCard';
import EditTripModal from '@/components/trips/EditTripModal';
import EditProfileModal from '@/components/profile/EditProfileModal';
import { ITrip, IUser } from '@/types';
import {
  Compass,
  User,
  Clock,
  FileText,
  Bookmark,
  Heart,
  ShieldCheck,
  PlusCircle,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  X,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { usersApi } from '@/lib/api/users.api';
import { tripsApi } from '@/lib/api/trips.api';
import { adaptBackendTripToITrip } from '@/lib/api/adapters';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, refreshAuth } = useAuth();
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [publishedTrips, setPublishedTrips] = useState<ITrip[]>([]);
  const [pendingTrips, setPendingTrips] = useState<ITrip[]>([]);
  const [drafts, setDrafts] = useState<ITrip[]>([]);
  const [savedTrips, setSavedTrips] = useState<ITrip[]>([]);
  const [activeTab, setActiveTab] = useState<'published' | 'pending' | 'saved' | 'drafts'>('published');
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // CRUD State
  const [selectedTripToEdit, setSelectedTripToEdit] = useState<ITrip | null>(null);
  const [tripToDelete, setTripToDelete] = useState<ITrip | null>(null);
  const [deletingTrip, setDeletingTrip] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard');
      return;
    }

    if (user) {
      setCurrentUser(user);
      Promise.allSettled([
        usersApi.getMyTrips({ limit: 100 }),
        usersApi.getMySavedTrips({ limit: 100 }),
      ])
        .then(([tripsRes, savedRes]) => {
          if (tripsRes.status === 'fulfilled' && tripsRes.value?.data) {
            const adapted = tripsRes.value.data.map(adaptBackendTripToITrip);
            setPublishedTrips(adapted.filter((t) => t.status === 'approved'));
            setPendingTrips(adapted.filter((t) => t.status === 'pending'));
            setDrafts(adapted.filter((t) => t.status === 'draft'));
          }
          if (savedRes.status === 'fulfilled' && savedRes.value?.data) {
            const adaptedSaved = savedRes.value.data.map(adaptBackendTripToITrip);
            setSavedTrips(adaptedSaved);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Clear feedback after 4 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Handle Edit Success
  const handleTripUpdated = (updated: ITrip) => {
    setPublishedTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setPendingTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setDrafts((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTripToEdit(null);
    setFeedback({
      type: 'success',
      message: `Trip "${updated.title}" has been updated successfully!`,
    });
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!tripToDelete) return;
    setDeletingTrip(true);
    try {
      await tripsApi.deleteTrip(tripToDelete.id);
      const deletedTitle = tripToDelete.title;
      setPublishedTrips((prev) => prev.filter((t) => t.id !== tripToDelete.id));
      setPendingTrips((prev) => prev.filter((t) => t.id !== tripToDelete.id));
      setDrafts((prev) => prev.filter((t) => t.id !== tripToDelete.id));
      setTripToDelete(null);
      setFeedback({
        type: 'success',
        message: `Trip "${deletedTitle}" was deleted successfully.`,
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to delete trip. Please try again.',
      });
    } finally {
      setDeletingTrip(false);
    }
  };

  return (
    <div className="w-full pt-28 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center justify-between border shadow-sm transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center space-x-2 text-xs font-semibold">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* User Profile Header Card */}
        <div className="bg-darkslate-900 text-white p-8 rounded-3xl shadow-xl mb-10 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-6">
            <Image
              src={currentUser?.avatar || 'https://i.pravatar.cc/150'}
              alt={currentUser?.name || 'User Avatar'}
              width={80}
              height={80}
              priority
              className="w-20 h-20 rounded-full object-cover border-4 border-brand-500 shadow-lg bg-slate-800"
            />
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="font-display text-3xl font-bold uppercase text-white">
                  {currentUser?.name || 'Traveller Account'}
                </h1>
                <span className="px-3 py-0.5 bg-brand-500 text-white text-[10px] font-bold rounded-full uppercase">
                  {currentUser?.role || 'Traveller'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 font-light">
                {currentUser?.bio || 'No bio added yet.'}
              </p>
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
                onClick={() => setShowEditProfileModal(true)}
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
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">
                Published Trips
              </span>
              <span className="font-display text-3xl font-extrabold text-slate-900">
                {publishedTrips.length}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">
                Pending Approvals
              </span>
              <span className="font-display text-3xl font-extrabold text-amber-600">
                {pendingTrips.length}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">
                Saved Drafts
              </span>
              <span className="font-display text-3xl font-extrabold text-slate-700">
                {drafts.length}
              </span>
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
              activeTab === 'published'
                ? 'bg-brand-500 text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Published Trips ({publishedTrips.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending Review ({pendingTrips.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap ${
              activeTab === 'saved'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Saved Trips ({savedTrips.length})
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap ${
              activeTab === 'drafts'
                ? 'bg-slate-800 text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Drafts ({drafts.length})
          </button>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 h-96 p-5 flex flex-col justify-between"
              >
                <div className="h-44 bg-slate-200 rounded-2xl mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
                <div className="h-10 bg-slate-100 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Published Trips Tab */}
            {activeTab === 'published' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {publishedTrips.length > 0 ? (
                  publishedTrips.map((t) => (
                    <DashboardTripCard
                      key={t.id}
                      trip={t}
                      onEdit={(trip) => setSelectedTripToEdit(trip)}
                      onDelete={(trip) => setTripToDelete(trip)}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-16 px-6 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                      <Compass className="w-8 h-8" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-slate-800">
                      No Published Trips Yet
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mt-1 mb-6">
                      Share your unique travel itinerary, budgets, and experiences with the Ghurabo community!
                    </p>
                    <Link
                      href="/trips/share"
                      className="inline-flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase px-6 py-3 rounded-full shadow-lg transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>+ Share Your First Trip</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Pending Trips Tab */}
            {activeTab === 'pending' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pendingTrips.length > 0 ? (
                  pendingTrips.map((t) => (
                    <DashboardTripCard
                      key={t.id}
                      trip={t}
                      onEdit={(trip) => setSelectedTripToEdit(trip)}
                      onDelete={(trip) => setTripToDelete(trip)}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-16 px-6 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                      <Clock className="w-8 h-8" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-slate-800">
                      No Pending Trips
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mt-1">
                      All submitted itineraries have been reviewed by our moderation team.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Saved Trips Tab */}
            {activeTab === 'saved' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {savedTrips.length > 0 ? (
                  savedTrips.map((t) => (
                    <TripCard key={t.id} trip={t} />
                  ))
                ) : (
                  <div className="col-span-full py-16 px-6 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                      <Bookmark className="w-8 h-8" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-slate-800">
                      No Saved Trips
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mt-1 mb-6">
                      Browse stories and itineraries from other travelers, and bookmark them for your next journey.
                    </p>
                    <Link
                      href="/trips"
                      className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase px-6 py-3 rounded-full shadow-lg transition-all"
                    >
                      <Compass className="w-4 h-4" />
                      <span>Explore Trips</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Drafts Tab */}
            {activeTab === 'drafts' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {drafts.length > 0 ? (
                  drafts.map((t) => (
                    <DashboardTripCard
                      key={t.id}
                      trip={t}
                      onEdit={(trip) => setSelectedTripToEdit(trip)}
                      onDelete={(trip) => setTripToDelete(trip)}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-16 px-6 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-slate-800">
                      No Drafts Saved
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mt-1 mb-6">
                      When you start creating a trip and save it as a draft, it will appear here.
                    </p>
                    <Link
                      href="/trips/share"
                      className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase px-6 py-3 rounded-full shadow-lg transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Start a New Trip</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditProfileModal && currentUser && (
        <EditProfileModal
          user={currentUser}
          onClose={() => setShowEditProfileModal(false)}
          onSuccess={(updated) => {
            setCurrentUser(updated);
            refreshAuth();
          }}
        />
      )}

      {/* Edit Trip Modal */}
      {selectedTripToEdit && (
        <EditTripModal
          trip={selectedTripToEdit}
          onClose={() => setSelectedTripToEdit(null)}
          onSuccess={handleTripUpdated}
        />
      )}

      {/* Delete Trip Confirmation Modal */}
      {tripToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Delete Trip Itinerary?
                </h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-900 line-clamp-1">{tripToDelete.title}</p>
              <p className="text-slate-500">
                Deleting this trip will permanently remove it from Ghurabo, along with all associated comments and community likes.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setTripToDelete(null)}
                disabled={deletingTrip}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingTrip}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition-all disabled:opacity-50"
              >
                {deletingTrip && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{deletingTrip ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
