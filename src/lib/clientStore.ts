'use client';

import { IDestination, ITrip, IUser, IGalleryItem, IComment, TravelType } from '@/types';
import { SEED_DESTINATIONS, SEED_TRIPS, SEED_GALLERY, SEED_USERS } from './seedData';

export const AUTH_CHANGE_EVENT = 'ghurabo-auth-state-change';

export function notifyAuthChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

// Storage Keys
const USERS_KEY = 'ghurabo_users';
const CURRENT_USER_KEY = 'ghurabo_current_user';
const DESTINATIONS_KEY = 'ghurabo_destinations';
const TRIPS_KEY = 'ghurabo_trips';
const GALLERY_KEY = 'ghurabo_gallery';
const SAVED_TRIPS_KEY = 'ghurabo_saved_trips';
const LIKED_TRIPS_KEY = 'ghurabo_liked_trips';
const HELPFUL_VOTES_KEY = 'ghurabo_helpful_votes';
const COMMENTS_KEY = 'ghurabo_comments';
const CURRENCY_RATE_KEY = 'ghurabo_currency_rate';

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function getStoredJson<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function setStoredJson<T>(key: string, value: T): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}

/**
 * Initializes localStorage with default seed data if not yet populated.
 */
export function initClientStore(): void {
  if (!isClient()) return;

  if (!localStorage.getItem(DESTINATIONS_KEY)) {
    setStoredJson(DESTINATIONS_KEY, SEED_DESTINATIONS);
  }
  if (!localStorage.getItem(TRIPS_KEY)) {
    setStoredJson(TRIPS_KEY, SEED_TRIPS);
  }
  if (!localStorage.getItem(GALLERY_KEY)) {
    setStoredJson(GALLERY_KEY, SEED_GALLERY);
  }
  if (!localStorage.getItem(USERS_KEY)) {
    setStoredJson(USERS_KEY, SEED_USERS);
  }
}

// ----------------------------------------------------
// AUTHENTICATION
// ----------------------------------------------------

export function getCurrentUser(): IUser | null {
  initClientStore();
  return getStoredJson<IUser | null>(CURRENT_USER_KEY, null);
}

export function setCurrentUser(user: IUser | null): void {
  if (user) {
    setStoredJson(CURRENT_USER_KEY, user);
  } else {
    if (isClient()) localStorage.removeItem(CURRENT_USER_KEY);
  }
  notifyAuthChange();
}

