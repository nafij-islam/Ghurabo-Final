import mongoose from 'mongoose';
import dns from 'dns';
import { SEED_DESTINATIONS, SEED_GALLERY, SEED_REVIEWS, SEED_TRIPS, SEED_USERS } from '../seedData';
import { IDestination, IGalleryItem, IReview, ITrip, IUser } from '@/types';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
  var memoryDb: {
    users: IUser[];
    destinations: IDestination[];
    trips: ITrip[];
    gallery: IGalleryItem[];
    reviews: IReview[];
    drafts: ITrip[];
    pendingApprovals: ITrip[];
  } | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

// In-Memory fallback database when MONGODB_URI is not provided
if (!global.memoryDb) {
  global.memoryDb = {
    users: [],
    destinations: [...SEED_DESTINATIONS],
    trips: [],
    gallery: [],
    reviews: [],
    drafts: [],
    pendingApprovals: []
  };
}

export async function connectToDatabase() {
  if (MONGODB_URI) {
    if (cached?.conn) {
      return cached.conn;
    }
    if (!cached?.promise) {
      cached!.promise = mongoose.connect(MONGODB_URI, {
        bufferCommands: false,
        family: 4,
      }).then((m) => m);
    }
    try {
      cached!.conn = await cached!.promise;
      return cached!.conn;
    } catch (e) {
      cached!.promise = null;
      console.warn('MongoDB Connection Warning: Falling back to in-memory store.', e);
    }
  }
  return null;
}

export function getMemoryDb() {
  return global.memoryDb!;
}
