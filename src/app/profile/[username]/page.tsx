'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TripCard from '@/components/cards/TripCard';
import EditProfileModal from '@/components/profile/EditProfileModal';
import { ITrip, IUser } from '@/types';
import {
  MapPin,
  Compass,
  Users,
  UserCheck,
  UserPlus,
  Edit3,
  X,
  Sparkles,
  Heart,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usersApi } from '@/lib/api/users.api';
import { tripsApi } from '@/lib/api/trips.api';
import {
  adaptBackendPublicProfileToIUser,
  adaptBackendTripToITrip,
} from '@/lib/api/adapters';
import { FollowUserItem } from '@/lib/api/api.types';
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary';

export default function ProfilePage() {
  const params = useParams();
  const rawParam = params?.slug || params?.username || '';
  const username = (Array.isArray(rawParam) ? rawParam[0] : rawParam) as string;

  const { user: currentUser, isAuthenticated, refreshAuth } = useAuth();
  const router = useRouter();

  const [userProfile, setUserProfile] = useState<IUser | null>(null);
  const [userTrips, setUserTrips] = useState<ITrip[]>([]);
  const [profileUsername, setProfileUsername] = useState<string>('');
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [tripsCount, setTripsCount] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [submittingFollow, setSubmittingFollow] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tripsLoading, setTripsLoading] = useState(true);

  // Modal for Followers / Following list
  const [activeListModal, setActiveListModal] = useState<'followers' | 'following' | null>(null);
  const [listUsers, setListUsers] = useState<FollowUserItem[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const fetchProfileData = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    setTripsLoading(true);

    try {
      const profileData = await usersApi.getPublicProfile(username);
      const adapted = adaptBackendPublicProfileToIUser(profileData);
      setUserProfile(adapted);
      setProfileUsername(profileData.username || username);

      const fCount = profileData.stats?.followersCount ?? profileData.followersCount ?? 0;
      const fgCount = profileData.stats?.followingCount ?? profileData.followingCount ?? 0;
      const tCount = profileData.stats?.tripsCount ?? profileData.tripsCount ?? 0;
      setFollowersCount(fCount);
      setFollowingCount(fgCount);
      setTripsCount(tCount);

      const followingState = profileData.viewerState?.isFollowing ?? profileData.isFollowing ?? false;
      setIsFollowing(followingState);

      // Fetch public trips for this author
      try {
        const tripsRes = await tripsApi.getTrips({
          author: profileData.id || (profileData as any)._id,
          limit: 50,
        });
        if (tripsRes?.data) {
          const adaptedTrips = tripsRes.data.map(adaptBackendTripToITrip);
          setUserTrips(adaptedTrips);
          setTripsCount(adaptedTrips.length);
        }
      } catch (tripsErr) {
        console.warn('Failed to load author public trips:', tripsErr);
      } finally {
        setTripsLoading(false);
      }
    } catch (err) {
      console.warn('Public profile fetch error:', err);
      // Fallback if viewing own profile
      if (
        currentUser &&
        (currentUser.id === username ||
          currentUser.name.toLowerCase() === username.toLowerCase())
      ) {
        setUserProfile(currentUser);
        setProfileUsername(currentUser.name);
        try {
          const myTripsRes = await usersApi.getMyTrips({ limit: 50 });
          if (myTripsRes?.data) {
            const adaptedTrips = myTripsRes.data
              .map(adaptBackendTripToITrip)
              .filter((t) => t.status === 'approved');
            setUserTrips(adaptedTrips);
            setTripsCount(adaptedTrips.length);
          }
        } catch {
          // Non-blocking
        } finally {
          setTripsLoading(false);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [username, currentUser]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const activeUser = userProfile || currentUser;
  const isSelf =
    currentUser &&
    activeUser &&
    (currentUser.id === activeUser.id ||
      currentUser.email?.toLowerCase() === activeUser.email?.toLowerCase());

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/profile/${encodeURIComponent(profileUsername || username)}`);
      return;
    }

    if (submittingFollow || isSelf) return;
    setSubmittingFollow(true);

    const prevFollowing = isFollowing;
    const prevCount = followersCount;
    const nextFollowing = !prevFollowing;
    const nextCount = nextFollowing ? prevCount + 1 : Math.max(0, prevCount - 1);

    // Optimistic UI update
    setIsFollowing(nextFollowing);
    setFollowersCount(nextCount);

    try {
      const res = await usersApi.toggleFollow(profileUsername || username);
      setIsFollowing(res.isFollowing);
      setFollowersCount(res.followersCount);
    } catch (err) {
      // Rollback on error
      setIsFollowing(prevFollowing);
      setFollowersCount(prevCount);
    } finally {
      setSubmittingFollow(false);
    }
  };

  const handleOpenListModal = async (type: 'followers' | 'following') => {
    setActiveListModal(type);
    setListLoading(true);
    setListUsers([]);

    try {
      const targetUser = profileUsername || username;
      const res =
        type === 'followers'
          ? await usersApi.getFollowers(targetUser, { limit: 50 })
          : await usersApi.getFollowing(targetUser, { limit: 50 });

      if (res?.data) {
        setListUsers(res.data);
      }
    } catch (err) {
      console.error(`Failed to load ${type} list:`, err);
    } finally {
      setListLoading(false);
    }
  };

  if (loading && !activeUser) {
    return (
      <div className="w-full min-h-screen pt-24 pb-20 bg-slate-50">
        <div className="relative h-64 sm:h-80 w-full bg-slate-800 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-20">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6 animate-pulse">
            <div className="w-28 h-28 rounded-full bg-slate-200 -mt-16" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-48 bg-slate-200 rounded" />
              <div className="h-4 w-72 bg-slate-200 rounded" />
              <div className="h-4 w-36 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-white rounded-3xl border border-slate-100" />
            ))}
          </div>
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
              src={activeUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300'}
              alt={activeUser?.name || 'Traveller Profile'}
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl -mt-14 md:-mt-16 bg-slate-100"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300';
              }}
            />
            <div>
              <div className="flex items-center space-x-3 justify-center md:justify-start">
                <h1 className="font-display text-3xl font-bold uppercase text-slate-900">
                  {activeUser?.name || 'Traveller Profile'}
                </h1>
                <span className="px-3 py-0.5 bg-brand-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {activeUser?.badges?.[0] || activeUser?.preferredStyle || 'Explorer'}
                </span>
              </div>

              {profileUsername && (
                <p className="text-xs text-brand-600 font-semibold mt-0.5">
                  @{profileUsername}
                </p>
              )}

              <p className="text-xs text-slate-600 mt-2 font-light max-w-md leading-relaxed">
                {activeUser?.bio || 'Passionate traveler exploring Bangladesh and sharing authentic journeys.'}
              </p>

              {/* Stats & Metadata Pills */}
              <div className="flex flex-wrap items-center space-x-4 text-xs font-semibold text-slate-600 mt-4 justify-center md:justify-start gap-y-2">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-500" />
                  <span>{activeUser?.location || 'Dhaka, Bangladesh'}</span>
                </span>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleOpenListModal('followers')}
                  className="hover:text-brand-600 transition-colors cursor-pointer"
                >
                  <span className="font-extrabold text-slate-900">{followersCount.toLocaleString()}</span> Followers
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleOpenListModal('following')}
                  className="hover:text-brand-600 transition-colors cursor-pointer"
                >
                  <span className="font-extrabold text-slate-900">{followingCount.toLocaleString()}</span> Following
                </button>
                <span>•</span>
                <span>
                  <span className="font-extrabold text-slate-900">{tripsCount.toLocaleString()}</span> Trips Shared
                </span>
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
                type="button"
                disabled={submittingFollow}
                onClick={handleFollowToggle}
                className={`px-7 py-3 rounded-full text-xs font-bold uppercase shadow transition-all cursor-pointer flex items-center space-x-2 disabled:opacity-60 ${
                  isFollowing
                    ? 'bg-slate-800 hover:bg-slate-900 text-white'
                    : 'bg-brand-500 hover:bg-brand-600 text-white'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>+ Follow Traveller</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Author Published Trips */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-3xl font-bold text-slate-900 uppercase">
            Published Trips ({tripsCount})
          </h2>
        </div>

        {tripsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-white rounded-3xl border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : userTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-100 text-slate-500 text-xs font-medium space-y-3">
            <Compass className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">This traveler hasn&apos;t shared any trips yet.</p>
            <p className="text-slate-400 font-light">When they publish verified itineraries, their adventures will appear here.</p>
            {isSelf && (
              <Link
                href="/trips/share"
                className="inline-block mt-2 px-6 py-3 bg-brand-500 text-white font-bold rounded-full uppercase shadow hover:bg-brand-600 transition-all text-xs"
              >
                + Share Your First Trip
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Followers / Following Modal */}
      {activeListModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-brand-500" />
                <h3 className="font-display text-lg font-bold text-slate-900 uppercase">
                  {activeListModal === 'followers' ? 'Followers' : 'Following'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveListModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-6 space-y-3">
              {listLoading ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl">
                      <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-28 bg-slate-200 rounded" />
                        <div className="h-2.5 w-40 bg-slate-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : listUsers.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400 font-light italic">
                  {activeListModal === 'followers'
                    ? 'No followers yet.'
                    : 'Not following anyone yet.'}
                </div>
              ) : (
                listUsers.map((u) => {
                  const avatarUrl =
                    u.avatar?.url ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
                  return (
                    <Link
                      key={u._id || u.id}
                      href={`/profile/${u.username}`}
                      onClick={() => setActiveListModal(null)}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <img
                          src={getOptimizedImageUrl(avatarUrl, { width: 80, height: 80 })}
                          alt={u.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
                          }}
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 truncate group-hover:text-brand-600 transition-colors">
                            {u.fullName || u.username}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate font-light">
                            @{u.username}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider shrink-0 ml-2">
                        View &rarr;
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && activeUser && (
        <EditProfileModal
          user={activeUser}
          onClose={() => setShowEditModal(false)}
          onSuccess={(updated) => {
            setUserProfile(updated);
            refreshAuth();
            fetchProfileData();
          }}
        />
      )}
    </div>
  );
}
