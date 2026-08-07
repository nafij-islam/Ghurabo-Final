import mongoose, { Schema, model, models } from 'mongoose';

// User Schema
const UserSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleUid: { type: String },
    avatar: { type: String },
    coverImage: { type: String },
    role: { type: String, enum: ['traveller', 'admin'], default: 'traveller', index: true },
    bio: { type: String },
    location: { type: String },
    preferredStyle: { type: String, default: 'Solo' },
    preferredCurrency: { type: String, enum: ['BDT', 'USD'], default: 'BDT' },
    preferredLanguage: { type: String, enum: ['en', 'bn'], default: 'en' },
    visitedCount: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    totalHelpfulVotes: { type: Number, default: 0 },
    badges: [{ type: String }],
  },
  { timestamps: true }
);

UserSchema.index({ email: 1, role: 1 });

// Destination Schema
const DestinationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    country: { type: String, required: true },
    division: { type: String },
    category: { type: String, required: true, index: true },
    image: { type: String, required: true },
    heroImage: { type: String },
    description: { type: String, required: true },
    bestVisitingTime: { type: String },
    avgCostSolo: { type: Number, default: 120 },
    avgCostCouple: { type: Number, default: 250 },
    avgCostFamily: { type: Number, default: 450 },
    avgCostGroup: { type: Number, default: 600 },
    avgDurationDays: { type: Number, default: 3 },
    transportInfo: { type: String },
    safetyTips: { type: String },
    totalTrips: { type: Number, default: 0 },
    avgRating: { type: Number, default: 4.8 },
    isPopular: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

DestinationSchema.index({ isPopular: -1, createdAt: -1 });

// Trip Schema
const TripSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    destinationId: { type: String, required: true, index: true },
    destinationName: { type: String, required: true, index: true },
    travelDate: { type: String },
    travelType: { type: String, enum: ['Solo', 'Couple', 'Family', 'Group'], default: 'Solo', index: true },
    travellersCount: { type: Number, default: 1 },
    durationDays: { type: Number, default: 3 },
    summary: { type: String, required: true },
    story: { type: String, required: true },
    highlights: [{ type: String }],
    challenges: { type: String },
    tips: { type: String },
    safetyNotes: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    googlePlaceId: { type: String },
    coverImage: { type: String, required: true },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        caption: { type: String },
      },
    ],
    costBreakdown: {
      transport: { type: Number, default: 0 },
      hotel: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      localTransport: { type: Number, default: 0 },
      tickets: { type: Number, default: 0 },
      guide: { type: Number, default: 0 },
      shopping: { type: Number, default: 0 },
      misc: { type: Number, default: 0 },
      totalCost: { type: Number, default: 0 },
      perPersonCost: { type: Number, default: 0 },
    },
    itinerary: [
      {
        dayNumber: { type: Number },
        title: { type: String },
        activities: [{ type: String }],
        locations: [{ type: String }],
        estimatedCost: { type: Number },
      },
    ],
    status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected'], default: 'pending', index: true },
    isVerified: { type: Boolean, default: false, index: true },
    isPopular: { type: Boolean, default: false, index: true },
    likesCount: { type: Number, default: 0 },
    savesCount: { type: Number, default: 0 },
    helpfulVotesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    ratings: {
      overall: { type: Number, default: 4.8 },
      safety: { type: Number, default: 4.8 },
      cleanliness: { type: Number, default: 4.5 },
      transport: { type: Number, default: 4.7 },
      accommodation: { type: Number, default: 4.8 },
      food: { type: Number, default: 4.8 },
      value: { type: Number, default: 4.9 },
    },
  },
  { timestamps: true }
);

TripSchema.index({ slug: 1, status: 1 });
TripSchema.index({ status: 1, createdAt: -1 });
TripSchema.index({ status: 1, isPopular: -1 });
TripSchema.index({ userId: 1, status: 1 });
TripSchema.index({ destinationName: 1, status: 1 });

// SavedTrip Schema
const SavedTripSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    tripId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);
SavedTripSchema.index({ userId: 1, tripId: 1 }, { unique: true });

// TripLike Schema
const TripLikeSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    tripId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);
TripLikeSchema.index({ userId: 1, tripId: 1 }, { unique: true });

// HelpfulVote Schema
const HelpfulVoteSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    tripId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);
HelpfulVoteSchema.index({ userId: 1, tripId: 1 }, { unique: true });

// Comment Schema
const CommentSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    tripId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    content: { type: String, required: true },
  },
  { timestamps: true }
);
CommentSchema.index({ tripId: 1, createdAt: -1 });

// Review Schema
const ReviewSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    tripId: { type: String, required: true, index: true },
    destinationId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    overallRating: { type: Number, required: true },
    ratings: {
      safety: Number,
      cleanliness: Number,
      transport: Number,
      accommodation: Number,
      food: Number,
      value: Number,
    },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

// Gallery Schema
const GallerySchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    url: { type: String, required: true },
    caption: { type: String },
    tripId: { type: String, required: true, index: true },
    tripTitle: { type: String, required: true },
    tripSlug: { type: String, required: true },
    destinationName: { type: String, required: true, index: true },
    travelType: { type: String, required: true, index: true },
    photographerName: { type: String, required: true },
    photographerAvatar: { type: String },
    photographerId: { type: String, required: true, index: true },
    likesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

GallerySchema.index({ createdAt: -1 });

// System Config Schema
const SystemConfigSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    adminPasscode: { type: String, default: 'ghurabo123' },
    exchangeRateUSDToBDT: { type: Number, default: 130 },
    exchangeRateMode: { type: String, enum: ['automatic', 'manual'], default: 'manual' },
    lastFetchedAt: { type: Date },
  },
  { timestamps: true }
);

export const UserModel = models.User || model('User', UserSchema);
export const DestinationModel = models.Destination || model('Destination', DestinationSchema);
export const TripModel = models.Trip || model('Trip', TripSchema);
export const SavedTripModel = models.SavedTrip || model('SavedTrip', SavedTripSchema);
export const TripLikeModel = models.TripLike || model('TripLike', TripLikeSchema);
export const HelpfulVoteModel = models.HelpfulVote || model('HelpfulVote', HelpfulVoteSchema);
export const CommentModel = models.Comment || model('Comment', CommentSchema);
export const ReviewModel = models.Review || model('Review', ReviewSchema);
export const GalleryModel = models.Gallery || model('Gallery', GallerySchema);
export const SystemConfigModel = models.SystemConfig || model('SystemConfig', SystemConfigSchema);