export function loginUser(email: string, password?: string): { success: boolean; user?: IUser; error?: string } {
  initClientStore();
  const users = getStoredJson<IUser[]>(USERS_KEY, SEED_USERS);
  const cleanEmail = email.trim().toLowerCase();

  let user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    // If user doesn't exist, create an explorer account on the fly
    const namePart = cleanEmail.split('@')[0];
    const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    user = {
      id: `user_${Date.now()}`,
      name: capitalized,
      email: cleanEmail,
      role: cleanEmail.includes('admin') ? 'admin' : 'traveller',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400`,
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
      bio: 'Explorer and community member.',
      location: 'Dhaka, Bangladesh',
      preferredStyle: 'Solo',
      preferredCurrency: 'BDT',
      preferredLanguage: 'en',
      visitedCount: 1,
      followersCount: 0,
      followingCount: 0,
      totalHelpfulVotes: 0,
      badges: ['New Explorer'],
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    setStoredJson(USERS_KEY, users);
  }

  setCurrentUser(user);
  return { success: true, user };
}

export function signupUser(params: {
  name: string;
  email: string;
  password?: string;
  preferredStyle?: TravelType | string;
  location?: string;
}): { success: boolean; user?: IUser; error?: string } {
  initClientStore();
  const users = getStoredJson<IUser[]>(USERS_KEY, SEED_USERS);
  const cleanEmail = params.email.trim().toLowerCase();

  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: 'An account with this email address already exists.' };
  }

  const newUser: IUser = {
    id: `user_${Date.now()}`,
    name: params.name.trim(),
    email: cleanEmail,
    role: cleanEmail.includes('admin') ? 'admin' : 'traveller',
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400`,
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
    bio: 'Passionate traveller & community explorer.',
    location: params.location || 'Dhaka, Bangladesh',
    preferredStyle: (params.preferredStyle as TravelType) || 'Solo',
    preferredCurrency: 'BDT',
    preferredLanguage: 'en',
    visitedCount: 1,
    followersCount: 0,
    followingCount: 0,
    totalHelpfulVotes: 0,
    badges: ['New Explorer'],
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  setStoredJson(USERS_KEY, users);
  setCurrentUser(newUser);

  return { success: true, user: newUser };
}

export function googleLoginUser(googleUser: {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
}): { success: boolean; user: IUser } {
  initClientStore();
  const users = getStoredJson<IUser[]>(USERS_KEY, SEED_USERS);
  const cleanEmail = (googleUser.email || `google_${googleUser.uid}@ghurabo.com`).trim().toLowerCase();

  let user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (user) {
    if (googleUser.photoURL && !user.avatar) user.avatar = googleUser.photoURL;
    if (googleUser.displayName && (!user.name || user.name === 'User')) user.name = googleUser.displayName;
  } else {
    user = {
      id: `user_google_${googleUser.uid}`,
      name: googleUser.displayName || cleanEmail.split('@')[0] || 'Explorer',
      email: cleanEmail,
      role: cleanEmail.includes('admin') ? 'admin' : 'traveller',
      avatar: googleUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
      bio: 'Explorer and community member.',
      location: 'Bangladesh',
      preferredStyle: 'Solo',
      preferredCurrency: 'BDT',
      preferredLanguage: 'en',
      visitedCount: 1,
      followersCount: 0,
      followingCount: 0,
      totalHelpfulVotes: 0,
      badges: ['Google Verified'],
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    setStoredJson(USERS_KEY, users);
  }

  setCurrentUser(user);
  return { success: true, user };
}

export function logoutUser(): void {
  setCurrentUser(null);
}

export function updateProfile(userId: string, data: Partial<IUser>): IUser | null {
  initClientStore();
  const users = getStoredJson<IUser[]>(USERS_KEY, SEED_USERS);
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  users[idx] = { ...users[idx], ...data };
  setStoredJson(USERS_KEY, users);

  const current = getCurrentUser();
  if (current && current.id === userId) {
    setCurrentUser(users[idx]);
  }

  return users[idx];
}

export function getUserProfile(userIdOrEmail: string): IUser | null {
  initClientStore();
  const users = getStoredJson<IUser[]>(USERS_KEY, SEED_USERS);
  const clean = userIdOrEmail.trim().toLowerCase();
  return users.find((u) => u.id === userIdOrEmail || u.email.toLowerCase() === clean) || null;
}

// ----------------------------------------------------
// DESTINATIONS
// ----------------------------------------------------

export function getDestinations(): IDestination[] {
  initClientStore();
  return getStoredJson<IDestination[]>(DESTINATIONS_KEY, SEED_DESTINATIONS);
}

export function getDestinationBySlug(slug: string): {
  destination: IDestination | null;
  trips: ITrip[];
  dynamicCostStats: { Solo: number; Couple: number; Family: number; Group: number };
} {
  initClientStore();
  const destinations = getDestinations();
  const dest = destinations.find((d) => d.slug === slug || d.id === slug) || null;

  const allTrips = getTrips();
  const trips = dest ? allTrips.filter((t) => t.destinationId === dest.id || t.destinationName === dest.name) : [];

  const dynamicCostStats = {
    Solo: dest?.avgCostSolo || 120,
    Couple: dest?.avgCostCouple || 250,
    Family: dest?.avgCostFamily || 450,
    Group: dest?.avgCostGroup || 600,
  };

  return { destination: dest, trips, dynamicCostStats };
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
}

export function getTrips(filters?: TripFilters): ITrip[] {
  initClientStore();
  let trips = getStoredJson<ITrip[]>(TRIPS_KEY, SEED_TRIPS);

  if (!filters) return trips;

  if (filters.status && filters.status !== 'all') {
    trips = trips.filter((t) => t.status === filters.status);
  } else if (!filters.status) {
    trips = trips.filter((t) => t.status === 'approved');
  }

  if (filters.destinationId) {
    trips = trips.filter((t) => t.destinationId === filters.destinationId);
  }

  if (filters.travelType && filters.travelType !== 'All') {
    trips = trips.filter((t) => t.travelType === filters.travelType);
  }

  if (filters.popular) {
    trips = trips.filter((t) => t.isPopular);
  }

  if (filters.userId) {
    trips = trips.filter((t) => t.userId === filters.userId);
  }

  if (filters.maxBudget) {
    trips = trips.filter((t) => (t.costBreakdown?.perPersonCost || 0) <= filters.maxBudget!);
  }

  if (filters.sort === 'popular') {
    trips.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
  } else {
    trips.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  return trips;
}

export function getTripByIdOrSlug(idOrSlug: string): { trip: ITrip | null; relatedTrips: ITrip[] } {
  initClientStore();
  const trips = getStoredJson<ITrip[]>(TRIPS_KEY, SEED_TRIPS);
  const trip = trips.find((t) => t.id === idOrSlug || t.slug === idOrSlug) || null;

  if (!trip) return { trip: null, relatedTrips: [] };

  const relatedTrips = trips
    .filter((t) => t.id !== trip.id && (t.destinationId === trip.destinationId || t.travelType === trip.travelType))
    .slice(0, 3);

  return { trip, relatedTrips };
}

export function createTrip(tripData: Partial<ITrip>): ITrip {
  initClientStore();
  const trips = getStoredJson<ITrip[]>(TRIPS_KEY, SEED_TRIPS);
  const user = getCurrentUser();

  const id = `trip_${Date.now()}`;
  const slug = (tripData.title || 'trip')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

  const newTrip: ITrip = {
    id,
    slug,
    title: tripData.title || 'Untitled Journey',
    userId: user?.id || 'user_guest',
    userName: user?.name || 'Explorer',
    userAvatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
    destinationId: tripData.destinationId || 'dest_1',
    destinationName: tripData.destinationName || "Cox's Bazar Beach",
    travelDate: tripData.travelDate || new Date().toISOString().split('T')[0],
    travelType: tripData.travelType || 'Solo',
    travellersCount: tripData.travellersCount || 1,
    durationDays: tripData.durationDays || 3,
    summary: tripData.summary || 'A wonderful trip shared with the Ghurabo travel community.',
    story: tripData.story || '',
    highlights: tripData.highlights || [],
    tips: tripData.tips || '',
    safetyNotes: tripData.safetyNotes || '',
    coverImage: tripData.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
    images: tripData.images || [],
    costBreakdown: tripData.costBreakdown || {
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
    },
    itinerary: tripData.itinerary || [],
    status: 'approved', // Instant publishing on pure client-side
    isVerified: true,
    isPopular: false,
    likesCount: 1,
    savesCount: 0,
    helpfulVotesCount: 1,
    commentsCount: 0,
    ratings: { overall: 5.0, safety: 5.0, cleanliness: 4.8, transport: 4.8, accommodation: 5.0, food: 5.0, value: 5.0 },
    createdAt: new Date().toISOString(),
  };

  trips.unshift(newTrip);
  setStoredJson(TRIPS_KEY, trips);

  // Auto-sync cover image to community gallery
  if (newTrip.coverImage) {
    const gallery = getStoredJson<IGalleryItem[]>(GALLERY_KEY, SEED_GALLERY);
    gallery.unshift({
      id: `gal_${Date.now()}`,
      url: newTrip.coverImage,
      caption: newTrip.title,
      tripId: newTrip.id,
      tripTitle: newTrip.title,
      tripSlug: newTrip.slug,
      destinationName: newTrip.destinationName,
      travelType: newTrip.travelType,
      photographerName: newTrip.userName,
      photographerAvatar: newTrip.userAvatar,
      photographerId: newTrip.userId,
      likesCount: 0,
      createdAt: new Date().toISOString(),
    });
    setStoredJson(GALLERY_KEY, gallery);
  }

  return newTrip;
}

export function deleteTrip(tripId: string): boolean {
  initClientStore();
  const trips = getStoredJson<ITrip[]>(TRIPS_KEY, SEED_TRIPS);
  const filtered = trips.filter((t) => t.id !== tripId);
  setStoredJson(TRIPS_KEY, filtered);
  return true;
}

// ----------------------------------------------------
// SAVED, LIKES & HELPFUL VOTES
// ----------------------------------------------------

export function getSavedTrips(userId?: string): ITrip[] {
  initClientStore();
  const user = userId ? { id: userId } : getCurrentUser();
  if (!user) return [];

  const savedMap = getStoredJson<Record<string, string[]>>(SAVED_TRIPS_KEY, {});
  const userSavedIds = savedMap[user.id] || [];

  const trips = getStoredJson<ITrip[]>(TRIPS_KEY, SEED_TRIPS);
  return trips.filter((t) => userSavedIds.includes(t.id));
}

export function isTripSaved(tripId: string): boolean {
  initClientStore();
  const user = getCurrentUser();
  if (!user) return false;

  const savedMap = getStoredJson<Record<string, string[]>>(SAVED_TRIPS_KEY, {});
  const userSaved = savedMap[user.id] || [];
  return userSaved.includes(tripId);
}

export function toggleSaveTrip(tripId: string): boolean {
  initClientStore();
  const user = getCurrentUser();
  if (!user) return false;

  const savedMap = getStoredJson<Record<string, string[]>>(SAVED_TRIPS_KEY, {});
  if (!savedMap[user.id]) savedMap[user.id] = [];

  const idx = savedMap[user.id].indexOf(tripId);
  let saved = false;

  if (idx > -1) {
    savedMap[user.id].splice(idx, 1);
  } else {
    savedMap[user.id].push(tripId);
    saved = true;
  }

  setStoredJson(SAVED_TRIPS_KEY, savedMap);
  return saved;
}

export function toggleLikeTrip(tripId: string): { liked: boolean; count: number } {
  initClientStore();
  const user = getCurrentUser();
  const currentUserId = user?.id || 'guest';

  const likedMap = getStoredJson<Record<string, string[]>>(LIKED_TRIPS_KEY, {});
  if (!likedMap[currentUserId]) likedMap[currentUserId] = [];

  const trips = getStoredJson<ITrip[]>(TRIPS_KEY, SEED_TRIPS);
  const trip = trips.find((t) => t.id === tripId);

  const idx = likedMap[currentUserId].indexOf(tripId);
  let liked = false;

  if (idx > -1) {
    likedMap[currentUserId].splice(idx, 1);
    if (trip && (trip.likesCount || 0) > 0) trip.likesCount = (trip.likesCount || 0) - 1;
  } else {
    likedMap[currentUserId].push(tripId);
    if (trip) trip.likesCount = (trip.likesCount || 0) + 1;
    liked = true;
  }

  setStoredJson(LIKED_TRIPS_KEY, likedMap);
  setStoredJson(TRIPS_KEY, trips);

  return { liked, count: trip?.likesCount || 0 };
}

export function toggleHelpfulVote(tripId: string): { voted: boolean; count: number } {
  initClientStore();
  const user = getCurrentUser();
  const currentUserId = user?.id || 'guest';

  const helpfulMap = getStoredJson<Record<string, string[]>>(HELPFUL_VOTES_KEY, {});
  if (!helpfulMap[currentUserId]) helpfulMap[currentUserId] = [];

  const trips = getStoredJson<ITrip[]>(TRIPS_KEY, SEED_TRIPS);
  const trip = trips.find((t) => t.id === tripId);

  const idx = helpfulMap[currentUserId].indexOf(tripId);
  let voted = false;

  if (idx > -1) {
    helpfulMap[currentUserId].splice(idx, 1);
    if (trip && (trip.helpfulVotesCount || 0) > 0) trip.helpfulVotesCount = (trip.helpfulVotesCount || 0) - 1;
  } else {
    helpfulMap[currentUserId].push(tripId);
    if (trip) trip.helpfulVotesCount = (trip.helpfulVotesCount || 0) + 1;
    voted = true;
  }

  setStoredJson(HELPFUL_VOTES_KEY, helpfulMap);
  setStoredJson(TRIPS_KEY, trips);

  return { voted, count: trip?.helpfulVotesCount || 0 };
}

// ----------------------------------------------------
// COMMENTS
// ----------------------------------------------------

export function getComments(tripId: string): IComment[] {
  initClientStore();
  const comments = getStoredJson<IComment[]>(COMMENTS_KEY, []);
  return comments.filter((c) => c.tripId === tripId);
}

export function addComment(tripId: string, content: string): IComment | null {
  initClientStore();
  const user = getCurrentUser();
  if (!user || !content.trim()) return null;

  const comments = getStoredJson<IComment[]>(COMMENTS_KEY, []);
  const newComment: IComment = {
    id: `comment_${Date.now()}`,
    tripId,
    userId: user.id,
    userName: user.name,
    userAvatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };

  comments.unshift(newComment);
  setStoredJson(COMMENTS_KEY, comments);

  return newComment;
}

// ----------------------------------------------------
// GALLERY
// ----------------------------------------------------

export function getGallery(): IGalleryItem[] {
  initClientStore();
  return getStoredJson<IGalleryItem[]>(GALLERY_KEY, SEED_GALLERY);
}

// ----------------------------------------------------
// ADMIN ACTIONS
// ----------------------------------------------------

export function adminApproveTrip(tripId: string): void {
  initClientStore();
  const trips = getStoredJson<ITrip[]>(TRIPS_KEY, SEED_TRIPS);
  const trip = trips.find((t) => t.id === tripId);
  if (trip) {
    trip.status = 'approved';
    setStoredJson(TRIPS_KEY, trips);
  }
}

export function adminRejectTrip(tripId: string): void {
  initClientStore();
  const trips = getStoredJson<ITrip[]>(TRIPS_KEY, SEED_TRIPS);
  const trip = trips.find((t) => t.id === tripId);
  if (trip) {
    trip.status = 'rejected';
    setStoredJson(TRIPS_KEY, trips);
  }
}

export function adminTogglePopularTrip(tripId: string): boolean {
  initClientStore();
  const trips = getStoredJson<ITrip[]>(TRIPS_KEY, SEED_TRIPS);
  const trip = trips.find((t) => t.id === tripId);
  if (trip) {
    trip.isPopular = !trip.isPopular;
    setStoredJson(TRIPS_KEY, trips);
    return trip.isPopular;
  }
  return false;
}

export function adminToggleVerifyTrip(tripId: string): boolean {
  initClientStore();
  const trips = getStoredJson<ITrip[]>(TRIPS_KEY, SEED_TRIPS);
  const trip = trips.find((t) => t.id === tripId);
  if (trip) {
    trip.isVerified = !trip.isVerified;
    setStoredJson(TRIPS_KEY, trips);
    return trip.isVerified;
  }
  return false;
}

export function adminTogglePopularDestination(destinationId: string): boolean {
  initClientStore();
  const dests = getStoredJson<IDestination[]>(DESTINATIONS_KEY, SEED_DESTINATIONS);
  const dest = dests.find((d) => d.id === destinationId);
  if (dest) {
    dest.isPopular = !dest.isPopular;
    setStoredJson(DESTINATIONS_KEY, dests);
    return dest.isPopular;
  }
  return false;
}

export function getCurrencyRate(): number {
  return getStoredJson<number>(CURRENCY_RATE_KEY, 130);
}

export function setCurrencyRate(rate: number): void {
  setStoredJson(CURRENCY_RATE_KEY, rate);
}
