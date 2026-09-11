/**
 * Backend API Type Definitions matching OpenAPI 3.0.3 specification
 */

export interface StandardResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  meta: PaginationMeta;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface BackendImage {
  url: string;
  publicId?: string;
  caption?: string;
}

export interface BackendUser {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  authProvider: 'LOCAL' | 'GOOGLE';
  avatar?: BackendImage;
  coverImage?: BackendImage;
  bio?: string;
  location?: string;
  travelStyle?: string;
  preferredCurrency?: string;
  preferredLanguage?: string;
  accountStatus?: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendUserPublicProfile {
  id: string;
  fullName: string;
  username: string;
  avatar?: BackendImage;
  coverImage?: BackendImage;
  bio?: string;
  location?: string;
  travelStyle?: string;
  preferredLanguage?: string;
  createdAt?: string;
}

export interface BackendDestination {
  _id: string;
  name: string;
  slug: string;
  country: string;
  city?: string;
  category: 'BEACH' | 'MOUNTAIN' | 'ISLAND' | 'RESORT' | 'HISTORICAL' | 'CITY' | 'OTHER';
  summary: string;
  description: string;
  bestTimeToVisit?: string;
  weather?: string;
  averageDailyCostBDT: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  coverImage?: BackendImage;
  gallery?: BackendImage[];
  isFeatured: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendTripCosts {
  transport: number;
  lodging: number;
  food: number;
  sightseeing: number;
  activities: number;
  miscellaneous: number;
  total: number;
}

export interface BackendItineraryLocation {
  name: string;
  latitude?: number;
  longitude?: number;
}

export interface BackendItineraryDay {
  day: number;
  title: string;
  description: string;
  locations?: BackendItineraryLocation[];
}

export interface BackendTrip {
  _id: string;
  title: string;
  slug: string;
  destination: BackendDestination;
  author: BackendUser;
  summary: string;
  story: string;
  travelType: 'SOLO' | 'COUPLE' | 'FAMILY' | 'GROUP';
  days: number;
  nights: number;
  costs: BackendTripCosts;
  itinerary: BackendItineraryDay[];
  coverImage?: BackendImage;
  photos?: BackendImage[];
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  isVerified: boolean;
  isFeatured: boolean;
  publishedAt?: string;
  likesCount: number;
  savesCount: number;
  helpfulCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface TripStats {
  total: number;
  approved: number;
  pending: number;
  suspended: number;
  rejected: number;
  draft: number;
}

export interface AdminTripsResponse extends PaginatedResponse<BackendTrip> {
  stats?: TripStats;
}

export interface BackendInteractionToggleResult {
  active: boolean;
  count: number;
}

export interface BackendComment {
  _id: string;
  trip: string;
  author: BackendUserPublicProfile;
  content: string;
  parentComment?: string | null;
  status: 'ACTIVE' | 'HIDDEN' | 'DELETED';
  createdAt: string;
  updatedAt?: string;
}

export interface BackendGalleryItem {
  url: string;
  publicId?: string;
  caption?: string;
  tripId: string;
  tripTitle?: string;
  tripSlug?: string;
  travelType?: 'SOLO' | 'COUPLE' | 'FAMILY' | 'GROUP';
  author?: {
    _id: string;
    fullName: string;
    username: string;
    avatar?: BackendImage;
  };
  destination?: {
    _id: string;
    name: string;
    slug: string;
    country: string;
    city?: string;
  };
  createdAt: string;
}

export interface BackendMediaSignature {
  signature: string;
  timestamp: number;
  folder: string;
  apiKey: string;
  cloudName: string;
}

export interface BackendMediaAsset {
  _id?: string;
  owner?: string;
  cloudinaryPublicId?: string;
  publicId?: string;
  assetId?: string;
  secureUrl?: string;
  url?: string;
  caption?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  resourceType?: string;
  folder?: string;
  originalFilename?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendSystemSetting {
  _id: string;
  key: string;
  value: string;
  description?: string;
  updatedAt?: string;
}
