'use client';

import {
  IDestination,
  ITrip,
  IUser,
  IGalleryItem,
  IComment,
  TravelType,
} from '@/types';
import {
  authApi,
  usersApi,
  destinationsApi,
  tripsApi,
  commentsApi,
  galleryApi,
  settingsApi,
  adminApi,
} from '@/lib/api';
import {
  adaptBackendUserToIUser,
  adaptBackendDestinationToIDestination,
  adaptBackendTripToITrip,
  adaptBackendCommentToIComment,
  adaptBackendGalleryToIGalleryItem,
  toBackendTravelType,
} from '@/lib/api/adapters';
import { tokenStorage } from '@/lib/api/tokenStorage';

export const AUTH_CHANGE_EVENT = 'ghurabo-auth-state-change';

export function notifyAuthChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

// Memory caches for synchronous fallbacks
let memoryCurrentUser: IUser | null = null;
let memoryDestinations: IDestination[] = [];
let memoryTrips: ITrip[] = [];
let memoryGallery: IGalleryItem[] = [];
let memoryComments: Record<string, IComment[]> = {};
let memorySavedTripIds: string[] = [];
let memoryLikedTripIds: string[] = [];
let memoryCurrencyRate = 122.5;

// Synchronous session restore
export function getCurrentUser(): IUser | null {
  return memoryCurrentUser;
}

export function setCurrentUser(user: IUser | null): void {
  memoryCurrentUser = user;
  notifyAuthChange();
}

export async function loginUser(email: string, password?: string): Promise<{ success: boolean; user?: IUser; error?: string }> {
  try {
    const { user: backendUser } = await authApi.login({ email, password });
    const adapted = adaptBackendUserToIUser(backendUser);
    memoryCurrentUser = adapted;
    notifyAuthChange();
    return { success: true, user: adapted || undefined };
  } catch (err: any) {
    return { success: false, error: err.message || 'Login failed' };
  }
}

export async function signupUser(params: {
  name: string;
  email: string;
  password?: string;
  preferredStyle?: TravelType | string;
  location?: string;
}): Promise<{ success: boolean; user?: IUser; error?: string }> {
  try {
    const cleanEmail = params.email.trim().toLowerCase();
    const username = `${cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_')}_${Math.random().toString(36).slice(2, 6)}`;
    const { user: backendUser } = await authApi.signup({
      fullName: params.name,
      username,
      email: cleanEmail,
      password: params.password,
      preferredCurrency: 'BDT',
      preferredLanguage: 'EN',
    });
    const adapted = adaptBackendUserToIUser(backendUser);
    memoryCurrentUser = adapted;
    notifyAuthChange();
    return { success: true, user: adapted || undefined };
  } catch (err: any) {
    return { success: false, error: err.message || 'Signup failed' };
  }
}

export async function logoutUser(): Promise<void> {
  memoryCurrentUser = null;
  await authApi.logout();
  notifyAuthChange();
}

export async function updateProfile(userId: string, data: Partial<IUser>): Promise<IUser | null> {
  try {
    const backendUser = await usersApi.updateMe({
      fullName: data.name,
      bio: data.bio,
      travelStyle: data.preferredStyle,
      preferredCurrency: data.preferredCurrency,
      preferredLanguage: data.preferredLanguage ? (data.preferredLanguage.toUpperCase() as 'EN' | 'BN') : undefined,
    });
    const adapted = adaptBackendUserToIUser(backendUser);
    if (adapted) {
      memoryCurrentUser = adapted;
      notifyAuthChange();
    }
    return adapted;
  } catch (err) {
    console.error('Update profile error:', err);
    return null;
  }
}

