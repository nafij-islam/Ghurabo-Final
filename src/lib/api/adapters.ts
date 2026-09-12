/**
 * Data Model Adapters: Transform real Backend entities into frontend interfaces
 * Ensures 100% compatibility with existing React components without visual changes.
 */

import {
  BackendUser,
  BackendUserPublicProfile,
  BackendDestination,
  BackendTrip,
  BackendComment,
  BackendGalleryItem,
} from './api.types';
import {
  IUser,
  IDestination,
  ITrip,
  IComment,
  IGalleryItem,
  TravelType,
  CategoryType,
  UserRole,
  TripStatus,
  CurrencyCode,
  LanguageCode,
  IItineraryDay,
  ITripCost,
} from '@/types';

export function normalizeTravelType(backendType?: string): TravelType {
  const upper = (backendType || '').toUpperCase();
  if (upper === 'COUPLE') return 'Couple';
  if (upper === 'FAMILY') return 'Family';
  if (upper === 'GROUP') return 'Group';
  return 'Solo';
}

export function toBackendTravelType(frontendType?: string): 'SOLO' | 'COUPLE' | 'FAMILY' | 'GROUP' {
  const upper = (frontendType || '').toUpperCase();
  if (upper === 'COUPLE') return 'COUPLE';
  if (upper === 'FAMILY') return 'FAMILY';
  if (upper === 'GROUP') return 'GROUP';
  return 'SOLO';
}

export function normalizeCategory(backendCat?: string): CategoryType {
  const upper = (backendCat || '').toUpperCase();
  if (upper === 'MOUNTAIN') return 'Mountain';
  if (upper === 'ISLAND') return 'Island';
  if (upper === 'RESORT') return 'Resort';
  if (upper === 'HISTORICAL') return 'Historical';
  if (upper === 'CITY') return 'City';
  return 'Beach';
}

export function adaptBackendUserToIUser(user: BackendUser | null | undefined): IUser | null {
  if (!user) return null;
  const role: UserRole = user.role === 'ADMIN' ? 'admin' : 'traveller';
  const avatarUrl =
    user.avatar?.url ||
    `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400`;

  return {
    _id: user._id,
    id: user._id,
    name: user.fullName || user.username || 'Explorer',
    email: user.email,
    role,
    authProvider: user.authProvider === 'GOOGLE' ? 'google' : 'local',
    avatar: avatarUrl,
    coverImage:
      user.coverImage?.url ||
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
    bio: user.bio || '',
    location: user.location || 'Dhaka, Bangladesh',
    preferredStyle: normalizeTravelType(user.travelStyle),
    preferredCurrency: (user.preferredCurrency === 'USD' ? 'USD' : 'BDT') as CurrencyCode,
    preferredLanguage: (user.preferredLanguage === 'BN' ? 'bn' : 'en') as LanguageCode,
    visitedCount: 1,
    followersCount: 0,
    followingCount: 0,
    totalHelpfulVotes: 0,
    badges: user.role === 'ADMIN' ? ['Platform Admin'] : ['Community Explorer'],
    createdAt: user.createdAt || new Date().toISOString(),
  };
}

export function adaptBackendPublicProfileToIUser(profile: BackendUserPublicProfile): IUser {
  return {
    _id: profile.id,
    id: profile.id,
    name: profile.fullName || profile.username,
    email: `${profile.username}@ghurabo.com`,
    role: 'traveller',
    avatar:
      profile.avatar?.url ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
    coverImage:
      profile.coverImage?.url ||
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
    bio: profile.bio || '',
    location: profile.location || 'Dhaka, Bangladesh',
    preferredStyle: normalizeTravelType(profile.travelStyle),
    preferredCurrency: 'BDT',
    preferredLanguage: (profile.preferredLanguage === 'BN' ? 'bn' : 'en') as LanguageCode,
    visitedCount: 1,
    followersCount: profile.stats?.followersCount ?? profile.followersCount ?? 0,
    followingCount: profile.stats?.followingCount ?? profile.followingCount ?? 0,
    totalHelpfulVotes: 0,
    badges: ['Community Explorer'],
    createdAt: profile.createdAt || new Date().toISOString(),
  };
}

