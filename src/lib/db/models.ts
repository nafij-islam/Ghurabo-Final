import mongoose, { Schema, model, models } from 'mongoose';

// User Schema
const UserSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String },
    coverImage: { type: String },
    role: { type: String, enum: ['traveller', 'admin'], default: 'traveller' },
    bio: { type: String },
    location: { type: String },
    preferredStyle: { type: String, default: 'Solo' },
    visitedCount: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    totalHelpfulVotes: { type: Number, default: 0 },
    badges: [{ type: String }],
  },
  { timestamps: true }
);

// Destination Schema
const DestinationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    country: { type: String, required: true },
    division: { type: String },
    category: { type: String, required: true },
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
  },
  { timestamps: true }
);

// Trip Schema
const TripSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    destinationId: { type: String, required: true },
    destinationName: { type: String, required: true },
    travelDate: { type: String },
    travelType: { type: String, enum: ['Solo', 'Couple', 'Family', 'Group'], default: 'Solo' },
    travellersCount: { type: Number, default: 1 },
    durationDays: { type: Number, default: 3 },
    summary: { type: String, required: true },
    story: { type: String, required: true },
    highlights: [{ type: String }],
    challenges: { type: String },
    tips: { type: String },
    safetyNotes: { type: String },
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
    status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected'], default: 'pending' },
    isVerified: { type: Boolean, default: false },
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

// Review Schema
const ReviewSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    tripId: { type: String, required: true },
    destinationId: { type: String, required: true },
    userId: { type: String, required: true },
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
    id: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    caption: { type: String },
    tripId: { type: String, required: true },
    tripTitle: { type: String, required: true },
    tripSlug: { type: String, required: true },
    destinationName: { type: String, required: true },
    travelType: { type: String, required: true },
    photographerName: { type: String, required: true },
    photographerAvatar: { type: String },
    photographerId: { type: String, required: true },
    likesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const UserModel = models.User || model('User', UserSchema);
export const DestinationModel = models.Destination || model('Destination', DestinationSchema);
export const TripModel = models.Trip || model('Trip', TripSchema);
export const ReviewModel = models.Review || model('Review', ReviewSchema);
export const GalleryModel = models.Gallery || model('Gallery', GallerySchema);