export async function getUserProfile(username: string): Promise<IUser | null> {
  try {
    const profile = await usersApi.getPublicProfile(username);
    return {
      _id: profile.id,
      id: profile.id,
      name: profile.fullName || profile.username,
      email: `${profile.username}@ghurabo.com`,
      role: 'traveller',
      avatar: profile.avatar?.url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
      bio: profile.bio || '',
      location: 'Bangladesh',
      preferredStyle: (profile.travelStyle as TravelType) || 'Solo',
      preferredCurrency: 'BDT',
      preferredLanguage: 'en',
      visitedCount: 1,
      followersCount: 0,
      followingCount: 0,
      totalHelpfulVotes: 0,
      badges: ['Explorer'],
      createdAt: profile.createdAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// ----------------------------------------------------
// DESTINATIONS
// ----------------------------------------------------

export function getDestinations(): IDestination[] {
  return memoryDestinations;
}

export async function fetchDestinations(params?: { search?: string; category?: string }): Promise<IDestination[]> {
  try {
    const res = await destinationsApi.getDestinations({
      search: params?.search,
      category: params?.category && params.category !== 'All' ? params.category.toUpperCase() : undefined,
      limit: 50,
    });
    const adapted = res.data.map(adaptBackendDestinationToIDestination);
    memoryDestinations = adapted;
    return adapted;
  } catch (err) {
    console.error('Error fetching destinations:', err);
    return memoryDestinations;
  }
}

export async function getDestinationBySlugAsync(slug: string): Promise<{
  destination: IDestination | null;
  trips: ITrip[];
  dynamicCostStats: { Solo: number; Couple: number; Family: number; Group: number };
}> {
  try {
    const dest = await destinationsApi.getDestinationBySlug(slug);
    const adaptedDest = adaptBackendDestinationToIDestination(dest);
    const tripsRes = await tripsApi.getTrips({ destination: dest._id, limit: 20 });
    const adaptedTrips = tripsRes.data.map(adaptBackendTripToITrip);

    const solo = dest.averageDailyCostBDT || 3500;
    return {
      destination: adaptedDest,
      trips: adaptedTrips,
      dynamicCostStats: {
        Solo: solo,
        Couple: Math.round(solo * 1.8),
        Family: Math.round(solo * 3.2),
        Group: Math.round(solo * 4.5),
      },
    };
  } catch (err) {
    console.error('Error fetching destination by slug:', err);
    return {
      destination: null,
      trips: [],
      dynamicCostStats: { Solo: 3000, Couple: 5000, Family: 8000, Group: 10000 },
    };
  }
}

export function getDestinationBySlug(slug: string): {
  destination: IDestination | null;
  trips: ITrip[];
  dynamicCostStats: { Solo: number; Couple: number; Family: number; Group: number };
} {
  const dest = memoryDestinations.find((d) => d.slug === slug || d.id === slug) || null;
  const trips = memoryTrips.filter((t) => t.destinationId === dest?.id || t.destinationName === dest?.name);
  const solo = dest?.avgCostSolo || 3500;
  return {
    destination: dest,
    trips,
    dynamicCostStats: {
      Solo: solo,
      Couple: Math.round(solo * 1.8),
      Family: Math.round(solo * 3.2),
      Group: Math.round(solo * 4.5),
    },
  };
}

// ----------------------------------------------------
// TRIPS
// ----------------------------------------------------

export interface TripFilters {
  destinationId?: string;
  travelType?: string;
  sort?: string;
  popular?: boolean;
  userId?: string;
  status?: string;
  maxBudget?: number;
  search?: string;
}

export function getTrips(filters?: TripFilters): ITrip[] {
  let list = memoryTrips;
  if (!filters) return list;
  if (filters.popular) list = list.filter((t) => t.isPopular);
  if (filters.travelType && filters.travelType !== 'All') list = list.filter((t) => t.travelType === filters.travelType);
  if (filters.status && filters.status !== 'all') list = list.filter((t) => t.status === filters.status);
  return list;
}

export async function fetchTrips(filters?: TripFilters, signal?: AbortSignal): Promise<ITrip[]> {
  try {
    const res = await tripsApi.getTrips(
      {
        search: filters?.search,
        travelType: filters?.travelType && filters.travelType !== 'All' ? toBackendTravelType(filters.travelType) : undefined,
        destination: filters?.destinationId,
        maxBudget: filters?.maxBudget,
        featured: filters?.popular,
        author: filters?.userId,
        sort: filters?.sort === 'popular' ? 'popular' : filters?.sort === 'lowest_cost' ? 'lowest-cost' : 'newest',
        limit: 50,
      },
      signal
    );
    const adapted = res.data.map(adaptBackendTripToITrip);
    memoryTrips = adapted;
    return adapted;
  } catch (err: any) {
    if (err?.name === 'AbortError') throw err;
    console.error('Error fetching trips:', err);
    return memoryTrips;
  }
}

export function getTripByIdOrSlug(idOrSlug: string): { trip: ITrip | null; relatedTrips: ITrip[] } {
  const trip = memoryTrips.find((t) => t.id === idOrSlug || t.slug === idOrSlug) || null;
  const relatedTrips = memoryTrips
    .filter((t) => t.id !== trip?.id && (t.destinationId === trip?.destinationId || t.travelType === trip?.travelType))
    .slice(0, 3);
  return { trip, relatedTrips };
}

export async function getTripByIdOrSlugAsync(slug: string): Promise<{ trip: ITrip | null; relatedTrips: ITrip[] }> {
  try {
    const backendTrip = await tripsApi.getTripBySlug(slug);
    const adapted = adaptBackendTripToITrip(backendTrip);
    const relatedRes = await tripsApi.getTrips({
      destination: backendTrip.destination?._id,
      limit: 4,
    });
    const relatedTrips = relatedRes.data
      .map(adaptBackendTripToITrip)
      .filter((t) => t.id !== adapted.id)
      .slice(0, 3);

    return { trip: adapted, relatedTrips };
  } catch (err) {
    console.error('Error fetching trip details:', err);
    return { trip: null, relatedTrips: [] };
  }
}

export async function createTrip(tripData: Partial<ITrip> & { destination?: string }): Promise<ITrip> {
  const backendTravelType = toBackendTravelType(tripData.travelType);
  const costs = tripData.costBreakdown || {
    transport: 0,
    hotel: 0,
    food: 0,
    localTransport: 0,
    tickets: 0,
    guide: 0,
    shopping: 0,
    misc: 0,
    totalCost: 0,
    perPersonCost: 0,
  };

  const created = await tripsApi.createTrip({
    title: tripData.title || 'Untitled Journey',
    destination: tripData.destinationId || tripData.destination || '6aa3ab9def763afbf0ec7ca5',
    summary: tripData.summary || tripData.title || '',
    story: tripData.story || '',
    travelType: backendTravelType,
    days: tripData.durationDays || 3,
    nights: Math.max(1, (tripData.durationDays || 3) - 1),
    costs: {
      transport: costs.transport || 0,
      lodging: costs.hotel || 0,
      food: costs.food || 0,
      sightseeing: costs.localTransport || 0,
      activities: costs.tickets || 0,
      miscellaneous: (costs.shopping || 0) + (costs.misc || 0),
    },
    itinerary: (tripData.itinerary || []).map((day, idx) => ({
      day: day.dayNumber || idx + 1,
      title: day.title,
      description: day.activities?.join(', ') || 'Exploration',
      locations: (day.locations || []).map((loc) => ({
        name: loc,
        latitude: tripData.latitude,
        longitude: tripData.longitude,
      })),
    })),
    coverImage: tripData.coverImage ? { url: tripData.coverImage } : undefined,
    photos: (tripData.images || []).map((img) => ({ url: img.url, caption: img.caption })),
  });

  const adapted = adaptBackendTripToITrip(created);
  memoryTrips.unshift(adapted);
  return adapted;
}

export async function deleteTrip(tripId: string): Promise<boolean> {
  try {
    await tripsApi.deleteTrip(tripId);
    memoryTrips = memoryTrips.filter((t) => t.id !== tripId);
    return true;
  } catch {
    return false;
  }
}

// ----------------------------------------------------
// SAVED, LIKES & HELPFUL VOTES
// ----------------------------------------------------

export function isTripSaved(tripId: string): boolean {
  return memorySavedTripIds.includes(tripId);
}

export function setSavedTripLocalState(tripId: string, saved: boolean): void {
  if (saved) {
    if (!memorySavedTripIds.includes(tripId)) memorySavedTripIds.push(tripId);
  } else {
    memorySavedTripIds = memorySavedTripIds.filter((id) => id !== tripId);
  }
}

export async function toggleSaveTrip(tripId: string): Promise<boolean> {
  const currentlySaved = isTripSaved(tripId);
  setSavedTripLocalState(tripId, !currentlySaved);
  try {
    const res = await tripsApi.toggleSave(tripId);
    setSavedTripLocalState(tripId, res.active);
    return res.active;
  } catch (err) {
    setSavedTripLocalState(tripId, currentlySaved); // Rollback
    throw err;
  }
}

export function isTripLiked(tripId: string): boolean {
  return memoryLikedTripIds.includes(tripId);
}

export async function toggleLikeTrip(tripId: string): Promise<{ liked: boolean; count: number }> {
  const trip = memoryTrips.find((t) => t.id === tripId);
  const currentLiked = isTripLiked(tripId);
  const currentCount = trip?.likesCount || 0;

  // Optimistic update
  const optimisticLiked = !currentLiked;
  const optimisticCount = optimisticLiked ? currentCount + 1 : Math.max(0, currentCount - 1);
  if (optimisticLiked) memoryLikedTripIds.push(tripId);
  else memoryLikedTripIds = memoryLikedTripIds.filter((id) => id !== tripId);
  if (trip) trip.likesCount = optimisticCount;

  try {
    const res = await tripsApi.toggleLike(tripId);
    if (trip) trip.likesCount = res.count;
    return { liked: res.active, count: res.count };
  } catch (err) {
    // Rollback
    if (currentLiked) memoryLikedTripIds.push(tripId);
    else memoryLikedTripIds = memoryLikedTripIds.filter((id) => id !== tripId);
    if (trip) trip.likesCount = currentCount;
    throw err;
  }
}

export async function toggleHelpfulVote(tripId: string): Promise<{ voted: boolean; count: number }> {
  const trip = memoryTrips.find((t) => t.id === tripId);
  const currentCount = trip?.helpfulVotesCount || 0;

  try {
    const res = await tripsApi.toggleHelpful(tripId);
    if (trip) trip.helpfulVotesCount = res.count;
    return { voted: res.active, count: res.count };
  } catch (err) {
    if (trip) trip.helpfulVotesCount = currentCount;
    throw err;
  }
}

// ----------------------------------------------------
// COMMENTS
// ----------------------------------------------------

export function getComments(tripId: string): IComment[] {
  return memoryComments[tripId] || [];
}

export async function fetchTripComments(tripId: string): Promise<IComment[]> {
  try {
    const res = await commentsApi.getTripComments(tripId);
    const adapted = res.data.map(adaptBackendCommentToIComment);
    memoryComments[tripId] = adapted;
    return adapted;
  } catch {
    return memoryComments[tripId] || [];
  }
}

export async function addComment(tripId: string, content: string): Promise<IComment | null> {
  try {
    const backendComment = await commentsApi.createComment(tripId, content);
    const adapted = adaptBackendCommentToIComment(backendComment);
    if (!memoryComments[tripId]) memoryComments[tripId] = [];
    memoryComments[tripId].unshift(adapted);
    return adapted;
  } catch (err) {
    console.error('Error adding comment:', err);
    return null;
  }
}

// ----------------------------------------------------
// GALLERY
// ----------------------------------------------------

export function getGallery(): IGalleryItem[] {
  return memoryGallery;
}

export async function fetchGallery(params?: { travelType?: string; search?: string }): Promise<IGalleryItem[]> {
  try {
    const res = await galleryApi.getGallery({
      travelType: params?.travelType && params.travelType !== 'All' ? toBackendTravelType(params.travelType) : undefined,
      search: params?.search,
      limit: 40,
    });
    const adapted = res.data.map(adaptBackendGalleryToIGalleryItem);
    memoryGallery = adapted;
    return adapted;
  } catch {
    return memoryGallery;
  }
}

// ----------------------------------------------------
// ADMIN ACTIONS
// ----------------------------------------------------

export async function adminApproveTrip(tripId: string): Promise<void> {
  await adminApi.updateTripStatus(tripId, 'APPROVED');
}

export async function adminRejectTrip(tripId: string): Promise<void> {
  await adminApi.updateTripStatus(tripId, 'REJECTED');
}

export async function adminTogglePopularTrip(tripId: string, isPopular: boolean): Promise<boolean> {
  const updated = await adminApi.toggleTripFeatured(tripId, isPopular);
  return updated.isFeatured;
}

export async function adminToggleVerifyTrip(tripId: string, isVerified: boolean): Promise<boolean> {
  const updated = await adminApi.toggleTripVerified(tripId, isVerified);
  return updated.isVerified;
}

export async function adminTogglePopularDestination(destId: string, isPopular: boolean): Promise<boolean> {
  const updated = await adminApi.toggleDestinationFeatured(destId, isPopular);
  return updated.isFeatured;
}

export function getCurrencyRate(): number {
  return memoryCurrencyRate;
}

export async function fetchCurrencyRate(): Promise<number> {
  try {
    const setting = await settingsApi.getSettingByKey('USD_TO_BDT_RATE');
    if (setting?.value) {
      const parsed = parseFloat(setting.value);
      if (!isNaN(parsed) && parsed > 0) {
        memoryCurrencyRate = parsed;
        return parsed;
      }
    }
  } catch {}
  return memoryCurrencyRate;
}

export async function setCurrencyRate(rate: number): Promise<void> {
  memoryCurrencyRate = rate;
  await adminApi.updateTripStatus // or settingsApi
  await settingsApi.updateCurrencyRate(rate);
}