export function adaptBackendDestinationToIDestination(dest: BackendDestination): IDestination {
  const imageUrl =
    dest.coverImage?.url ||
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80';

  const dailyCost = dest.averageDailyCostBDT || 3500;

  return {
    _id: dest._id,
    id: dest._id,
    name: dest.name,
    slug: dest.slug,
    country: dest.country,
    division: dest.city || 'Chittagong',
    category: normalizeCategory(dest.category),
    image: imageUrl,
    heroImage: imageUrl,
    description: dest.description || dest.summary,
    bestVisitingTime: dest.bestTimeToVisit || 'October to March',
    avgCostSolo: dailyCost,
    avgCostCouple: Math.round(dailyCost * 1.8),
    avgCostFamily: Math.round(dailyCost * 3.2),
    avgCostGroup: Math.round(dailyCost * 4.5),
    avgDurationDays: 3,
    transportInfo: `${dest.name} is accessible by direct highway bus, scenic train routes, or regional flights to nearest hubs.`,
    safetyTips: dest.weather ? `Current conditions: ${dest.weather}. Always respect local wildlife and regional guides.` : 'Carry local identification and follow indigenous community guidelines.',
    totalTrips: 1,
    avgRating: 4.9,
    isPopular: dest.isFeatured,
  };
}

const DEFAULT_TRIP_COVERS = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=1200',
];

function isCleanImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:') || trimmed === '') return false;
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/');
}

function resolveValidCoverImage(trip: BackendTrip): string {
  if (isCleanImageUrl(trip.coverImage?.url)) {
    return trip.coverImage!.url;
  }
  if (Array.isArray(trip.photos)) {
    const validPhoto = trip.photos.find((p) => isCleanImageUrl(p?.url));
    if (validPhoto?.url) {
      return validPhoto.url;
    }
  }
  const key = trip.title || trip.destination?.name || 'Ghurabo';
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash + key.charCodeAt(i)) % DEFAULT_TRIP_COVERS.length;
  return DEFAULT_TRIP_COVERS[hash];
}

