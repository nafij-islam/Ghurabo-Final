export type UserRole = 'traveller' | 'admin';
export type TravelType = 'Solo' | 'Couple' | 'Family' | 'Group';
export type TripStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type CategoryType = 'Beach' | 'Mountain' | 'Resort' | 'Historical' | 'City' | 'Island';
export type CurrencyCode = 'BDT' | 'USD';
export type LanguageCode = 'en' | 'bn';

export interface IUser {
  _id?: string;
  id: string;
  name: string;
  email: string;
  avatar?: string;
  coverImage?: string;
  role: UserRole;
  bio?: string;
  location?: string;
  preferredStyle?: TravelType;
  preferredCurrency?: CurrencyCode;
  preferredLanguage?: LanguageCode;
  visitedCount?: number;
  followersCount?: number;
  followingCount?: number;
  totalHelpfulVotes?: number;
  badges?: string[];
  createdAt: string;
}

export interface IDestination {
  _id?: string;
  id: string;
  name: string;
  slug: string;
  country: string;
  division?: string;
  category: CategoryType;
  image: string;
  heroImage?: string;
  description: string;
  bestVisitingTime: string;
  avgCostSolo: number;
  avgCostCouple: number;
  avgCostFamily: number;
  avgCostGroup: number;
  avgDurationDays: number;
  transportInfo: string;
  safetyTips: string;
  totalTrips: number;
  avgRating: number;
  isPopular?: boolean;
}

export interface IItineraryDay {
  dayNumber: number;
  title: string;
  activities: string[];
  locations: string[];
  estimatedCost: number;
}

export interface ITripCost {
  transport: number;
  hotel: number;
  food: number;
  localTransport: number;
  tickets: number;
  guide: number;
  shopping: number;
  misc: number;
  totalCost: number;
  perPersonCost: number;
}

export interface ITripImage {
  url: string;
  publicId?: string;
  caption?: string;
}

export interface ITrip {
  _id?: string;
  id: string;
  title: string;
  slug: string;
  userId: string;
  userName: string;
  userAvatar: string;
  destinationId: string;
  destinationName: string;
  travelDate: string;
  travelType: TravelType;
  travellersCount: number;
  durationDays: number;
  summary: string;
  story: string;
  highlights: string[];
  challenges?: string;
  tips?: string;
  safetyNotes?: string;
  coverImage: string;
  images: ITripImage[];
  costBreakdown: ITripCost;
  itinerary: IItineraryDay[];
  status: TripStatus;
  isVerified: boolean;
  isPopular?: boolean;
  likesCount: number;
  savesCount: number;
  helpfulVotesCount: number;
  commentsCount: number;
  ratings: {
    overall: number;
    safety: number;
    cleanliness: number;
    transport: number;
    accommodation: number;
    food: number;
    value: number;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface IReview {
  _id?: string;
  id: string;
  tripId: string;
  destinationId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  overallRating: number;
  ratings: {
    safety: number;
    cleanliness: number;
    transport: number;
    accommodation: number;
    food: number;
    value: number;
  };
  comment: string;
  createdAt: string;
}

export interface IComment {
  _id?: string;
  id: string;
  tripId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  parentId?: string;
  replies?: IComment[];
  createdAt: string;
}

export interface IGalleryItem {
  id: string;
  url: string;
  caption?: string;
  tripId: string;
  tripTitle: string;
  tripSlug: string;
  destinationName: string;
  travelType: TravelType;
  photographerName: string;
  photographerAvatar: string;
  photographerId: string;
  likesCount: number;
  createdAt: string;
}
