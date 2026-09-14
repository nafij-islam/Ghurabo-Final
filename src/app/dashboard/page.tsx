'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TripCard from '@/components/cards/TripCard';
import dynamic from 'next/dynamic';
import DashboardTripCard from '@/components/trips/DashboardTripCard';

const EditTripModal = dynamic(() => import('@/components/trips/EditTripModal'), { ssr: false });
const EditProfileModal = dynamic(() => import('@/components/profile/EditProfileModal'), { ssr: false });
import { ITrip, IUser, CurrencyCode } from '@/types';
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
  DollarSign,
  Check,
  MapPin,
} from 'lucide-react';
import { usePreferences } from '@/context/PreferencesContext';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { usersApi } from '@/lib/api/users.api';
import { tripsApi } from '@/lib/api/trips.api';
import { adaptBackendTripToITrip } from '@/lib/api/adapters';

import { useUserTrips, useSavedTrips } from '@/lib/swr/hooks';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, refreshAuth } = useAuth();
  const [currentUser, setCurrentUser] = useState<IUser | null>(user || null);
  const [activeTab, setActiveTab] = useState<'published' | 'pending' | 'saved' | 'drafts'>('published');
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const { currency, setCurrency } = usePreferences();
  const [currencySaving, setCurrencySaving] = useState(false);
  const [currencyFeedback, setCurrencyFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (currencyFeedback) {
      const timer = setTimeout(() => setCurrencyFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [currencyFeedback]);

  const handleCurrencyChange = async (targetCurrency: CurrencyCode) => {
    if (currencySaving) return;
    const currentActive = currentUser?.preferredCurrency || currency;
    if (currentActive === targetCurrency) return;

    setCurrencySaving(true);
    setCurrencyFeedback(null);

    try {
      await setCurrency(targetCurrency);
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          preferredCurrency: targetCurrency,
        });
      }
      setCurrencyFeedback({
        type: 'success',
        message: `Preferred currency saved: ${targetCurrency === 'USD' ? 'USD ($)' : 'BDT (৳)'}. Trip prices now display accordingly.`,
      });
    } catch (err: any) {
      setCurrencyFeedback({
        type: 'error',
        message: err?.message || 'Failed to save preferred currency. Please try again.',
      });
    } finally {
      setCurrencySaving(false);
    }
  };

  useEffect(() => {
    if (user) setCurrentUser(user);
  }, [user]);

  const {
    trips: allUserTrips,
    isLoading: isUserTripsLoading,
    mutate: mutateUserTrips,
  } = useUserTrips();

  const {
    trips: savedTrips,
    isLoading: isSavedTripsLoading,
    mutate: mutateSavedTrips,
  } = useSavedTrips();

  const publishedTrips = allUserTrips.filter((t) => t.status === 'approved');
  const pendingTrips = allUserTrips.filter((t) => t.status === 'pending');
  const drafts = allUserTrips.filter((t) => t.status === 'draft');
  const loading = (isUserTripsLoading && allUserTrips.length === 0) || (isSavedTripsLoading && savedTrips.length === 0);

  // CRUD State
  const [selectedTripToEdit, setSelectedTripToEdit] = useState<ITrip | null>(null);
  const [tripToDelete, setTripToDelete] = useState<ITrip | null>(null);
  const [deletingTrip, setDeletingTrip] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  // Clear feedback after 4 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Handle Edit Success
  const handleTripUpdated = (updated: ITrip) => {
    mutateUserTrips();
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
      mutateUserTrips();
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
    <div className="w-full pt-24 sm:pt-28 pb-16 sm:pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mb-4 sm:mb-6 p-3.5 sm:p-4 rounded-2xl flex items-center justify-between border shadow-sm transition-all ${
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
              className="text-slate-400 hover:text-slate-600 p-1 shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* User Profile Header Card */}
        <div className="bg-darkslate-900 text-white p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl shadow-xl mb-6 sm:mb-10 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6 w-full md:w-auto">
            <Image
              src={currentUser?.avatar || 'https://i.pravatar.cc/150'}
              alt={currentUser?.name || 'User Avatar'}
              width={80}
              height={80}
              priority
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-brand-500 shadow-lg bg-slate-800 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold uppercase text-white truncate max-w-full">
                  {currentUser?.name || 'Traveller Account'}
                </h1>
                <span className="px-2.5 py-0.5 bg-brand-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0">
                  {currentUser?.role || 'Traveller'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1.5 font-light max-w-xl line-clamp-3 sm:line-clamp-none">
                {currentUser?.bio || 'No bio added yet.'}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5 text-xs text-cyan-300 mt-3 font-semibold">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span>{currentUser?.location || 'Location not specified'}</span>
                </span>
                <span className="text-white/30 hidden sm:inline">•</span>
                <span>{(currentUser?.followersCount || 0).toLocaleString()} Followers</span>
                <span className="text-white/30 hidden sm:inline">•</span>
                <span>{(currentUser?.totalHelpfulVotes || 0).toLocaleString()} Helpful Votes</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto shrink-0">
            {currentUser && (
              <button
                onClick={() => setShowEditProfileModal(true)}
                className="flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase px-5 py-2.5 sm:py-3 rounded-full border border-slate-700 shadow transition-all w-full sm:w-auto cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-brand-400" />
                <span>Edit Profile</span>
              </button>
            )}

            <Link
              href="/trips/share"
              className="flex items-center justify-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase px-6 py-2.5 sm:py-3 rounded-full shadow-lg transition-all w-full sm:w-auto text-center"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Share New Trip</span>
            </Link>
          </div>
        </div>

        {/* Profile Settings: Preferred Currency */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 shadow-sm border border-slate-100 mb-6 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center space-x-3 sm:space-x-3.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="font-display text-base sm:text-lg font-bold uppercase text-slate-900">
                  Preferred Currency
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Choose your default currency for viewing trip costs and budgets across Ghurabo.
                </p>
              </div>
            </div>

            {/* Currency Option Toggle Buttons */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 sm:gap-2 bg-slate-100/80 p-1.5 rounded-xl sm:rounded-2xl border border-slate-200/80 w-full sm:w-auto shrink-0">
              <button
                type="button"
                disabled={currencySaving}
                onClick={() => handleCurrencyChange('BDT')}
                className={`flex items-center justify-center space-x-1.5 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  (currentUser?.preferredCurrency || currency) === 'BDT'
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                } ${currencySaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span>BDT (৳)</span>
                {(currentUser?.preferredCurrency || currency) === 'BDT' && (
                  <Check className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="button"
                disabled={currencySaving}
                onClick={() => handleCurrencyChange('USD')}
                className={`flex items-center justify-center space-x-1.5 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  (currentUser?.preferredCurrency || currency) === 'USD'
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                } ${currencySaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span>USD ($)</span>
                {(currentUser?.preferredCurrency || currency) === 'USD' && (
                  <Check className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Inline Saving / Feedback Status */}
          {currencySaving && (
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center space-x-2 text-xs font-semibold text-brand-600">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving currency preference to your account...</span>
            </div>
          )}

          {currencyFeedback && !currencySaving && (
            <div
              className={`mt-3.5 pt-3 border-t border-slate-100 flex items-center space-x-2 text-xs font-semibold ${
                currencyFeedback.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {currencyFeedback.type === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              )}
              <span>{currencyFeedback.message}</span>
            </div>
          )}
        </div>

        {/* Dashboard Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-10">
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] sm:text-xs text-slate-500 uppercase tracking-wider block font-semibold">
                Published Trips
              </span>
              <span className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                {publishedTrips.length}
              </span>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] sm:text-xs text-slate-500 uppercase tracking-wider block font-semibold">
                Pending Approvals
              </span>
              <span className="font-display text-2xl sm:text-3xl font-extrabold text-amber-600">
                {pendingTrips.length}
              </span>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] sm:text-xs text-slate-500 uppercase tracking-wider block font-semibold">
                Saved Drafts
              </span>
              <span className="font-display text-2xl sm:text-3xl font-extrabold text-slate-700">
                {drafts.length}
              </span>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="-mx-3.5 px-3.5 sm:mx-0 sm:px-0 flex items-center space-x-2 sm:space-x-3 mb-6 sm:mb-8 border-b border-slate-200 pb-3 sm:pb-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('published')}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'published'
                ? 'bg-brand-500 text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Published Trips ({publishedTrips.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending Review ({pendingTrips.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Saved Trips ({savedTrips.length})
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap shrink-0 cursor-pointer ${
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 h-96 p-4 sm:p-5 flex flex-col justify-between"
              >
                <div className="h-44 bg-slate-200 rounded-xl sm:rounded-2xl mb-4" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
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
                  <div className="col-span-full py-12 sm:py-16 px-4 sm:px-6 text-center bg-white rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 shadow-sm flex flex-col items-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                      <Compass className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-slate-800">
                      No Published Trips Yet
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mt-1 mb-5 sm:mb-6">
                      Share your unique travel itinerary, budgets, and experiences with the Ghurabo community!
                    </p>
                    <Link
                      href="/trips/share"
                      className="inline-flex items-center justify-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase px-6 py-3 rounded-full shadow-lg transition-all w-full sm:w-auto"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
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
                  <div className="col-span-full py-12 sm:py-16 px-4 sm:px-6 text-center bg-white rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 shadow-sm flex flex-col items-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                      <Clock className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-slate-800">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {savedTrips.length > 0 ? (
                  savedTrips.map((t) => (
                    <TripCard key={t.id} trip={t} />
                  ))
                ) : (
                  <div className="col-span-full py-12 sm:py-16 px-4 sm:px-6 text-center bg-white rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 shadow-sm flex flex-col items-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                      <Bookmark className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-slate-800">
                      No Saved Trips
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mt-1 mb-5 sm:mb-6">
                      Browse stories and itineraries from other travelers, and bookmark them for your next journey.
                    </p>
                    <Link
                      href="/trips"
                      className="inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase px-6 py-3 rounded-full shadow-lg transition-all w-full sm:w-auto"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
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
                  <div className="col-span-full py-12 sm:py-16 px-4 sm:px-6 text-center bg-white rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 shadow-sm flex flex-col items-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mb-4">
                      <FileText className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-slate-800">
                      No Drafts Saved
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mt-1 mb-5 sm:mb-6">
                      When you start creating a trip and save it as a draft, it will appear here.
                    </p>
                    <Link
                      href="/trips/share"
                      className="inline-flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase px-6 py-3 rounded-full shadow-lg transition-all w-full sm:w-auto"
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
            if (updated.preferredCurrency) {
              setCurrency(updated.preferredCurrency);
            }
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 sm:space-y-5">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl sm:rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold text-slate-900">
                  Delete Trip Itinerary?
                </h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-900 line-clamp-1">{tripToDelete.title}</p>
              <p className="text-slate-500 leading-relaxed">
                Deleting this trip will permanently remove it from Ghurabo, along with all associated comments and community likes.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTripToDelete(null)}
                disabled={deletingTrip}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50 w-full sm:w-auto text-center cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingTrip}
                className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition-all disabled:opacity-50 w-full sm:w-auto cursor-pointer"
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