export function adaptBackendTripToITrip(trip: BackendTrip): ITrip {
  const authorName = trip.author?.fullName || trip.author?.username || 'Ghurabo Explorer';
  const authorAvatar =
    isCleanImageUrl(trip.author?.avatar?.url)
      ? trip.author!.avatar!.url
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80';

  const coverImageUrl = resolveValidCoverImage(trip);

  const costs = trip.costs || {
    transport: 0,
    lodging: 0,
    food: 0,
    sightseeing: 0,
    activities: 0,
    miscellaneous: 0,
    total: 0,
  };

  const travellersCount = 1;
  const totalCost = costs.total || (costs.transport + costs.lodging + costs.food + costs.sightseeing + costs.activities + costs.miscellaneous);
  const perPersonCost = Math.round(totalCost / travellersCount);

  const costBreakdown: ITripCost = {
    transport: costs.transport || 0,
    hotel: costs.lodging || 0,
    food: costs.food || 0,
    localTransport: costs.sightseeing || 0,
    tickets: costs.activities || 0,
    guide: 0,
    shopping: 0,
    misc: costs.miscellaneous || 0,
    totalCost,
    perPersonCost,
  };

  const itinerary: IItineraryDay[] = (trip.itinerary || []).map((day, idx) => ({
    dayNumber: day.day || idx + 1,
    title: day.title || `Day ${day.day}`,
    activities: [day.description || 'Day exploration'],
    locations: (day.locations || []).map((loc) => loc.name),
    estimatedCost: Math.round(totalCost / Math.max(1, trip.days || 1)),
  }));

  const destinationName = trip.destination?.name || 'Bangladesh';
  const destinationId = trip.destination?._id || '';

  const status: TripStatus = (trip.status ? trip.status.toLowerCase() : 'approved') as TripStatus;

  // Extract coordinates from itinerary or destination
  const firstLocation = trip.itinerary?.[0]?.locations?.[0];
  const latitude = firstLocation?.latitude || trip.destination?.coordinates?.latitude || 23.3822;
  const longitude = firstLocation?.longitude || trip.destination?.coordinates?.longitude || 92.2938;

  return {
    _id: trip._id,
    id: trip._id,
    title: trip.title,
    slug: trip.slug,
    userId: trip.author?._id || '',
    userName: authorName,
    authorUsername: trip.author?.username || '',
    userAvatar: authorAvatar,
    destinationId,
    destinationName,
    travelDate: trip.publishedAt ? trip.publishedAt.split('T')[0] : (trip.createdAt ? trip.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
    travelType: normalizeTravelType(trip.travelType),
    travellersCount,
    durationDays: trip.days || 3,
    summary: trip.summary || '',
    story: trip.story || '',
    highlights: [destinationName, `${trip.days || 3} Days Tour`, `${normalizeTravelType(trip.travelType)} Adventure`],
    tips: 'Pack light, respect local culture, and book transport in advance.',
    safetyNotes: 'Local guides recommended for remote hill trekking.',
    coverImage: coverImageUrl,
    images: (trip.photos || []).map((p, idx) => ({
      url: isCleanImageUrl(p.url) ? p.url : DEFAULT_TRIP_COVERS[idx % DEFAULT_TRIP_COVERS.length],
      caption: p.caption,
      publicId: p.publicId,
    })),
    costBreakdown,
    itinerary,
    status,
    isVerified: !!trip.isVerified,
    isPopular: !!trip.isFeatured,
    likesCount: trip.likesCount || 0,
    savesCount: trip.savesCount || 0,
    helpfulVotesCount: trip.helpfulCount || 0,
    commentsCount: trip.commentsCount || 0,
    viewerState: trip.viewerState,
    isLiked: trip.isLiked ?? trip.viewerState?.hasLiked ?? false,
    isSaved: trip.isSaved ?? trip.viewerState?.hasSaved ?? false,
    isHelpful: trip.isHelpful ?? trip.viewerState?.hasHelpful ?? false,
    latitude,
    longitude,
    ratings: {
      overall: 4.9,
      safety: 4.8,
      cleanliness: 4.9,
      transport: 4.7,
      accommodation: 4.8,
      food: 4.9,
      value: 5.0,
    },
    createdAt: trip.createdAt || new Date().toISOString(),
    updatedAt: trip.updatedAt,
  };
}

export function adaptBackendCommentToIComment(comment: BackendComment): IComment {
  return {
    _id: comment._id,
    id: comment._id,
    tripId: comment.trip,
    userId: (comment.author as any)?._id || (comment.author as any)?.id || '',
    userName: comment.author?.fullName || comment.author?.username || 'Traveler',
    authorUsername: comment.author?.username || '',
    userAvatar:
      comment.author?.avatar?.url ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
    content: comment.content,
    parentId: comment.parentComment || undefined,
    createdAt: comment.createdAt,
  };
}

export function adaptBackendGalleryToIGalleryItem(item: BackendGalleryItem): IGalleryItem {
  return {
    id: item.publicId || `gal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    url: item.url,
    caption: item.caption,
    tripId: item.tripId,
    tripTitle: item.tripTitle || 'Community Trip',
    tripSlug: item.tripSlug || '',
    destinationName: item.destination?.name || 'Bangladesh',
    travelType: normalizeTravelType(item.travelType),
    photographerName: item.author?.fullName || item.author?.username || 'Community Photographer',
    photographerAvatar:
      item.author?.avatar?.url ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
    photographerId: item.author?._id || item.author?.username || '',
    likesCount: 0,
    createdAt: item.createdAt,
  };
}
